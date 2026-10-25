/**
 * A small, strict PDF reader for tests. It knows nothing about pdf-lib or about the tool: it
 * parses the bytes it is given (header, cross-reference table, trailer, page tree, each page's
 * MediaBox, image and placement) so a test can check the FILE, not the code that wrote it.
 * Written for the simple files the tool produces (classic xref table, no object streams).
 */
import crypto from "node:crypto";
import zlib from "node:zlib";

const latin1 = (bytes) => Buffer.from(bytes.buffer, bytes.byteOffset, bytes.length).toString("latin1");

/* [a b c d e f] x [a b c d e f], in PDF order (m is applied first, then n) */
function multiply(m, n) {
    return [
        m[0] * n[0] + m[1] * n[2], m[0] * n[1] + m[1] * n[3],
        m[2] * n[0] + m[3] * n[2], m[2] * n[1] + m[3] * n[3],
        m[4] * n[0] + m[5] * n[2] + n[4], m[4] * n[1] + m[5] * n[3] + n[5]
    ];
}

export function parsePdf(bytes) {

    const text = latin1(bytes);

    if (!/^%PDF-1\.\d/.test(text)) throw new Error("no %PDF-1.x header");

    const tail = text.slice(-64);
    const start = /startxref\s+(\d+)\s+%%EOF\s*$/.exec(tail);

    if (!start) throw new Error("no startxref / %%EOF at the end");

    const xrefAt = Number(start[1]);

    if (text.slice(xrefAt, xrefAt + 4) !== "xref") throw new Error("startxref does not point at 'xref'");

    const section = /^xref\s+(\d+)\s+(\d+)\s*\n/.exec(text.slice(xrefAt));

    if (!section) throw new Error("bad xref section header");

    const first = Number(section[1]);
    const count = Number(section[2]);
    const rows = text.slice(xrefAt + section[0].length).split("\n").slice(0, count);
    const offsets = new Map();

    rows.forEach((row, n) => {

        const m = /^(\d{10}) (\d{5}) ([nf])/.exec(row);

        if (!m) throw new Error(`bad xref row ${n}: ${JSON.stringify(row)}`);

        if (m[3] === "n") offsets.set(first + n, Number(m[1]));

    });

    const trailer = /trailer\s*<<([\s\S]*?)>>\s*startxref/.exec(text.slice(xrefAt));

    if (!trailer) throw new Error("no trailer");

    const size = Number(/\/Size\s+(\d+)/.exec(trailer[1])[1]);

    if (size !== first + count) throw new Error(`trailer /Size ${size} != xref entries ${first + count}`);

    const rootRef = Number(/\/Root\s+(\d+) 0 R/.exec(trailer[1])[1]);

    /* every in-use object starts exactly where the table says */
    const objects = new Map();

    for (const [num, off] of offsets) {

        const head = new RegExp(`^${num} 0 obj`).exec(text.slice(off, off + 24));

        if (!head) throw new Error(`xref offset for object ${num} does not point at '${num} 0 obj'`);

        const end = text.indexOf("endobj", off);

        if (end < 0) throw new Error(`object ${num} has no endobj`);

        objects.set(num, { off, body: text.slice(off, end) });

    }

    const obj = (num) => {
        const o = objects.get(num);
        if (!o) throw new Error(`missing object ${num}`);
        return o;
    };

    const streamOf = (num) => {

        const o = obj(num);
        const length = Number(/\/Length\s+(\d+)/.exec(o.body)[1]);
        let s = o.off + o.body.indexOf("stream") + 6;

        if (text[s] === "\r") s += 1;
        if (text[s] === "\n") s += 1;

        if (!text.slice(s + length, s + length + 12).includes("endstream")) throw new Error(`object ${num}: /Length does not end at endstream`);

        return bytes.subarray(s, s + length);

    };

    const catalog = obj(rootRef).body;
    const pagesRef = Number(/\/Pages\s+(\d+) 0 R/.exec(catalog)[1]);
    const tree = obj(pagesRef).body;
    const kids = [...(/\/Kids\s*\[([^\]]*)\]/.exec(tree)[1]).matchAll(/(\d+) 0 R/g)].map((m) => Number(m[1]));
    const declared = Number(/\/Count\s+(\d+)/.exec(tree)[1]);

    if (declared !== kids.length) throw new Error(`/Count ${declared} but ${kids.length} kids`);

    const pages = kids.map((pageNum) => {

        const body = obj(pageNum).body;

        if (!/\/Type\s*\/Page(?![s\w])/.test(body)) throw new Error(`object ${pageNum} is not a page`);

        const box = /\/MediaBox\s*\[\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s*\]/.exec(body);
        const mediaBox = [Number(box[3]) - Number(box[1]), Number(box[4]) - Number(box[2])];

        /* resources may be inline or a reference */
        let resources = body;
        const ref = /\/Resources\s+(\d+) 0 R/.exec(body);

        if (ref) resources = obj(Number(ref[1])).body;

        const xo = /\/XObject\s*<<([\s\S]*?)>>/.exec(resources);
        const imageNum = Number(/\/[^\s/<>]+\s+(\d+) 0 R/.exec(xo[1])[1]);
        const image = obj(imageNum).body;

        if (!/\/Subtype\s*\/Image/.test(image)) throw new Error(`object ${imageNum} is not an image`);

        const data = streamOf(imageNum);

        const contents = /\/Contents\s*(?:\[\s*)?(\d+) 0 R/.exec(body);
        let content = Buffer.from(streamOf(Number(contents[1])));

        if (/\/FlateDecode/.test(obj(Number(contents[1])).body)) content = zlib.inflateSync(content);

        /* the transformation in force when the image is painted: every "cm" before "Do", composed (PDF applies each new matrix first) */
        const ops = content.toString("latin1");
        const before = ops.slice(0, ops.indexOf(" Do"));
        let ctm = [1, 0, 0, 1, 0, 0];

        for (const m of before.matchAll(/([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+) cm/g)) {
            ctm = multiply(m.slice(1, 7).map(Number), ctm);
        }

        return {
            mediaBox,
            image: {
                width: Number(/\/Width\s+(\d+)/.exec(image)[1]),
                height: Number(/\/Height\s+(\d+)/.exec(image)[1]),
                filter: /\/Filter\s*\/(\w+)/.exec(image)?.[1],
                sha256: crypto.createHash("sha256").update(data).digest("hex")
            },
            placement: { width: ctm[0], height: ctm[3], x: ctm[4], y: ctm[5] }
        };

    });

    return {
        pages,
        objectCount: offsets.size,
        hasProducer: /\/Producer/.test(text),
        hasCreationDate: /\/CreationDate/.test(text),
        mentionsLibrary: /pdf-lib/i.test(text)
    };

}
