import { validateFlows, solveXirr } from "file:///C:/Users/DELL/Documents/Toolzenhub/assets/js/calculators/formulas/xirr.js";
let seed = 12345; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
const d0 = Date.UTC(1990, 0, 1) / 86400000, d1 = Date.UTC(2100, 11, 31) / 86400000;
const XL = Math.log(1e-6), XH = Math.log(1e6 + 1);
function dense(flows, N) {
  const t = flows.map(f => (f.day - flows[0].day) / 365);
  const g = x => { let m = -Infinity; for (const ti of t) m = Math.max(m, -x * ti); let s = 0; for (let i = 0; i < t.length; i++) s += flows[i].amount * Math.exp(-x * t[i] - m); return s; };
  let prev = g(XL), ch = 0;
  for (let k = 1; k <= N; k++) { const v = g(XL + (XH - XL) * k / N); if (v === 0 || (prev < 0) !== (v < 0)) ch++; prev = v; }
  return ch;
}
let checked = 0, missed = 0, ex = [];
for (let t = 0; t < 3000 && checked < 150; t++) {
  const n = 2 + Math.floor(rnd() * 99), flows = [];
  const span = rnd() < 0.3 ? 5 : rnd() < 0.5 ? 400 : 40000;
  const base = d0 + Math.floor(rnd() * (d1 - d0 - span));
  for (let i = 0; i < n; i++) { const mag = Math.pow(10, Math.floor(rnd() * 12)) * (0.5 + rnd()); flows.push({ day: base + Math.floor(rnd() * span), amount: (rnd() < 0.5 ? -1 : 1) * Math.round(mag * 100) / 100 }); }
  const c = validateFlows(flows); if (!c.ok) continue;
  if (solveXirr(c.values.flows).state !== "none") continue;
  checked++;
  const ch = dense(c.values.flows, 400000);
  if (ch > 0) { missed++; if (ex.length < 2) ex.push({ n, span, ch }); }
}
console.log({ noneChecked: checked, missedByGrid: missed, ex });
