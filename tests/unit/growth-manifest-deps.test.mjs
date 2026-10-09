/**
 * G3C-B4: dependency tracing for the dirty-source gate (scripts/growth-manifest/deps.mjs). Pure tests on synthetic file maps,
 * plus the real repository's graph as a sanity check. No count is hard-coded.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { findSpecifiers, stripComments, traceDependencies } from "../../scripts/growth-manifest/deps.mjs";
import { REPO_ROOT } from "../../scripts/growth-manifest/registry.mjs";
import { EXPLICIT_READS, TRACE_ROOTS } from "../../scripts/growth-manifest/export.mjs";

const fakeFiles = (map) => (file) => (Object.prototype.hasOwnProperty.call(map, file) ? map[file] : null);
const trace = (map, roots, options = {}) => traceDependencies({ roots, readText: fakeFiles(map), ...options });
const codes = (r) => r.errors.map((e) => e.code);

describe("specifier discovery", () => {
  test("static imports and re-exports, including multi-line and side-effect forms", () => {
    const src = `import a from "./a.js";\nimport { b,\n  c } from "../b.js";\nimport "./side.js";\nexport * from "./re.js";\nexport { d } from "./d.js";\nimport * as ns from './ns.js';`;
    assert.deepEqual(findSpecifiers(src).static.sort(), ["../b.js", "./a.js", "./d.js", "./ns.js", "./re.js", "./side.js"]);
  });

  test("dynamic imports: literals are listed, computed ones are counted", () => {
    const f = findSpecifiers(`const x = () => import("./one.js");\nawait import('./two.js');\nconst y = import(name);\nconst z = import(\`./\${n}.js\`);`);
    assert.deepEqual(f.dynamicLiteral.sort(), ["./one.js", "./two.js"]);
    assert.equal(f.computedDynamic, 2);
  });

  test("comments and message strings do not create imports", () => {
    assert.deepEqual(findSpecifiers('// import x from "./nope.js"\n/* import("./nope2.js") */\nconst m = "use import(\\"x\\") here";').static, []);
    const f = findSpecifiers('const m = "loader: () => import(\\"...\\")";');
    assert.equal(f.computedDynamic, 0);
    assert.deepEqual(f.dynamicLiteral, []);
    assert.equal(stripComments("a /* b */ c // d\ne").includes("b"), false);
  });

  test("require is detected", () => assert.equal(findSpecifiers('const x = require("y");').requires, true));
});

describe("tracing", () => {
  test("follows static imports transitively, including cycles, and records JSON", () => {
    const r = trace({ "a.js": 'import "./b.js"; import d from "./data.json";', "b.js": 'import "./a.js"; import "./sub/c.js";', "sub/c.js": 'import "../d2.js";', "d2.js": "export {};", "data.json": "{}" }, ["a.js"]);
    assert.equal(r.ok, true, JSON.stringify(r.errors));
    assert.deepEqual(r.files, ["a.js", "b.js", "d2.js", "data.json", "sub/c.js"]);
  });

  test("a dynamic literal is always a dependency but is only followed when the importer executes it", () => {
    const map = { "cat.js": 'export const x = () => import("./mod.js");', "mod.js": 'import "./deep.js";', "deep.js": "export {};" };
    const unfollowed = trace(map, ["cat.js"]);
    assert.deepEqual(unfollowed.files, ["cat.js", "mod.js"]);
    const followed = trace(map, ["cat.js"], { followDynamicFrom: (f) => f === "cat.js" });
    assert.deepEqual(followed.files, ["cat.js", "deep.js", "mod.js"]);
  });

  test("fails closed on anything it cannot classify", () => {
    assert.ok(codes(trace({ "a.js": 'import x from "lodash";' }, ["a.js"])).includes("DEP_UNCLASSIFIABLE"));
    assert.ok(codes(trace({ "a.js": 'import x from "/abs/b.js";' }, ["a.js"])).includes("DEP_UNCLASSIFIABLE"));
    assert.ok(codes(trace({ "a.js": "const m = await import(name);" }, ["a.js"])).includes("DEP_UNCLASSIFIABLE"));
    assert.ok(codes(trace({ "a.js": 'const x = require("./b.js");', "b.js": "" }, ["a.js"])).includes("DEP_UNCLASSIFIABLE"));
    assert.ok(codes(trace({ "a.js": 'import "./noext";' }, ["a.js"])).includes("DEP_UNCLASSIFIABLE"));
    assert.ok(codes(trace({ "a.js": 'import "../outside.js";' }, ["a.js"])).includes("DEP_UNCLASSIFIABLE"));
    assert.ok(codes(trace({ "a.js": 'const x = () => import("lodash");' }, ["a.js"])).includes("DEP_UNCLASSIFIABLE"));
    assert.ok(codes(trace({ "a.js": 'import "./missing.js";' }, ["a.js"])).includes("DEP_MISSING"));
    assert.ok(codes(trace({}, ["gone.js"])).includes("DEP_MISSING"));
    assert.ok(codes(trace({ "a.js": 'const x = () => import("./gone.js");' }, ["a.js"])).includes("DEP_MISSING"));
  });

  test("a computed dynamic import is allowed only where the caller names the file", () => {
    const map = { "reg.js": "await import(name);" };
    assert.ok(codes(trace(map, ["reg.js"])).includes("DEP_UNCLASSIFIABLE"));
    assert.equal(trace(map, ["reg.js"], { allowComputedDynamic: (f) => f === "reg.js" }).ok, true);
  });

  test("Node built-ins are ignored", () => {
    const r = trace({ "a.js": 'import fs from "node:fs"; const x = () => import("node:path");' }, ["a.js"]);
    assert.equal(r.ok, true);
    assert.deepEqual(r.files, ["a.js"]);
  });

  test("the result is sorted and does not depend on discovery order", () => {
    const map = { "z.js": 'import "./b.js"; import "./a.js";', "a.js": "", "b.js": "" };
    assert.deepEqual(trace(map, ["z.js"]).files, ["a.js", "b.js", "z.js"]);
  });
});

describe("the real repository", () => {
  const read = (rel) => {
    try {
      return fs.readFileSync(path.join(REPO_ROOT, ...rel.split("/")), "utf8");
    } catch {
      return null;
    }
  };
  const real = traceDependencies({ roots: [...TRACE_ROOTS], readText: read, followDynamicFrom: (f) => f === "assets/js/data/articles.js", allowComputedDynamic: (f) => f === "scripts/growth-manifest/registry.mjs" });

  test("every dependency is classified (nothing is unresolved)", () => {
    assert.equal(real.ok, true, JSON.stringify(real.errors.slice(0, 5)));
    assert.ok(real.files.length > 20);
  });

  test("covers the producer, the catalogs, the article modules and the tool modules, and not unrelated documents", () => {
    for (const f of ["scripts/growth-manifest/export.mjs", "scripts/growth-manifest/registry.mjs", "scripts/growth-manifest/ledger.mjs", "scripts/growth-manifest/source-state.mjs", "scripts/growth-manifest/writer.mjs", "assets/js/data/tools.js", "assets/js/data/articles.js", "assets/js/data/categories.js", "assets/js/data/tool-capabilities.js", "assets/js/routes.js"]) assert.ok(real.files.includes(f), f);
    assert.ok(real.files.some((f) => f.startsWith("assets/js/data/articles/")), "article content modules");
    assert.ok(real.files.some((f) => f.startsWith("assets/js/tools/")), "tool modules");
    assert.ok(real.files.every((f) => !f.startsWith("docs/") && !f.startsWith("tests/")), "documents and tests are not export inputs");
    assert.ok(real.files.every((f) => !f.includes("tool-packs")), "the owner's drafts are never a dependency");
  });

  test("every article content module named by the catalog is covered", async () => {
    const source = read("assets/js/data/articles.js");
    const named = [...source.matchAll(/import\(\s*"\.\/(articles\/[^"]+)"\s*\)/g)].map((m) => `assets/js/data/${m[1]}`);
    assert.ok(named.length > 0);
    for (const f of named) assert.ok(real.files.includes(f), f);
  });

  test("every tool module named by the catalog is covered", () => {
    const source = read("assets/js/data/tools.js");
    const named = [...source.matchAll(/import\(\s*"(\.[^"]+[.]js)"\s*\)/g)].map((m) => path.posix.normalize(path.posix.join("assets/js/data", m[1])));
    assert.ok(named.length > 0);
    for (const f of named) assert.ok(real.files.includes(f), f);
  });

  test("the explicit data reads exist", () => {
    for (const f of EXPLICIT_READS) assert.notEqual(read(f), null, f);
  });
});
