/* =========================================================
   ToolZen Hub
   AI visualizers (the aiviz block): tokens, context window, sampling, retrieval and a confusion matrix. Built with DOM
   methods from the pure teaching models in ai/models.js; nothing is downloaded, stored or sent, and no real model runs.
========================================================= */

import { tokenize, contextBudget, sampling, NEXT_TOKEN, retrieve, QUERIES, confusion } from "./ai/models.js";
import { HOUSES, linearFit, mse, overfitTable, polyFit, WAVE, CUSTOMERS, kmeans, LOANS, splitGini } from "./ai/ml-models.js";

const SVG = "http://www.w3.org/2000/svg";
function svg(tag, attrs = {}) { const n = document.createElementNS(SVG, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v)); return n; }
/* a 320 × 200 plot with axes; returns { root, x(v), y(v) } mapping data to pixels */
function plot(label, [x0, x1], [y0, y1]) {
    const root = svg("svg", { viewBox: "0 0 320 200", class: "learn-aiviz__plot", role: "img", "aria-label": label });
    const x = (v) => 30 + ((v - x0) / (x1 - x0)) * 280, y = (v) => 180 - ((v - y0) / (y1 - y0)) * 170;
    root.append(svg("line", { x1: 30, y1: 180, x2: 310, y2: 180, class: "learn-aiviz__axis" }), svg("line", { x1: 30, y1: 10, x2: 30, y2: 180, class: "learn-aiviz__axis" }));
    return { root, x, y };
}

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
    },
    regression(root) {
        const best = linearFit(HOUSES.x, HOUSES.y);
        const state = { slope: 0.4, intercept: 10 };
        const out = el("div", { "aria-live": "polite" });
        const draw = () => {
            const p = plot("House size against price, with your line", [40, 145], [20, 100]);
            HOUSES.x.forEach((xv, i) => p.root.append(svg("circle", { cx: p.x(xv), cy: p.y(HOUSES.y[i]), r: 4, class: "learn-aiviz__dot" })));
            const line = (s, c, cls) => p.root.append(svg("line", { x1: p.x(40), y1: p.y(c + s * 40), x2: p.x(145), y2: p.y(c + s * 145), class: cls }));
            line(state.slope, state.intercept, "learn-aiviz__line");
            const yours = mse(HOUSES.x, HOUSES.y, (v) => state.intercept + state.slope * v);
            const fit = mse(HOUSES.x, HOUSES.y, (v) => best.intercept + best.slope * v);
            out.replaceChildren(p.root, el("p", {}, `Your line: price = ${state.intercept.toFixed(1)} + ${state.slope.toFixed(2)} × size. Mean squared error ${yours.toFixed(2)}. The least-squares line (${best.intercept.toFixed(2)} + ${best.slope.toFixed(3)} × size) has error ${fit.toFixed(2)}, the lowest possible for a straight line.`));
        };
        root.append(slider("Slope (₹ lakh per m²)", 0, 1.2, 0.02, state.slope, (v) => { state.slope = v; draw(); }), slider("Intercept (₹ lakh)", -20, 40, 1, state.intercept, (v) => { state.intercept = v; draw(); }), out);
        draw();
    },
    overfit(root) {
        const table = overfitTable();
        const out = el("div", { "aria-live": "polite" });
        const draw = (d) => {
            const row = table[d - 1], f = polyFit(WAVE.train.x, WAVE.train.y, d, [0, 6.2]);
            const p = plot(`Polynomial of degree ${d} fitted to training points`, [0, 6.3], [-1.6, 1.6]);
            const pts = Array.from({ length: 64 }, (_, i) => (6.2 * i) / 63).map((xv) => `${p.x(xv)},${p.y(Math.max(-1.6, Math.min(1.6, f(xv))))}`).join(" ");
            p.root.append(svg("polyline", { points: pts, class: "learn-aiviz__line", fill: "none" }));
            WAVE.train.x.forEach((xv, i) => p.root.append(svg("circle", { cx: p.x(xv), cy: p.y(WAVE.train.y[i]), r: 4, class: "learn-aiviz__dot" })));
            WAVE.test.x.forEach((xv, i) => p.root.append(svg("rect", { x: p.x(xv) - 3, y: p.y(WAVE.test.y[i]) - 3, width: 6, height: 6, class: "learn-aiviz__dot learn-aiviz__dot--test" })));
            out.replaceChildren(p.root, el("p", {}, `Degree ${d}: training error ${row.train.toFixed(4)}, test error ${row.test.toFixed(4)}. Circles are training points, squares are unseen test points.`));
        };
        root.append(slider("Polynomial degree", 1, 9, 1, 1, draw), out);
        draw(1);
    },
    kmeans(root) {
        const steps = kmeans(CUSTOMERS, [[2, 3], [3, 2], [3, 4]]);
        const out = el("div", { "aria-live": "polite" });
        const draw = (i) => {
            const s = steps[i - 1];
            const p = plot(`k-means, iteration ${i}`, [0, 13], [0, 14]);
            CUSTOMERS.forEach(([a, b], j) => p.root.append(svg("circle", { cx: p.x(a), cy: p.y(b), r: 5, class: `learn-aiviz__dot learn-aiviz__dot--k${s.assign[j]}` })));
            s.centroids.forEach(([a, b], k) => p.root.append(svg("path", { d: `M${p.x(a) - 7},${p.y(b)} h14 M${p.x(a)},${p.y(b) - 7} v14`, class: `learn-aiviz__centroid learn-aiviz__dot--k${k}` })));
            out.replaceChildren(p.root, el("p", {}, `Iteration ${i} of ${steps.length}: each customer joins the nearest centre (crosses), then each centre moves to the mean of its customers. Total squared distance: ${s.inertia.toFixed(2)}.${i === steps.length ? " The centres no longer move: the algorithm has converged." : ""}`));
        };
        root.append(el("p", {}, "Twelve customers by visits per year (across) and average basket in ₹ hundreds (up). The three starting centres were deliberately placed close together."), slider("Iteration", 1, steps.length, 1, 1, draw), out);
        draw(1);
    },
    tree(root) {
        const out = el("div", { "aria-live": "polite" });
        const draw = (t) => {
            const s = splitGini(t);
            out.replaceChildren(el("table", { class: "lx-table" }, el("thead", {}, el("tr", {}, el("th", { scope: "col" }, "Income (₹ lakh)"), ...LOANS.map(([x]) => el("th", { scope: "col" }, String(x))))),
                el("tbody", {}, el("tr", {}, el("th", { scope: "row" }, "Repaid"), ...LOANS.map(([x, y]) => el("td", { class: x <= t ? "learn-aiviz__left" : "" }, y ? "yes" : "no"))))),
                el("p", {}, `Split at income ≤ ${t}: ${s.left} applications go left (shaded), ${s.right} go right. Weighted Gini impurity ${s.impurity.toFixed(3)} (before splitting: 0.480). Lower is purer.`));
        };
        root.append(slider("Split threshold", 3, 11, 1, 4, draw), out);
        draw(4);
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
