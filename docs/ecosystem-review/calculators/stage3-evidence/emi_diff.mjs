import fs from "node:fs";
import { calculateEMI, calculateAmortization } from "file:///C:/Users/DELL/Documents/Toolzenhub/assets/js/calculators/formulas/loan.js";
import { payoffSchedule, rateForEmi } from "file:///C:/Users/DELL/Documents/Toolzenhub/assets/js/calculators/formulas/emi-solve.js";
const o = JSON.parse(fs.readFileSync("emi_oracle.json", "utf8"));
let worst = { emi: 0, interest: 0, rec: 0, rate: 0 }, bad = [];
for (const c of o.emi) {
  const e = calculateEMI(c.p, c.r, c.y), want = Number(c.emi);
  const rel = Math.abs(e - want) / want; worst.emi = Math.max(worst.emi, rel);
  const sch = calculateAmortization(c.p, c.r, c.y);
  const n = c.y * 12;
  if (sch.length !== n) bad.push(["len", c]);
  const sumP = sch.reduce((s, r) => s + (r.principal ?? r.principalPaid ?? 0), 0);
  const sumI = sch.reduce((s, r) => s + (r.interest ?? 0), 0);
  worst.rec = Math.max(worst.rec, Math.abs(sumP - Number(c.p)) / Number(c.p));
  const wi = Number(c.interest);
  worst.interest = Math.max(worst.interest, Math.abs(sumI - wi) / Math.max(1, Math.abs(wi)));
  const end = sch.at(-1); const bal = end.balance ?? end.closingBalance;
  if (Math.abs(bal) > 1e-6 * Number(c.p)) bad.push(["endbal", c, bal]);
  if (rel > 1e-11) bad.push(["emi", c, e, want]);
}
let pOK = 0;
for (const c of o.payoff) {
  const r = payoffSchedule(Number(c.p), Number(c.r), Number(c.emi));
  const n = r.rows?.length ?? r.payments;
  const ti = r.totalInterest ?? r.rows?.reduce((s, x) => s + x.interest, 0);
  if (r.state !== "payoff" || n !== c.n || Math.abs(ti - Number(c.interest)) > 0.01 + 1e-9 * Number(c.p)) bad.push(["payoff", c, r.state, n, ti]); else pOK++;
}
let rOK = 0;
for (const c of o.rate) {
  const r = rateForEmi(Number(c.p), c.n, Number(c.emi));
  const got = r.rate ?? r.annualRate;
  const d = Math.abs(got - Number(c.rate)); worst.rate = Math.max(worst.rate, d);
  if (r.state !== "ok" || d > 1e-6) bad.push(["rate", c, r.state, got]); else rOK++;
}
console.log("cases", o.emi.length, "payoff", pOK + "/" + o.payoff.length, "rate", rOK + "/" + o.rate.length);
console.log("worst", worst);
console.log("bad", bad.length, JSON.stringify(bad.slice(0, 3)).slice(0, 600));
