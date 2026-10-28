import fs from "node:fs";
import { calculatePpf } from "file:///C:/Users/DELL/Documents/Toolzenhub/assets/js/calculators/formulas/ppf.js";
import { realValue, realReturnPercent } from "file:///C:/Users/DELL/Documents/Toolzenhub/assets/js/calculators/formulas/inflation.js";
const o = JSON.parse(fs.readFileSync("ppf_infl_oracle.json", "utf8"));
let wp = 0, wr = 0, wq = 0;
for (const c of o.ppf) {
  const annual = c.pattern === "monthly" ? c.dep * 12 : c.dep;
  const r = calculatePpf({ pattern: c.pattern, deposit: c.dep, annualDeposit: annual, monthlyDeposit: c.pattern === "monthly" ? c.dep : null, rate: c.rate, years: c.years });
  wp = Math.max(wp, Math.abs(r.balance - Number(c.bal)) / Number(c.bal));
}
for (const c of o.infl) {
  wr = Math.max(wr, Math.abs(realValue(c.nom, c.f, c.y) - Number(c.real)) / Number(c.real));
  wq = Math.max(wq, Math.abs(realReturnPercent(12, c.f) - Number(c.ret)));
}
console.log("ppf worst rel", wp, "real value worst rel", wr, "return-after-inflation worst abs", wq);
