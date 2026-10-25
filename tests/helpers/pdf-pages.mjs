/**
 * A small, strict reader of the PDFs the PDF tools write, for tests. Like pdf-structure.mjs it knows
 * nothing about pdf-lib or the tools: it checks the FILE (header, classic cross-reference table, trailer,
 * page tree) and reports each page's size, turn, text labels and annotation count, plus whether the
 * catalog has bookmarks and whether the file names a creator, a date or the library.
 * Written for files with a classic xref table and no object streams (the tools always write that).
 */
import zlib from "node:zlib";

const latin1 = (bytes) => Buffer.from(bytes.buffer, bytes.byteOffset, bytes.length).toString("latin1");

export function readPages(bytes) {

    const text = latin1(bytes);

    if (!/^%PDF-1\.\d/.test(text)) throw new Error("no %PDF-1.x header");

    const start = /startxref\s+(\d+)\s+%%EOF\s*$/.exec(text.slice(-64));

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

        if (!m) throw new Error(`bad xref row ${n}`);

        if (m[3] === "n") offsets.set(first + n, Number(m[1]));

    });

    const trailer = /trailer\s*<<([\s\S]*?)>>\s*startxref/.exec(text.slice(xrefAt));

    if (!trailer) throw new Error("no trailer");

    if (Number(/\/Size\s+(\d+)/.exec(trailer[1])[1]) !== first + count) throw new Error("trailer /Size does not match the table");

    if (/\/Encrypt/.test(trailer[1])) throw new Error("the file is encrypted");

    const objects = new Map();

    for (const [num, off] of offsets) {

        if (!new RegExp(`^${num} 0 obj`).test(text.slice(off, off + 24))) throw new Error(`xref offset for object ${num} does not point at '${num} 0 obj'`);

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

        let data = Buffer.from(bytes.subarray(s, s + length));

        if (/\/FlateDecode/.test(o.body)) data = zlib.inflateSync(data);

        return data.toString("latin1");

    };

    const rootRef = Number(/\/Root\s+(\d+) 0 R/.exec(trailer[1])[1]);
    const catalog = obj(rootRef).body;

    /* a value written on the object itself or on one of its parents (MediaBox and Rotate may be inherited) */
    const inherited = (num, key) => {

        for (let at = num, guard = 0; at && guard < 20; guard += 1) {

            const body = obj(at).body;
            const found = new RegExp(`/${key}\\s*(\\[[^\\]]*\\]|-?\\d+)`).exec(body);

            if (found) return found[1];

            const parent = /\/Parent\s+(\d+) 0 R/.exec(body);

            at = parent ? Number(parent[1]) : 0;

        }

        return null;

    };

    const leaves = (num) => {

        const body = obj(num).body;

        if (/\/Type\s*\/Pages/.test(body)) {

            const kids = [...(/\/Kids\s*\[([^\]]*)\]/.exec(body)[1]).matchAll(/(\d+) 0 R/g)].map((m) => Number(m[1]));
            const declared = Number(/\/Count\s+(\d+)/.exec(body)[1]);
            const all = kids.flatMap(leaves);

            if (all.length !== declared) throw new Error(`/Count ${declared} but ${all.length} pages below`);

            return all;

        }

        if (!/\/Type\s*\/Page(?![s\w])/.test(body)) throw new Error(`object ${num} is not a page`);

        return [num];

    };

    const pages = leaves(Number(/\/Pages\s+(\d+) 0 R/.exec(catalog)[1])).map((num) => {

        const body = obj(num).body;
        const box = /\[\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s*\]/.exec(inherited(num, "MediaBox") || "");

        if (!box) throw new Error(`page object ${num} has no MediaBox`);

        const rotate = inherited(num, "Rotate");
        const contents = /\/Contents\s*(\[[^\]]*\]|\d+ 0 R)/.exec(body);
        const refs = contents ? [...contents[1].matchAll(/(\d+) 0 R/g)].map((m) => Number(m[1])) : [];
        const stream = refs.map(streamOf).join("\n");

        const labels = [
            ...[...stream.matchAll(/<([0-9A-Fa-f\s]+)>\s*Tj/g)].map((m) => Buffer.from(m[1].replace(/\s+/g, ""), "hex").toString("latin1")),
            ...[...stream.matchAll(/\(((?:\\.|[^\\)])*)\)\s*Tj/g)].map((m) => m[1])
        ];

        const annots = /\/Annots\s*\[([^\]]*)\]/.exec(body);

        return {
            width: Number(box[3]) - Number(box[1]),
            height: Number(box[4]) - Number(box[2]),
            rotate: rotate === null ? 0 : Number(rotate),
            label: labels.join(" "),
            annotations: annots ? [...annots[1].matchAll(/\d+ 0 R/g)].length : 0
        };

    });

    return {
        pages,
        bookmarks: /\/Outlines/.test(catalog),
        hasProducer: /\/Producer/.test(text),
        hasCreationDate: /\/CreationDate/.test(text),
        mentionsLibrary: /pdf-lib/i.test(text)
    };

}
