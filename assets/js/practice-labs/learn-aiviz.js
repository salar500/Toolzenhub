/* =========================================================
   ToolZen Hub
   AI visualizers (the aiviz block): tokens, context window, sampling, retrieval and a confusion matrix. Built with DOM
   methods from the pure teaching models in ai/models.js; nothing is downloaded, stored or sent, and no real model runs.
========================================================= */

import { tokenize, contextBudget, sampling, NEXT_TOKEN, retrieve, QUERIES, confusion } from "./ai/models.js";

function el(tag, attrs = {}, ...kids) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) { if (k === "class") n.className = v; else if (k.startsWith("on")) n.addEventListener(k.slice(2), v); else n.setAttribute(k, v); }
    for (const k of kids.flat()) if (k != null) n.append(k instanceof Node ? k : String(k));
    return n;
}
const pct = (x) => `${(x * 100).toFixed(1)}%`;
let uid = 0;

function slider(label, min, max, step, value, onInput) {
    const id = `aiv-${++uid}`;
    const out = el("output", { for: id }, String(value));
    const input = el("input", { id, type: "range", min, max, step, value, class: "learn-aiviz__range" });
    input.addEventListener("input", () => { out.textContent = input.value; onInput(Number(input.value)); });
    return el("div", { class: "learn-aiviz__control" }, el("label", { for: id }, `${label}: `), out, input);
}

const VIEWS = {
    tokens(root) {
        const id = `aiv-${++uid}`;
        const input = el("textarea", { id, class: "lx-textarea learn-editor learn-editor--text", rows: "3" });
        input.value = "ShopLite delivers orders over ₹999 for free.";
        const out = el("div", { class: "learn-aiviz__tokens", "aria-live": "polite" });
        const draw = () => {
            const tokens = tokenize(input.value);
            out.replaceChildren(el("p", {}, `${tokens.length} tokens for ${input.value.length} characters (${tokens.length ? (input.value.length / tokens.length).toFixed(1) : 0} characters per token).`),
                el("p", { class: "learn-aiviz__chips" }, tokens.map((t, i) => el("span", { class: `learn-aiviz__chip learn-aiviz__chip--${i % 4}` }, t.replace(/ /g, "·")))));
        };
        input.addEventListener("input", draw);
        root.append(el("label", { class: "lx-label", for: id }, "Text"), input, out);
        draw();
    },
    context(root) {
        const state = { window: 8000, system: 500, document: 6000, question: 200, output: 1000 };
        const out = el("div", { "aria-live": "polite" });
        const draw = () => {
            const b = contextBudget(state);
            const bar = el("div", { class: "learn-aiviz__bar" }, ["system", "document", "question", "output"].map((k) => el("span", { class: `learn-aiviz__seg learn-aiviz__seg--${k}`, style: `width:${Math.min(100, (state[k] / Math.max(state.window, b.used)) * 100)}%` }, k)));
            out.replaceChildren(bar, el("p", {}, b.fits ? `Fits: ${b.used} of ${state.window} tokens used, ${b.free} free.` : `Does not fit: ${b.overflow} tokens over. The document must be cut to ${b.documentAllowed} tokens, or summarised, or retrieved in parts.`));
        };
        root.append(slider("Context window", 2000, 32000, 1000, state.window, (v) => { state.window = v; draw(); }),
            slider("Document", 0, 30000, 500, state.document, (v) => { state.document = v; draw(); }),
            slider("Reserved for the answer", 0, 4000, 250, state.output, (v) => { state.output = v; draw(); }), out);
        draw();
    },
    sampling(root) {
        const state = { temperature: 1, topP: 1 };
        const out = el("div", { "aria-live": "polite" });
        const draw = () => {
            const rows = sampling(state);
            out.replaceChildren(el("table", { class: "lx-table" }, el("thead", {}, el("tr", {}, el("th", { scope: "col" }, "Next token"), el("th", { scope: "col" }, "Probability"), el("th", { scope: "col" }, "After top-p"))),
                el("tbody", {}, rows.map((r) => el("tr", {}, el("td", {}, r.token), el("td", {}, pct(r.p)), el("td", {}, r.kept ? pct(r.pAfter) : "cut"))))));
        };
        root.append(el("p", {}, `Prompt: "${NEXT_TOKEN.prompt} …"`), slider("Temperature", 0.1, 2, 0.1, 1, (v) => { state.temperature = v; draw(); }), slider("Top-p", 0.1, 1, 0.05, 1, (v) => { state.topP = v; draw(); }), out);
        draw();
    },
    retrieval(root) {
        const id = `aiv-${++uid}`;
        const select = el("select", { id, class: "lx-select" }, QUERIES.map((q, i) => el("option", { value: String(i) }, q.text)));
        const out = el("ol", { class: "learn-aiviz__results", "aria-live": "polite" });
        const draw = () => out.replaceChildren(...retrieve(QUERIES[Number(select.value)].v, 3).map((d) => el("li", {}, `${d.text} `, el("strong", {}, `similarity ${d.score.toFixed(3)}`))));
        select.addEventListener("change", draw);
        root.append(el("label", { class: "lx-label", for: id }, "Question"), select, el("p", {}, "The three most similar passages, by cosine similarity of their vectors:"), out);
        draw();
    },
    confusion(root) {
        const out = el("div", { "aria-live": "polite" });
        const draw = (t) => {
            const m = confusion(t);
            out.replaceChildren(el("table", { class: "lx-table" }, el("thead", {}, el("tr", {}, el("th", {}), el("th", { scope: "col" }, "Predicted spam"), el("th", { scope: "col" }, "Predicted not spam"))),
                el("tbody", {}, el("tr", {}, el("th", { scope: "row" }, "Actually spam"), el("td", {}, `TP ${m.tp}`), el("td", {}, `FN ${m.fn}`)), el("tr", {}, el("th", { scope: "row" }, "Actually not spam"), el("td", {}, `FP ${m.fp}`), el("td", {}, `TN ${m.tn}`)))),
                el("p", {}, `Precision ${pct(m.precision)} · Recall ${pct(m.recall)} · Accuracy ${pct(m.accuracy)} · F1 ${m.f1.toFixed(3)}`));
        };
        root.append(slider("Threshold", 0.05, 0.95, 0.05, 0.5, draw), out);
        draw(0.5);
    }
};

export function initAiViz(root = document) {
    for (const block of root.querySelectorAll("[data-aiviz]")) {
        const host = block.querySelector("[data-aiviz-root]");
        const view = VIEWS[block.dataset.aiviz];
        if (!view || !host) continue;
        host.replaceChildren();
        view(host);
    }
}
