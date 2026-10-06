/**
 * The directory pages (All Tools and the calculator category pages) are built from the hierarchy data and the catalog.
 * These tests pin what they say and link to, so a tool, a category or a section cannot be shown as live when it is not.
 */
import { test, describe, before } from "node:test";
import assert from "node:assert/strict";

globalThis.window = { location: { hostname: "salar500.github.io", pathname: "/Toolzenhub/" } };

let dir;
let cats;
before(async () => {
  dir = await import("../../assets/js/pages/directory/directory-html.js");
  cats = await import("../../assets/js/data/categories.js");
});

const hrefs = (html) => [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);

describe("All Tools", () => {
  test("one major section today, Calculators, with its categories; a live tool is a link, Health and Converter are not", () => {
    const html = dir.allToolsHtml();
    assert.equal((html.match(/class="directory-section"/g) || []).length, cats.sections.length);
    assert.match(html, /<h1 class="categories-page__title">\s*All Tools/);
    for (const title of ["Loans", "Investment", "Tax", "Business", "Math", "Health", "Converter"]) assert.ok(html.includes(`>${title}<`) || html.includes(`${title}\n`), title);
    const links = hrefs(html);
    for (const route of ["/Toolzenhub/calculators/emi/", "/Toolzenhub/calculators/sip/", "/Toolzenhub/calculators/fd/", "/Toolzenhub/calculators/cagr/", "/Toolzenhub/calculators/margin/", "/Toolzenhub/calculators/profit/", "/Toolzenhub/calculators/gst/", "/Toolzenhub/calculators/percentage/"]) assert.ok(links.includes(route), route);
    for (const page of ["loans", "investment", "tax", "business", "math"]) assert.ok(links.includes(`/Toolzenhub/${page}.html`), page);
    assert.equal(html.includes("categories.html#health"), false); // Health and Converter have no live tool: plain text with a Coming soon badge
    assert.equal(html.includes("categories.html#converter"), false);
    assert.equal((html.match(/class="coming-soon-badge"/g) || []).length, 2); // one badge each for Health and Converter
    assert.match(html, /directory-soon__title[^>]*>\s*Coming soon/); // listed apart from the live categories, under their own heading
    assert.equal(html.includes("directory-group--soon"), false);
    assert.ok(links.includes("/Toolzenhub/calculators.html"));
  });

  test("no tool that is not live is a link, and the search form is a plain GET to All Tools", () => {
    const html = dir.allToolsHtml();
    for (const soon of ["ppf", "income-tax", "roi", "ratio", "age", "bmi", "currency", "date", "unit-converter", "personal-loan"]) assert.equal(html.includes(`calculators/${soon}/`), false, soon);
    assert.match(html, /<form[^>]*action="\/Toolzenhub\/tools\.html"[^>]*method="get"/);
    assert.match(html, /id="tools-results"/);
    assert.match(html, /id="tools-directory"/);
    assert.match(html, /name="q"/);
  });
});

describe("category pages", () => {
  test("a page for each category with live tools and a landing route, except Loans (its own older page)", () => {
    assert.deepEqual(dir.categoryPageIds(), ["investment", "tax", "business", "math"]);
  });

  test("Investment: SIP, FD and CAGR are links and PPF is a Coming soon card that is not", () => {
    const html = dir.categoryPageHtml("investment");
    assert.deepEqual(hrefs(html).filter((h) => h.includes("/calculators/")), ["/Toolzenhub/calculators/sip/", "/Toolzenhub/calculators/fd/", "/Toolzenhub/calculators/cagr/"]);
    assert.match(html, /PPF Calculator/);
    assert.equal((html.match(/category-page-card--soon/g) || []).length, 1);
    assert.match(html, /<h1[^>]*>\s*Investment Calculators/);
  });

  test("Business, Tax and Math show exactly their live tools; Coming soon ones are not links", () => {
    const live = (id) => hrefs(dir.categoryPageHtml(id)).filter((h) => h.includes("/calculators/"));
    assert.deepEqual(live("business"), ["/Toolzenhub/calculators/profit/", "/Toolzenhub/calculators/margin/"]);
    assert.deepEqual(live("tax"), ["/Toolzenhub/calculators/gst/"]);
    assert.deepEqual(live("math"), ["/Toolzenhub/calculators/percentage/"]);
    assert.match(dir.categoryPageHtml("math"), /Ratio Calculator/);
    assert.match(dir.categoryPageHtml("math"), /Age Calculator/);
  });

  test("the breadcrumb is Home > Calculators > category, and every page has SEO text in the data", () => {
    const html = dir.categoryPageHtml("tax");
    assert.deepEqual(hrefs(html).slice(0, 2), ["/Toolzenhub/", "/Toolzenhub/categories.html"]);
    for (const id of dir.categoryPageIds()) assert.ok(cats.categories.find((c) => c.id === id).seoDescription.length > 40, id);
  });
});
