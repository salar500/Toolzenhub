/* =========================================================
   ToolZen Hub
   Machine Learning path: teaching models (pure and deterministic). These are the real algorithms (least squares,
   polynomial fitting, k-means, Gini impurity) applied to small fixed datasets written for teaching.
========================================================= */

/* house sizes (m²) and prices (₹ lakh) */
export const HOUSES = Object.freeze({ x: [45, 60, 72, 85, 95, 110, 125, 140], y: [32, 41, 50, 55, 63, 71, 82, 90] });

export const mse = (xs, ys, predict) => xs.reduce((s, x, i) => s + (predict(x) - ys[i]) ** 2, 0) / xs.length;

export function linearFit(xs, ys) {
    const n = xs.length, mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n;
    const b = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0) / xs.reduce((s, x) => s + (x - mx) ** 2, 0);
    return { slope: b, intercept: my - b * mx };
}

/* solve A·c = v by Gaussian elimination with partial pivoting */
function solve(A, v) {
    const n = v.length, M = A.map((row, i) => [...row, v[i]]);
    for (let c = 0; c < n; c++) {
        let p = c;
        for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
        [M[c], M[p]] = [M[p], M[c]];
        for (let r = c + 1; r < n; r++) { const f = M[r][c] / M[c][c]; for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
    }
    const x = new Array(n).fill(0);
    for (let r = n - 1; r >= 0; r--) { let s = M[r][n]; for (let k = r + 1; k < n; k++) s -= M[r][k] * x[k]; x[r] = s / M[r][r]; }
    return x;
}

/* least-squares polynomial of a degree, on x scaled to [-1, 1] for numerical stability */
export function polyFit(xs, ys, degree, [lo, hi] = [Math.min(...xs), Math.max(...xs)]) {
    const z = (x) => (2 * (x - lo)) / (hi - lo) - 1;
    const d = degree + 1, A = Array.from({ length: d }, () => new Array(d).fill(0)), v = new Array(d).fill(0);
    xs.forEach((x, i) => { const p = Array.from({ length: d }, (_, k) => z(x) ** k); for (let r = 0; r < d; r++) { v[r] += p[r] * ys[i]; for (let c = 0; c < d; c++) A[r][c] += p[r] * p[c]; } });
    const coef = solve(A, v);
    return (x) => coef.reduce((s, c, k) => s + c * z(x) ** k, 0);
}

/* training and test points from y = sin(x) with fixed noise; used to show overfitting */
export const WAVE = Object.freeze({
    train: { x: [0.0, 0.7, 1.4, 2.1, 2.8, 3.5, 4.2, 4.9, 5.6, 6.2], y: [0.12, 0.55, 1.07, 0.80, 0.25, -0.43, -0.80, -1.05, -0.55, -0.12] },
    test: { x: [0.35, 1.05, 1.75, 2.45, 3.15, 3.85, 4.55, 5.25, 5.95], y: [0.30, 0.90, 0.96, 0.66, 0.02, -0.66, -1.01, -0.85, -0.33] }
});

export function overfitTable(maxDegree = 9) {
    const range = [0, 6.2];
    return Array.from({ length: maxDegree }, (_, i) => {
        const f = polyFit(WAVE.train.x, WAVE.train.y, i + 1, range);
        return { degree: i + 1, train: mse(WAVE.train.x, WAVE.train.y, f), test: mse(WAVE.test.x, WAVE.test.y, f) };
    });
}

/* customers: (annual visits, average basket ₹ hundreds) */
export const CUSTOMERS = Object.freeze([[2, 3], [3, 2], [3, 4], [4, 3], [9, 4], [10, 5], [11, 3], [10, 4], [5, 10], [6, 11], [4, 11], [5, 12]]);

/** k-means from the given starting centroids; returns each iteration's assignment and centroids until stable */
export function kmeans(points, start, maxIter = 10) {
    let centroids = start.map((c) => [...c]);
    const steps = [];
    for (let it = 0; it < maxIter; it++) {
        const assign = points.map((p) => { let best = 0, bd = Infinity; centroids.forEach((c, k) => { const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2; if (d < bd) { bd = d; best = k; } }); return best; });
        const next = centroids.map((c, k) => { const mine = points.filter((_, i) => assign[i] === k); return mine.length ? [mine.reduce((s, p) => s + p[0], 0) / mine.length, mine.reduce((s, p) => s + p[1], 0) / mine.length] : c; });
        const inertia = points.reduce((s, p, i) => s + (p[0] - centroids[assign[i]][0]) ** 2 + (p[1] - centroids[assign[i]][1]) ** 2, 0);
        steps.push({ centroids, assign, inertia });
        if (next.every((c, k) => c[0] === centroids[k][0] && c[1] === centroids[k][1])) break;
        centroids = next;
    }
    return steps;
}

/* loan applications: income (₹ lakh a year) and whether the loan was repaid (1) */
export const LOANS = Object.freeze([[3, 0], [4, 0], [5, 0], [6, 1], [6, 0], [7, 1], [8, 1], [9, 1], [10, 1], [12, 1]]);

export const gini = (labels) => { if (!labels.length) return 0; const p = labels.filter(Boolean).length / labels.length; return 1 - p * p - (1 - p) * (1 - p); };

/** weighted Gini impurity after splitting at income <= threshold */
export function splitGini(threshold, data = LOANS) {
    const left = data.filter(([x]) => x <= threshold).map(([, y]) => y), right = data.filter(([x]) => x > threshold).map(([, y]) => y);
    return { left: left.length, right: right.length, impurity: (left.length * gini(left) + right.length * gini(right)) / data.length };
}
