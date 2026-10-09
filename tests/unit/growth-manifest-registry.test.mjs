/**
 * G3C-B2: the real catalogs mapped to manifest items (read-only, in memory), plus the file-system fact helpers on
 * temporary synthetic files. Expectations are recomputed here from the catalogs by plain code that shares nothing with the
 * mapper, and no count is hard-coded: the site keeps adding tools and articles.
 */
import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

import { encodeManifestFile, isCanonicalManifestFileBytes, computeManifestFingerprint, computeFileHash, ITEM_KEYS, serializeManifestFile } from "../../scripts/growth-manifest/canonical.mjs";
import { mapRegistry } from "../../scripts/growth-manifest/items.mjs";
import { REPO_ROOT, exportPublishedItems, loadRegistry, readPngSize, verifyLocalImage } from "../../scripts/growth-manifest/registry.mjs";
import { validateItems } from "../../scripts/growth-manifest/validate.mjs";

const git = (...args) => execFileSync("git", args, { cwd: REPO_ROOT, encoding: "utf8" });
let registry;
let result;
let gitBefore;
let gitAfter;

before(async () => {
  gitBefore = git("status", "--porcelain");
  const realFetch = globalThis.fetch;
  globalThis.fetch = () => {
    throw new Error("network access is not allowed");
  };
  try {
    registry = await loadRegistry();
    result = await exportPublishedItems();
  } finally {
    globalThis.fetch = realFetch;
  }
  gitAfter = git("status", "--porcelain");
});

const publishedTools = () => registry.tools.filter((t) => t.status === "published");
const publishedArticles = () => registry.articles.filter((a) => a.status === "published");
const byId = () => Object.fromEntries(result.items.map((i) => [i.id, i]));

describe("the real registries", () => {
  test("map without errors and pass the independent validator", () => {
    assert.equal(result.ok, true, JSON.stringify(result.errors.slice(0, 5)));
    assert.deepEqual(result.errors, []);
    assert.equal(validateItems(result.items).ok, true);
    assert.equal(result.validation.ok, true);
  });

  test("export exactly the published tools and articles (counts follow the catalogs)", () => {
    const ids = result.items.map((i) => i.id).sort();
    const expected = [...publishedTools().map((t) => `tool:${t.id}`), ...publishedArticles().map((a) => `article:${a.id}`)].sort();
    assert.deepEqual(ids, expected);
    assert.ok(publishedTools().length > 0 && publishedArticles().length > 0, "premise: the site has published content");
    assert.equal(result.items.filter((i) => i.type === "tool").length, publishedTools().length);
    assert.equal(result.items.filter((i) => i.type === "article").length, publishedArticles().length);
  });

  test("no coming-soon entry leaks", () => {
    const ids = new Set(result.items.map((i) => i.id));
    const paths = new Set(result.items.map((i) => i.canonicalPath));
    for (const t of registry.tools.filter((x) => x.status !== "published")) {
      assert.equal(ids.has(`tool:${t.id}`), false, t.id);
      assert.equal(paths.has(`/${t.id}/`), false);
    }
    for (const a of registry.articles.filter((x) => x.status !== "published")) {
      assert.equal(ids.has(`article:${a.id}`), false, String(a.id));
      assert.equal(paths.has(`/articles/${a.topic}/${a.slug}/`), false, `${a.topic}/${a.slug}`);
    }
  });

  test("items are in canonical order with exactly the 18 contract keys and unique identities and paths", () => {
    assert.equal(new Set(result.items.map((i) => i.id)).size, result.items.length);
    assert.equal(new Set(result.items.map((i) => i.canonicalPath.toLowerCase())).size, result.items.length);
    for (const item of result.items) assert.deepEqual(Object.keys(item).sort(), [...ITEM_KEYS].sort());
    const tools = result.items.filter((i) => i.type === "tool").map((i) => i.sourceId);
    assert.deepEqual(tools, [...tools].sort());
    const articles = result.items.filter((i) => i.type === "article").map((i) => Number(i.sourceId));
    assert.deepEqual(articles, [...articles].sort((a, b) => a - b));
    assert.deepEqual(result.items.map((i) => i.type), [...result.items.map((i) => i.type)].sort((a, b) => (a === b ? 0 : a === "tool" ? -1 : 1)));
  });
});

describe("identity, routes, text and dates against the catalogs", () => {
  test("tools: id, slug, route and text are the catalog's own", () => {
    const items = byId();
    for (const t of publishedTools()) {
      const item = items[`tool:${t.id}`];
      assert.equal(item.sourceId, t.id);
      assert.equal(item.slug, t.id);
      assert.equal(item.canonicalPath, t.sitePath);
      assert.equal(item.title, t.title);
      assert.equal(item.description, t.description);
      assert.notEqual(item.title, t.seo?.title, "the catalog title, not the SEO title with the brand suffix");
      assert.equal(item.publishedAt, null);
      assert.equal(item.updatedAt, null);
    }
  });

  test("articles: id, route and dates", () => {
    const items = byId();
    const months = { Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12" };
    const iso = (s) => {
      const [m, d, y] = s.replace(",", "").split(" ");
      return `${y}-${months[m]}-${d.padStart(2, "0")}`;
    };
    for (const a of publishedArticles()) {
      const item = items[`article:${a.id}`];
      assert.equal(item.sourceId, String(a.id));
      assert.equal(item.slug, a.slug);
      assert.equal(item.canonicalPath, `/articles/${a.topic}/${a.slug}/`);
      assert.equal(item.title, a.title);
      assert.equal(item.publishedAt, iso(a.publishedAt));
      assert.equal(item.updatedAt, iso(a.updatedAt));
      assert.ok(item.updatedAt >= item.publishedAt);
    }
  });

  test("the article route formula is the one the site build uses", () => {
    const template = fs.readFileSync(path.join(REPO_ROOT, "src", "article-pages.njk"), "utf8");
    const data = fs.readFileSync(path.join(REPO_ROOT, "src", "_data", "articlePages.js"), "utf8");
    assert.ok(template.includes('permalink: "/articles/{{ article.topic }}/{{ article.slug }}/"'), "src/article-pages.njk permalink changed");
    assert.ok(data.includes("`/articles/${entry.topic}/${entry.slug}/`"), "src/_data/articlePages.js sitePath changed");
  });
});

describe("sections and categories", () => {
  test("section ids come from the taxonomy; calculator categories are preserved; nothing is invented", () => {
    const sectionIds = new Set(registry.sections.map((s) => s.id));
    const sectionTitles = new Set(registry.sections.map((s) => s.title));
    const items = byId();
    for (const t of publishedTools()) {
      const item = items[`tool:${t.id}`];
      assert.ok(sectionIds.has(item.section), `${t.id}: ${item.section}`);
      if (t.sectionId !== undefined) {
        assert.equal(item.section, t.sectionId);
        assert.equal(item.category, null, `${t.id}: a categoryless tool exports category null`);
      } else {
        assert.equal(item.category, t.category, `${t.id}: category preserved`);
        assert.equal(item.section, registry.categories.find((c) => c.id === t.category).sectionId);
      }
    }
    for (const item of result.items) if (!sectionIds.has(item.section) && sectionTitles.has(item.section)) assert.fail(`${item.id} exports a section title`);
  });

  test("categoryless sections are reported, and approving them is not done here", () => {
    const observed = [...new Set(publishedTools().filter((t) => t.sectionId !== undefined).map((t) => t.sectionId))].sort();
    assert.deepEqual(result.validation.categorylessSections, observed);
    for (const file of ["registry.mjs", "items.mjs", "validate.mjs"]) {
      const source = fs.readFileSync(path.join(REPO_ROOT, "scripts", "growth-manifest", file), "utf8");
      for (const section of observed) assert.equal(source.includes(`"${section}"`), false, `${file} must not hard-code the section ${section}`);
    }
  });
});

describe("capabilities, relationships and images", () => {
  test("capabilities are the true flags of the catalog, sorted, from the existing vocabulary", () => {
    const items = byId();
    for (const t of publishedTools()) {
      const expected = Object.entries(t.capabilities).filter(([, v]) => v === true).map(([k]) => k).sort();
      assert.deepEqual(items[`tool:${t.id}`].capabilities, expected, t.id);
      for (const flag of expected) assert.ok(registry.capabilityKeys.includes(flag), flag);
    }
    for (const item of result.items.filter((i) => i.type === "article")) assert.equal(item.capabilities, null);
  });

  test("relationships are exactly the curated catalog links to published targets", () => {
    const articleId = (key) => registry.articles.find((a) => `${a.topic}/${a.slug}` === key)?.id;
    const published = new Set(result.items.map((i) => i.id));
    const order = (a, b) => {
      const [ta, ra] = a.split(":");
      const [tb, rb] = b.split(":");
      if (ta !== tb) return ta === "tool" ? -1 : 1;
      return ta === "article" ? Number(ra) - Number(rb) : ra < rb ? -1 : ra > rb ? 1 : 0;
    };
    const items = byId();
    for (const t of publishedTools()) {
      const expected = [...(t.relatedTools ?? []).map((r) => `tool:${r}`), ...(t.relatedArticles ?? []).map((k) => `article:${articleId(k)}`)].filter((id) => published.has(id)).sort(order);
      assert.deepEqual(items[`tool:${t.id}`].relatedContentIds, expected, t.id);
    }
    for (const a of publishedArticles()) {
      const expected = [...(a.tools ?? []).map((r) => `tool:${r}`), ...(a.related ?? []).map((k) => `article:${articleId(k)}`)].filter((id) => published.has(id)).sort(order);
      assert.deepEqual(items[`article:${a.id}`].relatedContentIds, expected, String(a.id));
    }
    for (const item of result.items) {
      assert.equal(item.relatedContentIds.includes(item.id), false);
      for (const target of item.relatedContentIds) assert.ok(published.has(target), `${item.id} -> ${target}`);
    }
  });

  test("local hero images are described with their real dimensions; others are null", () => {
    const items = byId();
    for (const a of publishedArticles()) {
      const item = items[`article:${a.id}`];
      const hero = a.heroImage;
      if (hero && typeof hero.src === "string" && hero.src.startsWith("/assets/Images/")) {
        const bytes = fs.readFileSync(path.join(REPO_ROOT, hero.src.slice(1)));
        assert.deepEqual(item.image, { alt: hero.alt, height: bytes.readUInt32BE(20), path: hero.src, width: bytes.readUInt32BE(16) }, String(a.id));
      } else {
        assert.equal(item.image, null, `article ${a.id} has no qualifying local hero`);
      }
    }
  });

  test("every item is marketingEligible only by the documented computation (published and valid)", () => {
    assert.ok(result.items.every((i) => i.marketingEligible === true && i.status === "published"));
  });

  test("registry inconsistencies are reported separately as notices", () => {
    assert.ok(Array.isArray(result.notices));
    for (const n of result.notices) assert.ok(n.code && n.id && n.message);
  });
});

describe("fail closed on the real registry", () => {
  test("a missing implementation fact blocks the whole export", () => {
    const broken = { ...registry, facts: { ...registry.facts, toolModules: { ...registry.facts.toolModules } } };
    const victim = Object.keys(broken.facts.toolModules)[0];
    delete broken.facts.toolModules[victim];
    const r = mapRegistry(broken);
    assert.equal(r.ok, false);
    assert.deepEqual(r.items, []);
    assert.ok(r.errors.some((e) => e.code === "PAGE_CONTRACT" && e.id === `tool:${victim}`));
  });

  test("an unverified hero image blocks the export", () => {
    const src = Object.keys(registry.facts.images)[0];
    const r = mapRegistry({ ...registry, facts: { ...registry.facts, images: { ...registry.facts.images, [src]: { ok: false, error: "file does not exist" } } } });
    assert.equal(r.ok, false);
    assert.ok(r.errors.some((e) => e.code === "IMAGE_INVALID"));
  });
});

describe("determinism and a consumer-shaped manifest", () => {
  const envelope = (items) => ({
    schemaVersion: 1,
    site: { id: "toolzenhub" },
    generator: { name: "toolzenhub-growth-manifest", version: "1.0.0" },
    generatedAt: "2026-10-08T13:24:20.000Z",
    source: { revision: "0".repeat(40), dirty: false },
    counts: { tools: items.filter((i) => i.type === "tool").length, articles: items.filter((i) => i.type === "article").length },
    manifestFingerprint: computeManifestFingerprint(1, "toolzenhub", items),
    content: items,
  });

  test("a second export in this process is identical", async () => {
    const again = await exportPublishedItems();
    assert.deepEqual(again.items, result.items);
  });

  test("a fresh process produces the same bytes (locale and time zone do not matter)", () => {
    const script = `import { exportPublishedItems } from ${JSON.stringify(pathToFileURL(path.join(REPO_ROOT, "scripts/growth-manifest/registry.mjs")).href)};
      import { encodeManifestFile, computeFileHash, computeManifestFingerprint } from ${JSON.stringify(pathToFileURL(path.join(REPO_ROOT, "scripts/growth-manifest/canonical.mjs")).href)};
      const r = await exportPublishedItems();
      const items = r.items;
      const m = { schemaVersion: 1, site: { id: "toolzenhub" }, generator: { name: "g", version: "1.0.0" }, generatedAt: "2026-10-08T13:24:20.000Z", source: { revision: "0".repeat(40), dirty: false }, counts: { tools: items.filter((i) => i.type === "tool").length, articles: items.filter((i) => i.type === "article").length }, manifestFingerprint: computeManifestFingerprint(1, "toolzenhub", items), content: items };
      process.stdout.write(computeFileHash(encodeManifestFile(m)));`;
    const expected = computeFileHash(encodeManifestFile({ ...envelope(result.items), generator: { name: "g", version: "1.0.0" } }));
    for (const env of [{ TZ: "UTC", LC_ALL: "C" }, { TZ: "Pacific/Kiritimati", LC_ALL: "tr_TR.UTF-8" }]) {
      const out = execFileSync(process.execPath, ["--input-type=module", "-e", script], { cwd: REPO_ROOT, env: { ...process.env, ...env }, encoding: "utf8" });
      assert.equal(out, expected);
    }
  });

  test("the items serialize into a canonical file whose counts and fingerprint are consistent", () => {
    const manifest = envelope(result.items);
    const bytes = encodeManifestFile(manifest);
    assert.equal(isCanonicalManifestFileBytes(bytes), true);
    assert.ok(bytes.length < 4 * 1024 * 1024, "within the consumer's 4 MiB ceiling");
    assert.ok(result.items.length <= 1000, "within the consumer's 1000 entry ceiling");
    assert.equal(serializeManifestFile(JSON.parse(Buffer.from(bytes).toString("utf8"))), Buffer.from(bytes).toString("utf8"));
  });
});

describe("no side effects", () => {
  test("the working tree is unchanged by a full load and export", () => {
    assert.equal(gitAfter, gitBefore);
  });

  test("the layer has no write, network, process or clock APIs and the pure modules import no file system", () => {
    const dir = path.join(REPO_ROOT, "scripts", "growth-manifest");
    const forbidden = ["writeFile", "appendFile", "mkdir", "rmSync", "unlink", "rename", "copyFile", "createWriteStream", "symlink", "truncate", "fetch(", "node:http", "node:https", "node:net", "node:dgram", "node:dns", "child_process", "WebSocket", "XMLHttpRequest", "Date.now", "new Date()", "Math.random", "process.env", "process.argv", "eval(", "new Function"];
    for (const file of ["registry.mjs", "items.mjs", "validate.mjs"]) {
      const source = fs.readFileSync(path.join(dir, file), "utf8");
      const code = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
      for (const token of forbidden) assert.equal(code.includes(token), false, `${file} must not use ${token}`);
      for (const ch of source) assert.ok(ch === "\n" || (ch >= " " && ch <= "~"), `non-ASCII character in ${file}`);
      for (const m of source.matchAll(/^import .* from "([^"]+)";?$/gm)) assert.match(m[1], /^(node:|\.\/)/, `${file}: unexpected import ${m[1]}`);
      if (file !== "registry.mjs") assert.equal(/from "node:(fs|path|url|os)"/.test(source), false, `${file} must stay pure`);
    }
  });

  test("nothing in the site build or runtime references the Growth manifest modules", () => {
    const files = [
      "eleventy.config.js", "eleventy.preview.config.js", "eleventy.shared.js", "package.json", ".github/workflows/pages.yml",
      "src/_data/tools.js", "src/_data/articlePages.js", "src/_data/directory.js", "src/_data/site.js",
    ];
    for (const f of files) assert.equal(fs.readFileSync(path.join(REPO_ROOT, f), "utf8").includes("growth-manifest"), false, f);
    for (const dir of ["assets", "src", "loans"]) {
      const stack = [path.join(REPO_ROOT, dir)];
      while (stack.length > 0) {
        const current = stack.pop();
        for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
          const full = path.join(current, entry.name);
          if (entry.isDirectory()) stack.push(full);
          else if (/\.(m?js|njk|json|html|css)$/.test(entry.name)) assert.equal(fs.readFileSync(full, "utf8").includes("growth-manifest"), false, path.relative(REPO_ROOT, full));
        }
      }
    }
  });
});

describe("local image verification (temporary synthetic files)", () => {
  const png = (w, h) => {
    const b = Buffer.alloc(33);
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(b, 0);
    b.writeUInt32BE(13, 8);
    b.write("IHDR", 12, "latin1");
    b.writeUInt32BE(w, 16);
    b.writeUInt32BE(h, 20);
    return b;
  };
  let root;
  before(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "tz-growth-img-"));
    fs.mkdirSync(path.join(root, "assets", "Images", "articles"), { recursive: true });
    fs.writeFileSync(path.join(root, "assets", "Images", "articles", "ok.png"), png(1200, 675));
    fs.writeFileSync(path.join(root, "assets", "Images", "articles", "text.png"), "not a png at all, just text........");
    fs.writeFileSync(path.join(root, "assets", "Images", "articles", "short.png"), png(1, 1).subarray(0, 10));
    fs.writeFileSync(path.join(root, "assets", "secret.png"), png(5, 5));
    fs.mkdirSync(path.join(root, "assets", "Images", "articles", "dir.png"));
  });

  test("reads the real size of a valid PNG", () => {
    assert.deepEqual(verifyLocalImage(root, "/assets/Images/articles/ok.png"), { ok: true, width: 1200, height: 675 });
    assert.deepEqual(readPngSize(path.join(root, "assets", "Images", "articles", "ok.png")), { ok: true, width: 1200, height: 675 });
  });

  test("refuses missing, non-PNG, truncated and non-file images", () => {
    for (const src of ["/assets/Images/articles/none.png", "/assets/Images/articles/text.png", "/assets/Images/articles/short.png", "/assets/Images/articles/dir.png"]) {
      const r = verifyLocalImage(root, src);
      assert.equal(r.ok, false, src);
      assert.ok(r.error.length > 0);
    }
  });

  test("refuses anything outside the approved image directory", () => {
    for (const src of ["/assets/Images/../secret.png", "/assets/Images/articles/../../secret.png", "/assets/secret.png", "assets/Images/articles/ok.png", "", null]) {
      assert.equal(verifyLocalImage(root, src).ok, false, String(src));
    }
  });

  test("refuses a link that resolves outside the directory", (t) => {
    const link = path.join(root, "assets", "Images", "articles", "link.png");
    try {
      fs.symlinkSync(path.join(root, "assets", "secret.png"), link);
    } catch {
      t.skip("symbolic links are not available here");
      return;
    }
    assert.equal(verifyLocalImage(root, "/assets/Images/articles/link.png").ok, false);
  });
});
