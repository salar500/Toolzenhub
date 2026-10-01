/**
 * M0.14 — Lighthouse baseline (informational; NOT a pass/fail gate).
 *
 *   npm run baseline:lighthouse                 # all pages, 3 mobile runs + 1 desktop run each
 *   node tests/lighthouse/run-lighthouse.mjs --runs 1 --pages home,emi
 *
 * Reproducibility choices (so two runs on the same machine are comparable):
 *   - the site is served by the local GitHub-Pages-style test server under /Toolzenhub/ (production mode)
 *   - EXTERNAL hosts (Google Fonts, Unsplash, CDNs) are blocked, so the numbers measure the FIRST-PARTY
 *     cost of the site only. Real-world scores will differ (they also pay for those third parties).
 *   - Lighthouse default MOBILE emulation + simulated throttling, median of N runs, plus one DESKTOP run
 *   - Chrome is the locally installed one; Lighthouse is pinned in package.json (12.x supports Node 20).
 * Scores depend on the machine's CPU speed (the run records Lighthouse's benchmarkIndex and warnings),
 * so compare baselines only against runs from the SAME machine.
 *
 * Output: tests/baselines/lighthouse/lighthouse-baseline.json
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { startServer } from "../helpers/ghpages-server.mjs";

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(HERE, "..", "baselines", "lighthouse");
const arg = (name, dflt) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : dflt;
};

const RUNS = Number(arg("--runs", 3));
const PORT = 4175;
const HOST = "salar500.github.io";
const ALL_PAGES = {
  home: { path: "", label: "Home" },
  emi: { path: "calculators/emi/", label: "EMI Calculator" },
  "loan-comparison": { path: "calculators/loan-comparison/", label: "Loan Comparison Calculator" },
  article: { path: "articles/loan-comparison/what-is-loan-prepayment/", label: "Article: What Is Loan Prepayment?" },
};
const pageKeys = arg("--pages", Object.keys(ALL_PAGES).join(",")).split(",");

const BLOCKED = ["*fonts.googleapis.com*", "*fonts.gstatic.com*", "*images.unsplash.com*", "*cdnjs.cloudflare.com*", "*cdn.jsdelivr.net*"];

const { default: lighthouse } = await import("lighthouse");
const desktopConfig = (await import("lighthouse/core/config/desktop-config.js")).default;
const chromeLauncher = await import("chrome-launcher");

const median = (a) => {
  const s = [...a].sort((x, y) => x - y);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const round = (n, d = 0) => (n == null ? null : Math.round(n * 10 ** d) / 10 ** d);

function summarize(lhr) {
  const a = lhr.audits;
  const score = (id) => round((lhr.categories[id]?.score ?? 0) * 100);
  const num = (id) => a[id]?.numericValue ?? null;
  return {
    scores: { performance: score("performance"), accessibility: score("accessibility"), bestPractices: score("best-practices"), seo: score("seo") },
    metrics: {
      firstContentfulPaintMs: round(num("first-contentful-paint")),
      largestContentfulPaintMs: round(num("largest-contentful-paint")),
      totalBlockingTimeMs: round(num("total-blocking-time")),
      cumulativeLayoutShift: round(num("cumulative-layout-shift"), 3),
      speedIndexMs: round(num("speed-index")),
      interactiveMs: round(num("interactive")),
      serverResponseTimeMs: round(num("server-response-time")),
      totalByteWeight: round(num("total-byte-weight")),
      domElements: round(num("dom-size")),
      requests: a["network-requests"]?.details?.items?.length ?? null,
    },
    benchmarkIndex: lhr.environment?.benchmarkIndex ?? null,
    warnings: lhr.runWarnings ?? [],
  };
}

/** audits that did not pass (score < 0.9), with the key numbers — the "major diagnostics" */
function diagnostics(lhr) {
  const out = [];
  for (const [id, au] of Object.entries(lhr.audits)) {
    if (au.score === null || au.score === undefined || au.scoreDisplayMode === "informative" || au.scoreDisplayMode === "notApplicable" || au.scoreDisplayMode === "manual") continue;
    if (au.score >= 0.9) continue;
    const cat = Object.entries(lhr.categories).find(([, c]) => c.auditRefs.some((r) => r.id === id));
    out.push({
      category: cat ? cat[0] : null,
      id,
      title: au.title,
      score: round(au.score, 2),
      displayValue: au.displayValue ?? null,
      savingsMs: au.details?.overallSavingsMs != null ? round(au.details.overallSavingsMs) : null,
      savingsBytes: au.details?.overallSavingsBytes != null ? round(au.details.overallSavingsBytes) : null,
    });
  }
  return out.sort((x, y) => (x.category || "").localeCompare(y.category || "") || x.score - y.score);
}

const server = await startServer({ port: PORT, prefix: "/Toolzenhub" });
let chrome;
const launch = async () => {
  chrome = await chromeLauncher.launch({
    chromeFlags: ["--headless=new", "--disable-gpu", "--no-first-run", `--host-resolver-rules=MAP ${HOST} 127.0.0.1`],
    logLevel: "silent",
  });
};
await launch();

const result = {
  generatedWith: {
    lighthouse: require("lighthouse/package.json").version,
    node: process.version,
    os: `${os.type()} ${os.release()}`,
    cpu: `${os.cpus()[0].model} ×${os.cpus().length}`,
    memoryGB: round(os.totalmem() / 2 ** 30, 1),
    note: "Scores are machine dependent; compare only against runs from the same machine. External hosts are blocked (first-party cost only).",
  },
  settings: { mobileRuns: RUNS, desktopRuns: 1, blockedUrlPatterns: BLOCKED, throttling: "lighthouse default (simulated)", categories: ["performance", "accessibility", "best-practices", "seo"] },
  pages: {},
};

async function runOne(url, desktop) {
  const flags = { port: chrome.port, output: "json", logLevel: "error", blockedUrlPatterns: BLOCKED, onlyCategories: ["performance", "accessibility", "best-practices", "seo"] };
  try {
    const r = await lighthouse(url, flags, desktop ? desktopConfig : undefined);
    return r.lhr;
  } catch (err) {
    console.error(`   run failed (${err.message}); restarting Chrome and retrying once`);
    try { await chrome.kill(); } catch {}
    await launch();
    return (await lighthouse(url, { ...flags, port: chrome.port }, desktop ? desktopConfig : undefined)).lhr;
  }
}

try {
  for (const key of pageKeys) {
    const p = ALL_PAGES[key];
    if (!p) throw new Error(`unknown page "${key}" (known: ${Object.keys(ALL_PAGES).join(", ")})`);
    const url = `http://${HOST}:${PORT}/Toolzenhub/${p.path}`;
    console.log(`\n== ${p.label}  ${url}`);
    const mobile = [];
    let lastLhr;
    for (let i = 1; i <= RUNS; i++) {
      process.stdout.write(`   mobile run ${i}/${RUNS} … `);
      lastLhr = await runOne(url, false);
      const s = summarize(lastLhr);
      mobile.push(s);
      console.log(`perf ${s.scores.performance}  a11y ${s.scores.accessibility}  bp ${s.scores.bestPractices}  seo ${s.scores.seo}  LCP ${s.metrics.largestContentfulPaintMs}ms`);
    }
    const med = (pick) => median(mobile.map(pick));
    process.stdout.write("   desktop run … ");
    const dLhr = await runOne(url, true);
    const desktop = summarize(dLhr);
    console.log(`perf ${desktop.scores.performance}  a11y ${desktop.scores.accessibility}  bp ${desktop.scores.bestPractices}  seo ${desktop.scores.seo}`);

    result.pages[key] = {
      url: `/Toolzenhub/${p.path}`,
      label: p.label,
      mobileMedian: {
        scores: Object.fromEntries(Object.keys(mobile[0].scores).map((k) => [k, med((s) => s.scores[k])])),
        metrics: Object.fromEntries(Object.keys(mobile[0].metrics).map((k) => [k, round(med((s) => s.metrics[k] ?? 0), k === "cumulativeLayoutShift" ? 3 : 0)])),
      },
      mobileRuns: mobile,
      desktop,
      diagnosticsMobile: diagnostics(lastLhr),
      diagnosticsDesktop: diagnostics(dLhr),
    };
  }
} finally {
  try { await chrome.kill(); } catch {}
  await server.close();
}

fs.mkdirSync(OUT_DIR, { recursive: true });
const file = path.join(OUT_DIR, "lighthouse-baseline.json");
result.generatedAt = new Date().toISOString();
fs.writeFileSync(file, JSON.stringify(result, null, 2) + "\n");
console.log(`\nWrote ${path.relative(process.cwd(), file)}`);
console.log("\nMobile medians (informational):");
for (const [k, v] of Object.entries(result.pages)) {
  const s = v.mobileMedian.scores, m = v.mobileMedian.metrics;
  console.log(`  ${v.label.padEnd(34)} perf ${String(s.performance).padStart(3)}  a11y ${String(s.accessibility).padStart(3)}  bp ${String(s.bestPractices).padStart(3)}  seo ${String(s.seo).padStart(3)}  | LCP ${m.largestContentfulPaintMs}ms  TBT ${m.totalBlockingTimeMs}ms  CLS ${m.cumulativeLayoutShift}`);
}
