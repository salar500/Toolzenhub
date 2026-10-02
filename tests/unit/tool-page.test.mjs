/**
 * M2: site config + shared tool page contract.
 * Literal expectations are the values the code used before M2 (routes.js, footer.js, article-seo.js, pages/calculator.js).
 */
import { test, describe, before } from "node:test";
import assert from "node:assert/strict";

globalThis.window = { location: { hostname: "salar500.github.io", pathname: "/Toolzenhub/" } };

let site, toolPage;
before(async () => {
  site = await import("../../assets/js/site-config.js");
  toolPage = await import("../../assets/js/pages/tool-page.js");
});

describe("site config", () => {
  test("values are the ones previously hard-coded", () => {
    assert.equal(site.SITE.name, "ToolZen Hub");
    assert.equal(site.SITE.url, "https://toolzenhub.in/"); // M8: the production origin; previews never change it
    assert.equal(site.SITE.origin, "https://toolzenhub.in");
    assert.equal(site.productionUrl("/calculators/emi/"), "https://toolzenhub.in/calculators/emi/");
    assert.equal(site.productionUrl("about.html"), "https://toolzenhub.in/about.html");
  });
  test("site root: GitHub Pages sub-path, anything else is the domain root", () => {
    assert.equal(site.resolveSiteRoot("salar500.github.io"), "/Toolzenhub/");
    assert.equal(site.resolveSiteRoot("tools.example.org"), "/");
    assert.equal(site.resolveSiteRoot("localhost"), "/");
  });
});

describe("tool module contract", () => {
  test("a module without render() is rejected", () => {
    assert.equal(toolPage.readToolContract(null), null);
    assert.equal(toolPage.readToolContract({}), null);
    assert.equal(toolPage.readToolContract({ render: "x" }), null);
  });
  test("related sections default to shown and can each be opted out", () => {
    const render = () => {};
    assert.deepEqual({ ...toolPage.readToolContract({ render }), render: undefined }, { render: undefined, markup: null, init: null, showRelatedTools: true, showRelatedArticles: true });
    const off = toolPage.readToolContract({ render, showRelatedCalculators: false, showRelatedArticles: false });
    assert.equal(off.showRelatedTools, false);
    assert.equal(off.showRelatedArticles, false);
  });

  test("M8: markup() and init() are optional parts of the contract", () => {
    const markup = () => "<div></div>";
    const init = () => {};
    const c = toolPage.readToolContract({ render() {}, markup, init });
    assert.equal(c.markup, markup);
    assert.equal(c.init, init);
  });
});

describe("buildToolPageHtml (the finished page the site build writes)", () => {
  const meta = { section: "Calculators", category: "loans", title: "Demo Tool" };
  const tool = { render() {}, markup: () => `
  <div class="calculator-page">
<section>TOOL</section>
</div>
` };

  test("breadcrumb is the first child of the wrapper; related sections are the last", () => {
    const html = toolPage.buildToolPageHtml("emi", tool, meta);
    const open = html.indexOf('<div class="calculator-page">');
    assert.ok(html.indexOf("calculator-breadcrumb") > open);
    assert.ok(html.indexOf("calculator-breadcrumb") < html.indexOf("TOOL"));
    assert.ok(html.indexOf("TOOL") < html.indexOf("Related Calculators"));
    assert.ok(html.indexOf("Related Calculators") < html.indexOf("Related Articles"));
    assert.ok(html.trimEnd().endsWith("</div>"));
    assert.equal((html.match(/calculator-breadcrumb"/g) || []).length, 1);
  });

  test("opting out of a related section leaves it out; no markup() gives an empty page", () => {
    const html = toolPage.buildToolPageHtml("emi", { ...tool, showRelatedCalculators: false, showRelatedArticles: false }, meta);
    assert.ok(!html.includes("Related Calculators") && !html.includes("Related Articles"));
    assert.equal(toolPage.buildToolPageHtml("emi", { render() {} }, meta), "");
  });
});
