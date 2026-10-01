/**
 * Starts the two local test servers INSIDE the Playwright runner process (no child processes,
 * so nothing can be orphaned and output pipes always close cleanly on Windows).
 *
 *   4173  /Toolzenhub/  GitHub-Pages-style project site (production mode today)
 *   4174  /             root / custom-domain mode
 */
import { startServer } from "./ghpages-server.mjs";

export const PAGES_PORT = 4173;
export const ROOT_PORT = 4174;

export default async function globalSetup() {
  const servers = [];
  // TZ_SERVE_ROOT lets the mutation controls (tests/mutation) serve a deliberately broken COPY of the site.
  const root = process.env.TZ_SERVE_ROOT || undefined;
  try {
    servers.push(await startServer({ port: PAGES_PORT, prefix: "/Toolzenhub", root }));
    servers.push(await startServer({ port: ROOT_PORT, prefix: "", root }));
  } catch (err) {
    await Promise.all(servers.map((s) => s.close()));
    throw new Error(`Could not start the test servers on ports ${PAGES_PORT}/${ROOT_PORT} (already in use?): ${err.message}`);
  }
  return async () => {
    await Promise.all(servers.map((s) => s.close()));
  };
}
