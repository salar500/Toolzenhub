import { toFlow, validateFlows, solveXirr } from "file:///C:/Users/DELL/Documents/Toolzenhub/assets/js/calculators/formulas/xirr.js";
const excel = {example4:0.143943935632706,two1827:0.148524039983749,loss:-0.49999999627471,leap:0.0997135818004608,inFirst:-0.49999999627471,monthly:0.382709640264511,long40y:0.102669030427933,zeroish:0.00050000250339508,samedayflows:0.199999994039536,bigloss:-0.999989999999889};
const cases = {
 example4:[["2023-01-01",-100000],["2023-07-01",-50000],["2024-03-31",20000],["2025-01-01",170000]],
 two1827:[["2020-01-01",-100000],["2025-01-01",200000]],
 loss:[["2022-01-01",-1000],["2023-01-01",500]],
 leap:[["2023-12-31",-1000],["2024-12-31",1100]],
 inFirst:[["2022-01-01",200],["2023-01-01",-100]],
 monthly:[["2020-01-05",-1000],["2020-02-05",-1000],["2020-03-05",-1000],["2020-04-05",-1000],["2020-05-05",-1000],["2020-06-05",-1000],["2020-07-05",6600]],
 long40y:[["1990-01-01",-1000],["2030-01-01",50000]],
 zeroish:[["2023-01-01",-1000],["2024-01-01",1000.5]],
 samedayflows:[["2023-01-01",-500],["2023-01-01",-500],["2024-01-01",1200]],
 bigloss:[["2023-01-01",-100000],["2024-01-01",1]],
};
const out={};
for (const [k,v] of Object.entries(cases)) {
  const c=validateFlows(v.map(([d,a])=>toFlow(d,a)));
  const r=solveXirr(c.values.flows);
  out[k]=r.rate;
  console.log(k.padEnd(13), String(r.rate).padEnd(24), String(excel[k]).padEnd(22), "absdiff", Math.abs(r.rate-excel[k]).toExponential(2));
}
console.log(JSON.stringify(out));
