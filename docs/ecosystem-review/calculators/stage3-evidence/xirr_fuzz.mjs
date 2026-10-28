import { validateFlows, solveXirr, xnpv, parseAmount, parseDate, parsePastedRows } from "file:///C:/Users/DELL/Documents/Toolzenhub/assets/js/calculators/formulas/xirr.js";
let seed = 12345; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
const d0 = Date.UTC(1990, 0, 1) / 86400000, d1 = Date.UTC(2100, 11, 31) / 86400000;
let ok = 0, none = 0, invalid = 0, maxMs = 0, maxRes = 0, multi = 0, nonfinite = 0, badRoot = 0;
for (let t = 0; t < 3000; t++) {
  const n = 2 + Math.floor(rnd() * 99), flows = [];
  const span = rnd() < 0.3 ? 5 : rnd() < 0.5 ? 400 : 40000;
  const base = d0 + Math.floor(rnd() * (d1 - d0 - span));
  for (let i = 0; i < n; i++) {
    const mag = Math.pow(10, Math.floor(rnd() * 12)) * (0.5 + rnd());
    flows.push({ day: base + Math.floor(rnd() * span), amount: (rnd() < 0.5 ? -1 : 1) * Math.round(mag * 100) / 100 });
  }
  const c = validateFlows(flows);
  if (!c.ok) { invalid++; continue; }
  const t0 = performance.now(); const r = solveXirr(c.values.flows); const ms = performance.now() - t0; maxMs = Math.max(maxMs, ms);
  if (r.state === "none") { none++; continue; }
  ok++; if (!Number.isFinite(r.rate)) nonfinite++;
  if (r.roots.length > 1) multi++;
  maxRes = Math.max(maxRes, r.residual);
  for (const root of r.roots) { if (!Number.isFinite(root) || root <= -1) badRoot++; }
}
console.log({ ok, none, invalid, multi, nonfinite, badRoot, maxMs: +maxMs.toFixed(1), maxRes });
// parser hostility
const hostile = ["<img src=x onerror=alert(1)>", "2023-01-01 <script>", "9".repeat(5000), "2023-01-01 1e999", "2023-01-01 Infinity", "2023-01-01 NaN", "\u0000", "2023-01-01 ".repeat(1) + "-0", "２０２３-01-01 100"];
for (const h of hostile) { const p = parsePastedRows(h); console.log(JSON.stringify(h).slice(0, 30).padEnd(32), "rows", p.rows.length, "errs", p.errors.length); }
console.log("amount edge", [parseAmount("1e5"), parseAmount("0x10"), parseAmount("1_000"), parseAmount(" 5 "), parseAmount("١٢٣")].map(String).join(" "));
console.log("date edge", [parseDate("2023-13-01"), parseDate("0000-01-01"), parseDate("1990-01-01")?.iso, parseDate("2100-12-31")?.iso, parseDate("2024-02-30")].map(x => x && x.iso ? x.iso : String(x)).join(" "));
