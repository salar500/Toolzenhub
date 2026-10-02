/**
 * M8: the GitHub Pages workflow (.github/workflows/pages.yml). It cannot be executed without pushing, so these
 * tests pin everything that CAN be checked locally: it builds the /Toolzenhub/ preview, uploads only that
 * generated folder, and asks for no more than the Pages deploy action needs.
 * js-yaml ships with Eleventy (it parses front matter), so no extra dependency is needed.
 */
import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const PROJECT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const require = createRequire(import.meta.url);
const text = fs.readFileSync(path.join(PROJECT, ".github", "workflows", "pages.yml"), "utf8");
let wf, steps;
before(() => {
  wf = require("js-yaml").load(text);
  steps = wf.jobs.deploy.steps;
});

describe("GitHub Pages workflow", () => {
  it("is valid YAML that runs on pushes to main (the default branch) and on demand", () => {
    assert.deepEqual(wf.on.push.branches, ["main"]);
    assert.ok("workflow_dispatch" in wf.on);
  });

  it("asks only for the permissions the Pages deploy action needs", () => {
    assert.deepEqual(wf.permissions, { contents: "read", pages: "write", "id-token": "write" });
  });

  it("deploys one at a time without cancelling a deployment in progress", () => {
    assert.equal(wf.concurrency.group, "pages");
    assert.equal(wf.concurrency["cancel-in-progress"], false);
  });

  it("installs from the lockfile with Node 20 and builds the /Toolzenhub/ PREVIEW, not the root build", () => {
    const runs = steps.filter((s) => s.run).map((s) => s.run);
    assert.deepEqual(runs, ["npm ci", "npm run build:preview"]);
    assert.equal(steps.find((s) => s.uses?.startsWith("actions/setup-node")).with["node-version"], 20);
    const pkg = JSON.parse(fs.readFileSync(path.join(PROJECT, "package.json"), "utf8"));
    assert.match(pkg.scripts["build:preview"], /eleventy\.preview\.config\.js/);
    assert.match(fs.readFileSync(path.join(PROJECT, "eleventy.preview.config.js"), "utf8"), /base: "\/Toolzenhub\/", output: "dist-ghpages"/);
  });

  it("uploads exactly the generated preview folder, and nothing from the repository", () => {
    const upload = steps.find((s) => s.uses?.startsWith("actions/upload-pages-artifact"));
    assert.equal(upload.with.path, "dist-ghpages");
    assert.ok(!/dist\/|path:\s*\.\s*$/m.test(text), "must not upload the root build or the repository");
  });

  it("uses the standard Pages actions in the standard order, on the github-pages environment", () => {
    const uses = steps.filter((s) => s.uses).map((s) => s.uses);
    assert.deepEqual(uses, ["actions/checkout@v4", "actions/setup-node@v4", "actions/configure-pages@v5", "actions/upload-pages-artifact@v3", "actions/deploy-pages@v4"]);
    assert.equal(wf.jobs.deploy.environment.name, "github-pages");
    assert.ok(!/secrets\./.test(text), "no secrets are needed");
  });

  it("cannot override the canonical origin: no environment variables anywhere, so builds use site-config.js", () => {
    assert.equal(wf.env, undefined);
    assert.equal(wf.jobs.deploy.env, undefined);
    assert.ok(steps.every((s) => s.env === undefined));
  });
});
