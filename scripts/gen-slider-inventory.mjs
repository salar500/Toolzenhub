// Lists every slider of every published calculator, read from the built pages (data-slider-* on the number input), as JSON on stdout.
// Usage: node scripts/gen-slider-inventory.mjs [dist-dir]   (default dist-ghpages; run a build first)
import fs from "node:fs";
import path from "node:path";

const dir = process.argv[2] ?? "dist-ghpages";
const attr = (tag, name) => (tag.match(new RegExp(`\\s${name}="([^"]*)"`)) ?? [])[1] ?? null;
const out = [];

function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name === "index.html") page(p);
  }
}

function page(file) {
  const rel = path.relative(dir, file).replace(/\\/g, "/");
  if (!/^(calculators|tools)\/[^/]+\/index\.html$/.test(rel)) return;
  const html = fs.readFileSync(file, "utf8");
  for (const m of html.matchAll(/<input\b[^>]*data-slider-min="[^"]*"[^>]*>/g)) {
    const tag = m[0];
    const id = attr(tag, "id");
    const label = (html.match(new RegExp(`<label[^>]*for="${id}"[^>]*>([\\s\\S]*?)</label>`)) ?? [])[1]?.replace(/<[^>]+>/g, "").trim() ?? null;
    const after = html.slice(m.index, m.index + 600);
    const unit = (after.match(/calculator-form__unit">\s*([^<]*?)\s*</) ?? [])[1] ?? "";
    out.push({
      page: rel.split("/").slice(0, 2).join("/"),
      field: id,
      label,
      unit,
      sliderMin: Number(attr(tag, "data-slider-min")),
      sliderMax: Number(attr(tag, "data-slider-max")),
      step: Number(attr(tag, "data-slider-step") ?? 1),
      fieldMin: attr(tag, "min") === null ? null : Number(attr(tag, "min")),
      fieldMax: attr(tag, "max") === null ? null : Number(attr(tag, "max")),
      defaultValue: attr(tag, "value") === null ? null : Number(attr(tag, "value"))
    });
  }
}

walk(dir);
console.log(JSON.stringify(out, null, 1));
