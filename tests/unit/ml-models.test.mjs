/* ML teaching models: least squares and polynomial fits agree with numpy.polyfit (skipped without numpy); k-means and
   Gini follow hand-checked values; the overfitting table shows the shape the lesson describes. */
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { HOUSES, WAVE, linearFit, polyFit, overfitTable, kmeans, CUSTOMERS, gini, splitGini } from "../../assets/js/practice-labs/ai/ml-models.js";

const numpy = spawnSync("python", ["-c", "import numpy"]).status === 0;

test("fits agree with numpy.polyfit", { skip: !numpy && "numpy not installed" }, () => {
  const py = `import json, numpy as np\nh=${JSON.stringify(HOUSES)}\nw=${JSON.stringify(WAVE)}\nout={"lin": list(np.polyfit(h["x"], h["y"], 1)), "pred": {}}\nfor d in range(1, 10):\n    c=np.polyfit(w["train"]["x"], w["train"]["y"], d)\n    out["pred"][d]=list(np.polyval(c, w["test"]["x"]))\nprint(json.dumps(out))`;
  const r = spawnSync("python", ["-c", py], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  const ref = JSON.parse(r.stdout);
  const f = linearFit(HOUSES.x, HOUSES.y);
  assert.ok(Math.abs(f.slope - ref.lin[0]) < 1e-9 && Math.abs(f.intercept - ref.lin[1]) < 1e-9);
  for (let d = 1; d <= 9; d++) {
    const p = polyFit(WAVE.train.x, WAVE.train.y, d, [0, 6.2]);
    WAVE.test.x.forEach((x, i) => assert.ok(Math.abs(p(x) - ref.pred[d][i]) < 1e-6, `degree ${d} at ${x}`));
  }
});

test("overfitting shape, k-means and Gini", () => {
  const t = overfitTable();
  const best = t.reduce((a, b) => (b.test < a.test ? b : a));
  assert.equal(best.degree, 5);
  assert.ok(t[8].train < 1e-6 && t[8].test > 10 * best.test);
  const steps = kmeans(CUSTOMERS, [[2, 3], [3, 2], [3, 4]]);
  assert.equal(steps.at(-1).assign.join(""), "000011112222");
  assert.deepEqual(steps.at(-1).centroids, [[3, 3], [10, 4], [5, 11]]);
  assert.ok(steps.every((s, i) => i === 0 || s.inertia <= steps[i - 1].inertia));
  assert.equal(gini([1, 0]), 0.5);
  assert.ok(Math.abs(splitGini(6).impurity - 0.16) < 1e-12);
});
