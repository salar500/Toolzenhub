/**
 * Runs a static checker against BOTH builds:
 *   dist/          base "/"            (production, root domain)
 *   dist-ghpages/  base "/Toolzenhub/"  (GitHub Pages preview)
 *
 *   node tests/static/run-static.mjs links|assets|seo
 *
 * The base is passed through the environment here (not on the command line), because shells such as Git
 * Bash rewrite a value like /Toolzenhub/ into a Windows path.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.resolve(HERE, "..", "..");
const checker = process.argv[2];
const SCRIPTS = { links: "check-links.mjs", assets: "check-assets.mjs", seo: "check-seo.mjs" };
if (!SCRIPTS[checker]) {
  console.error(`usage: node tests/static/run-static.mjs ${Object.keys(SCRIPTS).join("|")}`);
  process.exit(2);
}

const BUILDS = [
  { dir: "dist", base: "/" },
  { dir: "dist-ghpages", base: "/Toolzenhub/" },
];
let failed = false;
for (const build of BUILDS) {
  const root = path.join(PROJECT, build.dir);
  if (!fs.existsSync(root)) {
    console.error(`✗ ${build.dir}/ is missing - run  npm run build:all  first`);
    process.exit(2);
  }
  console.log(`\n━━ ${checker} · ${build.dir}/ (base ${build.base}) ━━`);
  const result = spawnSync(process.execPath, [path.join(HERE, SCRIPTS[checker])], {
    stdio: "inherit",
    env: { ...process.env, TZ_REPO_ROOT: root, TZ_SITE_BASE: build.base },
  });
  if (result.status !== 0) failed = true;
}
process.exit(failed ? 1 : 0);
