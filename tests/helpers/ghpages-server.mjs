/**
 * Minimal static server that mimics the GitHub Pages behaviours the site depends on.
 *
 *  - Serves the repository root, optionally under a URL prefix (GitHub project sites live at
 *    /<repo>/ -> prefix "/Toolzenhub"). With prefix "" it behaves like a root/custom domain.
 *  - EXACT-CASE path matching, like GitHub Pages' Linux file system. The developer's Windows
 *    file system is case-insensitive, so a plain static server would hide case bugs.
 *  - Directory URLs serve index.html; a directory requested without trailing slash gets a 301.
 *  - Anything missing (or outside the prefix) returns the repository's 404.html with status 404.
 *  - Does not serve what Jekyll would not publish: `_config.yml` `exclude:` entries, Jekyll's default
 *    excludes (node_modules …) and dot/underscore paths — so the tests exercise the real deployment config.
 *
 * Usage:  node tests/helpers/ghpages-server.mjs [--port 4173] [--prefix /Toolzenhub]
 * Or import { startServer } from this module.
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isExcluded } from "./jekyll-excludes.mjs";

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
};

const dirCache = new Map();
function listDir(dir) {
  if (!dirCache.has(dir)) {
    try {
      dirCache.set(dir, new Set(fs.readdirSync(dir)));
    } catch {
      dirCache.set(dir, new Set());
    }
  }
  return dirCache.get(dir);
}

/**
 * Resolve a URL-relative path against the repo root, requiring every segment to match the
 * on-disk spelling EXACTLY (readdir returns real case even on Windows). Returns an absolute
 * file path or null.
 */
export function resolveExactCase(relPath, root = REPO_ROOT) {
  const segments = relPath.split("/").filter((s) => s.length > 0);
  if (segments.some((s) => s === ".." || s === ".")) return null;
  // Jekyll (GitHub Pages) does not publish excluded paths: _config.yml `exclude:` + Jekyll defaults.
  if (segments.length && isExcluded(segments.join("/"), root)) return null;
  let current = root;
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (!listDir(current).has(seg)) return null;
    current = path.join(current, seg);
  }
  return current;
}

export function startServer({ port = 0, prefix = "", root = REPO_ROOT, quiet = true } = {}) {
  prefix = prefix.replace(/\/+$/, "");
  const log = [];

  const server = http.createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    let pathname;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch {
      pathname = url.pathname;
    }
    const send = (status, headers, body) => {
      res.writeHead(status, { "Cache-Control": "no-store", ...headers });
      if (req.method === "HEAD") return res.end();
      res.end(body);
    };
    const record = (status) => {
      log.push({ method: req.method, path: url.pathname, status });
      if (!quiet) console.log(status, req.method, url.pathname);
    };
    const notFound = () => {
      const f = path.join(root, "404.html");
      const body = fs.existsSync(f) ? fs.readFileSync(f) : Buffer.from("404");
      record(404);
      send(404, { "Content-Type": MIME[".html"] }, body);
    };

    // Outside the deployed prefix (e.g. a root-relative /assets/... on a project site) -> 404.
    if (prefix && !(pathname === prefix || pathname.startsWith(prefix + "/"))) return notFound();
    const rel = prefix ? pathname.slice(prefix.length) || "/" : pathname;

    let file = resolveExactCase(rel, root);
    if (file && fs.statSync(file).isDirectory()) {
      if (!pathname.endsWith("/")) {
        record(301);
        return send(301, { Location: pathname + "/" + url.search }, "");
      }
      file = resolveExactCase(rel.replace(/\/?$/, "/") + "index.html", root);
    }
    if (!file || !fs.existsSync(file) || !fs.statSync(file).isFile()) return notFound();

    const type = MIME[path.extname(file).toLowerCase()] || "application/octet-stream";
    record(200);
    send(200, { "Content-Type": type }, fs.readFileSync(file));
  });

  return new Promise((resolve) => {
    server.listen(port, "127.0.0.1", () => {
      resolve({
        port: server.address().port,
        prefix,
        log,
        close: () => new Promise((r) => server.close(r)),
      });
    });
  });
}

// CLI
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const arg = (name, dflt) => {
    const i = process.argv.indexOf(name);
    return i > -1 ? process.argv[i + 1] : dflt;
  };
  const port = Number(arg("--port", 4173));
  let prefix = arg("--prefix", "");
  // Git Bash (MSYS) rewrites a leading "/Toolzenhub" argument into "C:/Program Files/Git/Toolzenhub".
  // Recover the intended prefix (last segment) so the server behaves the same from any shell.
  if (/^[A-Za-z]:[\\/]/.test(prefix)) prefix = "/" + prefix.split(/[\\/]/).filter(Boolean).pop();
  if (prefix && !prefix.startsWith("/")) prefix = "/" + prefix;
  const s = await startServer({ port, prefix, quiet: false });
  console.log(`ToolZen test server: http://127.0.0.1:${s.port}${prefix}/  (exact-case, GitHub-Pages-style 404)`);
}
