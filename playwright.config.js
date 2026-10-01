// @ts-check
/**
 * ToolZen Hub — regression safety net (M0). Development-only; the website has no build step.
 *
 * Two deployment modes are tested because the site must work in both:
 *   subpath  http://salar500.github.io:4173/Toolzenhub/   (GitHub Pages project site — production today)
 *   root     http://tools.example.test:4174/               (a future custom / root domain)
 * Chrome resolves those host names to the local test servers (see --host-resolver-rules), so the
 * site's own hostname logic (routes.js: salar500.github.io -> /Toolzenhub/) runs for real.
 *
 * Projects
 *   subpath-desktop / subpath-mobile   functional + baseline tests, production mode
 *   root-desktop                       portable tests (@portable) in root-domain mode
 *   visual-desktop / -mobile / -tablet screenshot baselines (@visual)
 *
 * Uses the system Chrome (channel: "chrome") — no browser download.
 */
import { defineConfig } from "@playwright/test";

const PAGES_PORT = 4173;
const ROOT_PORT = 4174;
const HOST_RULES = "MAP salar500.github.io 127.0.0.1, MAP tools.example.test 127.0.0.1";

const subpath = {
  baseURL: `http://salar500.github.io:${PAGES_PORT}/Toolzenhub/`,
  siteRoot: "/Toolzenhub/",
  deployMode: "subpath",
};
const root = {
  baseURL: `http://tools.example.test:${ROOT_PORT}/`,
  siteRoot: "/",
  deployMode: "root",
};

const desktop = { viewport: { width: 1280, height: 800 } };
const mobile = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 };
const tablet = { viewport: { width: 820, height: 1180 }, hasTouch: true, deviceScaleFactor: 1 };

export default defineConfig({
  testDir: "tests/browser",
  // Baselines live in ONE place: tests/baselines/<name>[-<project>].<ext>  (platform deliberately not in the name)
  snapshotPathTemplate: "{testDir}/../baselines/{arg}{-projectName}{ext}",
  outputDir: "test-results",
  timeout: 45_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: { maxDiffPixelRatio: 0.005, animations: "disabled", caret: "hide", scale: "css" },
  },
  fullyParallel: true,
  workers: 2, // modest dev machines: more parallel Chrome instances thrash memory and make tests slower, not faster
  retries: 0,
  forbidOnly: !!process.env.CI,
  reporter: [["list"]],
  use: {
    channel: "chrome",
    launchOptions: { args: [`--host-resolver-rules=${HOST_RULES}`] },
    reducedMotion: "reduce",
    locale: "en-IN",
    timezoneId: "Asia/Kolkata",
    trace: "off",
  },
  // The two local servers are started in-process (see globalSetup) — no child processes to orphan.
  globalSetup: "./tests/helpers/global-setup.mjs",
  projects: [
    { name: "subpath-desktop", use: { ...desktop, ...subpath }, grepInvert: /@visual/ },
    { name: "subpath-mobile", use: { ...mobile, ...subpath }, grepInvert: /@visual|@desktop-only/ },
    { name: "root-desktop", use: { ...desktop, ...root }, grep: /@portable/, grepInvert: /@visual/ },
    { name: "visual-desktop", use: { ...desktop, ...subpath }, grep: /@visual/ },
    { name: "visual-mobile", use: { ...mobile, ...subpath }, grep: /@visual/ },
    { name: "visual-tablet", use: { ...tablet, ...subpath }, grep: /@visual/ },
  ],
});
