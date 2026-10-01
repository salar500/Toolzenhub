/**
 * Shared Playwright fixtures for the ToolZen Hub regression suite.
 *
 * Determinism rules baked in here (so individual tests stay small and non-flaky):
 *   - EXTERNAL network is never used. Google Fonts CSS and Unsplash images are replaced with
 *     fixed stubs; anything else external is aborted and recorded (tests fail on surprises).
 *   - Tests wait for real selectors/events, never for arbitrary timeouts.
 *   - Every test can ask the `watch` fixture for page errors, console errors/warnings and failed
 *     LOCAL requests.
 */
import { test as base, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const INVENTORY = JSON.parse(fs.readFileSync(path.join(HERE, "..", "inventory", "url-inventory.json"), "utf8"));

/* a deterministic solid-colour PNG (used instead of remote Unsplash photos) */
function solidPng(w, h, [r, g, b]) {
  const crcTable = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc = (buf) => {
    let c = 0xffffffff;
    for (const x of buf) c = crcTable[(c ^ x) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]);
    const c = Buffer.alloc(4);
    c.writeUInt32BE(crc(td));
    return Buffer.concat([len, td, c]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // RGB
  const row = Buffer.concat([Buffer.from([0]), Buffer.from(Array.from({ length: w }, () => [r, g, b]).flat())]);
  const raw = Buffer.concat(Array.from({ length: h }, () => row));
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}
const REMOTE_IMAGE = solidPng(800, 450, [214, 219, 226]);

export const test = base.extend({
  siteRoot: ["/", { option: true }],
  deployMode: ["subpath", { option: true }],

  /** context-level network policy: no external network, stable stubs */
  context: async ({ context, baseURL }, use) => {
    const ownHost = new URL(baseURL).host;
    context.__external = [];
    await context.route("**/*", (route) => {
      const url = new URL(route.request().url());
      if (url.host === ownHost || url.protocol === "data:" || url.protocol === "blob:") return route.continue();
      context.__external.push(`${route.request().method()} ${url.host}${url.pathname}`);
      if (url.host === "fonts.googleapis.com") return route.fulfill({ status: 200, contentType: "text/css", body: "/* stubbed Google Fonts */" });
      if (url.host === "images.unsplash.com") return route.fulfill({ status: 200, contentType: "image/png", body: REMOTE_IMAGE });
      return route.abort("blockedbyclient");
    });
    await use(context);
  },

  /** page + listeners collecting runtime problems */
  watch: async ({ page, context, baseURL }, use) => {
    const ownHost = new URL(baseURL).host;
    const w = { pageErrors: [], consoleProblems: [], failedLocal: [], external: context.__external };
    page.on("pageerror", (e) => w.pageErrors.push(String(e && e.stack ? e.stack.split("\n")[0] : e)));
    page.on("console", (m) => {
      if (m.type() === "error" || m.type() === "warning") w.consoleProblems.push(`${m.type()}: ${m.text()}`);
    });
    page.on("response", (r) => {
      const u = new URL(r.url());
      if (u.host === ownHost && r.status() >= 400) w.failedLocal.push(`${r.status()} ${u.pathname}`);
    });
    page.on("requestfailed", (r) => {
      const u = new URL(r.url());
      if (u.host === ownHost) w.failedLocal.push(`FAILED ${u.pathname} (${r.failure()?.errorText})`);
    });
    await use(w);
  },

  /**
   * Non-browser HTTP client for the site under test. Playwright's built-in `request` fixture runs in
   * Node, which does NOT honour Chrome's --host-resolver-rules, so the fake hostnames
   * (salar500.github.io / tools.example.test) would hit real DNS. This talks to 127.0.0.1 directly
   * with the same path prefix; the server only cares about the path.
   */
  api: async ({ playwright, baseURL }, use) => {
    const u = new URL(baseURL);
    u.hostname = "127.0.0.1";
    const ctx = await playwright.request.newContext({ baseURL: u.href });
    await use(ctx);
    await ctx.dispose();
  },

  /** navigate to a site-root-relative path ("" = home, "calculators/emi/", …) */
  go: async ({ page }, use) => {
    await use(async (p = "", opts = {}) => page.goto(p.replace(/^\//, ""), { waitUntil: "domcontentloaded", ...opts }));
  },
});

export { expect };

/**
 * assert that nothing went wrong at runtime.
 * `expected404` = number of 404 responses that are EXPECTED (e.g. the 404 page document itself): Chrome
 * reports each as one console "Failed to load resource … 404" message and we also see it as a failed
 * local response; exactly that many of each are tolerated, nothing else.
 */
export function expectClean(watch, { allowFailedLocal = [], expected404 = 0 } = {}) {
  const failed = watch.failedLocal.filter((f) => !allowFailedLocal.some((a) => f.includes(a)));
  let tolerated = expected404;
  const consoleProblems = watch.consoleProblems.filter((m) => {
    if (tolerated > 0 && /Failed to load resource: the server responded with a status of 404/.test(m)) {
      tolerated--;
      return false;
    }
    return true;
  });
  expect(watch.pageErrors, "uncaught JavaScript errors").toEqual([]);
  expect(consoleProblems, "console errors / warnings").toEqual([]);
  expect(failed, "failed LOCAL requests (4xx/5xx/aborted)").toEqual([]);
}

/** force lazy images to load and wait until every <img> has settled; returns broken local ones */
export async function settleImages(page) {
  return page.evaluate(async () => {
    const imgs = [...document.images];
    imgs.forEach((i) => (i.loading = "eager"));
    await Promise.all(
      imgs.map((i) => (i.complete ? Promise.resolve() : new Promise((r) => { i.addEventListener("load", r, { once: true }); i.addEventListener("error", r, { once: true }); }))),
    );
    return imgs.filter((i) => !(i.complete && i.naturalWidth > 0)).map((i) => i.getAttribute("src"));
  });
}

export async function expectNoHorizontalOverflow(page) {
  const o = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
  expect(o.sw, `horizontal overflow: scrollWidth ${o.sw} > viewport ${o.iw}`).toBeLessThanOrEqual(o.iw + 1);
}

/** inventory helpers */
export const livePages = INVENTORY.live;
export const pageOf = (url) => INVENTORY.live.find((p) => p.url === url);
/** "/calculators/emi/" -> "calculators/emi/" ; "/" -> "" */
export const rel = (url) => url.replace(/^\//, "");

export const inr = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
