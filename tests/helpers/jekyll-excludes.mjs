/**
 * GitHub Pages "deploy from a branch" builds the site with Jekyll. Jekyll copies static files as-is
 * (this site has no Jekyll front matter, so nothing is transformed) and skips excluded paths.
 * This module models which paths Jekyll would NOT publish, from `_config.yml` + Jekyll's defaults,
 * so the test server and the static checks can verify what the deployed site really contains.
 *
 * Only literal entries are supported (no globs) — enough for this repository, and a glob entry is
 * reported as unverifiable rather than silently ignored.
 */
import fs from "node:fs";
import path from "node:path";

/** Jekyll's built-in default `exclude` entries */
export const JEKYLL_DEFAULT_EXCLUDES = [".sass-cache", ".jekyll-cache", "gemfiles", "Gemfile", "Gemfile.lock", "node_modules", "vendor/bundle", "vendor/cache", "vendor/gems", "vendor/ruby"];

/** Parse the `exclude:` list out of a _config.yml text. Returns { entries, globs } or null if absent. */
export function parseExcludes(yamlText) {
  const lines = yamlText.replace(/\r\n/g, "\n").split("\n");
  const start = lines.findIndex((l) => /^exclude\s*:\s*$/.test(l));
  if (start === -1) return null;
  const entries = [];
  for (let i = start + 1; i < lines.length; i++) {
    const l = lines[i];
    if (/^\s*#/.test(l) || l.trim() === "") continue;
    const m = l.match(/^\s+-\s+(.+?)\s*(?:#.*)?$/);
    if (!m) break; // next top-level key
    entries.push(m[1].replace(/^["']|["']$/g, "").replace(/\/+$/, ""));
  }
  return { entries, globs: entries.filter((e) => /[*?[\]{}]/.test(e)) };
}

export function readConfigExcludes(root) {
  const f = path.join(root, "_config.yml");
  if (!fs.existsSync(f)) return null;
  return parseExcludes(fs.readFileSync(f, "utf8"));
}

/** is `relPath` (site-root relative, forward slashes) left out of the published site? */
export function isExcluded(relPath, root) {
  const clean = relPath.replace(/^\/+/, "");
  const segs = clean.split("/").filter(Boolean);
  // Jekyll never publishes paths whose any segment starts with . _ # or ends with ~ (unless `include`d)
  if (segs.some((s) => /^[._#]/.test(s) || s.endsWith("~"))) return true;
  const cfg = readConfigExcludes(root);
  const entries = [...JEKYLL_DEFAULT_EXCLUDES, ...(cfg ? cfg.entries : [])];
  return entries.some((e) => clean === e || clean.startsWith(e + "/"));
}
