/** Removes build output so every build starts from nothing (no stale pages). Usage: node scripts/clean-output.mjs dist [dist-ghpages ...] */
import fs from "node:fs";
import path from "node:path";

const ALLOWED = new Set(["dist", "dist-ghpages"]);
for (const name of process.argv.slice(2)) {
  if (!ALLOWED.has(name)) throw new Error(`Refusing to delete "${name}": only ${[...ALLOWED].join(", ")} are build output`);
  fs.rmSync(path.resolve(name), { recursive: true, force: true });
}
