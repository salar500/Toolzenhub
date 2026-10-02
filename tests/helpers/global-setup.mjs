/**
 * Starts the two local test servers INSIDE the Playwright runner process (no child processes,
 * so nothing can be orphaned and output pipes always close cleanly on Windows).
 *
 *   4173  /Toolzenhub/  the GitHub Pages PREVIEW build   (dist-ghpages/, npm run build:preview)
 *   4174  /             the PRODUCTION root-domain build  (dist/,          npm run build)
 *
 * The tests run against the generated site, exactly what would be deployed.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { startServer } from "./ghpages-server.mjs";

const PROJECT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

export const PAGES_PORT = 4173;
export const ROOT_PORT = 4174;

export default async function globalSetup() {
  const servers = [];
  // TZ_SERVE_PREVIEW / TZ_SERVE_ROOT let the mutation controls (tests/mutation) serve deliberately broken COPIES of the builds.
  const previewDir = process.env.TZ_SERVE_PREVIEW || path.join(PROJECT, "dist-ghpages");
  const rootDir = process.env.TZ_SERVE_ROOT || path.join(PROJECT, "dist");
  for (const dir of [previewDir, rootDir]) {
    if (!fs.existsSync(dir)) throw new Error(`No build output at ${dir}. Run  npm run build:all  first.`);
  }
  try {
    servers.push(await startServer({ port: PAGES_PORT, prefix: "/Toolzenhub", root: previewDir }));
    servers.push(await startServer({ port: ROOT_PORT, prefix: "", root: rootDir }));
  } catch (err) {
    await Promise.all(servers.map((s) => s.close()));
    throw new Error(`Could not start the test servers on ports ${PAGES_PORT}/${ROOT_PORT} (already in use?): ${err.message}`);
  }
  return async () => {
    await Promise.all(servers.map((s) => s.close()));
  };
}
