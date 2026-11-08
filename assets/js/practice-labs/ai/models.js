/* =========================================================
   ToolZen Hub
   AI visualizers: teaching models (pure, deterministic, no network, no downloaded model)

   These illustrate how language-model systems behave; none of them is a real model, and every page that uses them says
   so. They are exact for what they claim: the softmax, top-p, cosine similarity and the classification metrics are the
   real formulas, applied to small fixed inputs written for teaching.
========================================================= */

/* ---------- a simplified tokenizer: spaces attach to the next word; words longer than 4 letters split into 4-letter
   pieces; digits and punctuation are separate. Real tokenizers (BPE and others) learn their pieces from data. */
export function tokenize(text) {
    const tokens = [];
    for (const m of String(text ?? "").matchAll(/(\s*)([A-Za-z]+|\d|[^\sA-Za-z\d])/g)) {
        const [, space, body] = m;
        if (/^[A-Za-z]+$/.test(body) && body.length > 4) {
            for (let i = 0; i < body.length; i += 4) tokens.push((i === 0 ? space : "") + body.slice(i, i + 4));
        } else {
            tokens.push(space + body);
        }
    }
    return tokens;
}

/* ---------- context window budget ---------- */
export function contextBudget({ window, system, document, question, output }) {
    const used = system + document + question + output;
    const overflow = Math.max(0, used - window);
    return { used, free: Math.max(0, window - used), fits: overflow === 0, overflow, documentAllowed: Math.max(0, window - system - question - output) };
}

/* ---------- next-token sampling over a fixed distribution ---------- */
export const NEXT_TOKEN = Object.freeze({
    prompt: "The capital of France is",
    candidates: [["Paris", 6.0], ["a", 3.2], ["the", 3.0], ["Lyon", 1.6], ["beautiful", 1.2], ["Berlin", 0.4]]
});

export function sampling({ temperature, topP }, dist = NEXT_TOKEN) {
    const t = Math.max(temperature, 0.01);
    const exps = dist.candidates.map(([token, logit]) => [token, Math.exp(logit / t)]);
    const sum = exps.reduce((s, [, e]) => s + e, 0);
    const probs = exps.map(([token, e]) => ({ token, p: e / sum })).sort((a, b) => b.p - a.p);
    let cumulative = 0;
    for (const item of probs) { item.kept = cumulative < topP; cumulative += item.p; }
    const keptSum = probs.filter((i) => i.kept).reduce((s, i) => s + i.p, 0);
    for (const item of probs) item.pAfter = item.kept ? item.p / keptSum : 0;
    return probs;
}

/* ---------- retrieval with toy embeddings (hand-made 4-dimensional vectors: shipping, refunds, account, product) ---------- */
export const DOCUMENTS = Object.freeze([
    { id: "d1", text: "Orders over ₹999 ship free; smaller orders pay ₹49 delivery.", v: [0.9, 0.1, 0.0, 0.2] },
    { id: "d2", text: "Deliveries arrive in 2 to 5 working days across India.", v: [0.95, 0.0, 0.05, 0.1] },
    { id: "d3", text: "Refunds are paid to the original payment method within 7 days.", v: [0.1, 0.95, 0.1, 0.0] },
    { id: "d4", text: "Return an unused item within 10 days for a full refund.", v: [0.2, 0.9, 0.0, 0.2] },
    { id: "d5", text: "Reset your password from the sign-in page.", v: [0.0, 0.0, 0.95, 0.05] },
    { id: "d6", text: "Your order history is under My orders once you sign in.", v: [0.2, 0.1, 0.8, 0.3] },
    { id: "d7", text: "The LED Desk Lamp has three brightness levels.", v: [0.05, 0.0, 0.0, 0.98] },
    { id: "d8", text: "The Laptop Backpack fits laptops up to 15.6 inches.", v: [0.1, 0.0, 0.0, 0.95] }
]);

export const QUERIES = Object.freeze([
    { text: "How much is shipping?", v: [0.95, 0.05, 0.0, 0.1] },
    { text: "When do I get my money back?", v: [0.05, 0.97, 0.05, 0.0] },
    { text: "I forgot my password", v: [0.0, 0.0, 1.0, 0.0] },
    { text: "Is the lamp dimmable?", v: [0.0, 0.0, 0.0, 1.0] }
]);

export const cosine = (a, b) => {
    const dot = a.reduce((s, x, i) => s + x * b[i], 0);
    const norm = (v) => Math.sqrt(v.reduce((s, x) => s + x * x, 0));
    return dot / (norm(a) * norm(b));
};

export function retrieve(queryVector, k = 3, docs = DOCUMENTS) {
    return docs.map((d) => ({ ...d, score: cosine(queryVector, d.v) })).sort((a, b) => b.score - a.score).slice(0, k);
}

/* ---------- classification: a fixed set of 20 scored examples (spam filter) ---------- */
export const SCORED = Object.freeze([
    [0.97, 1], [0.93, 1], [0.91, 1], [0.88, 0], [0.84, 1], [0.79, 1], [0.74, 0], [0.71, 1], [0.66, 1], [0.62, 0],
    [0.58, 1], [0.51, 0], [0.47, 0], [0.42, 1], [0.36, 0], [0.31, 0], [0.24, 0], [0.18, 1], [0.12, 0], [0.05, 0]
]);

export function confusion(threshold, data = SCORED) {
    let tp = 0, fp = 0, tn = 0, fn = 0;
    for (const [score, label] of data) {
        const predicted = score >= threshold ? 1 : 0;
        if (predicted && label) tp++; else if (predicted && !label) fp++; else if (!predicted && label) fn++; else tn++;
    }
    const precision = tp + fp ? tp / (tp + fp) : 0;
    const recall = tp + fn ? tp / (tp + fn) : 0;
    const accuracy = (tp + tn) / data.length;
    const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;
    return { tp, fp, tn, fn, precision, recall, accuracy, f1 };
}
