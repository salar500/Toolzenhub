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
/* the links of a category page's own grid (the workspace sidebar before it lists every calculator in the section) */
const gridHrefs = (html) => hrefs(html.slice(html.indexOf("categories-detail__grid")));

describe("All Tools", () => {
  test("one major section today, Calculators, with its categories; a live tool is a link; Health and Converter have live tools and category pages", () => {
    const html = dir.allToolsHtml();
    assert.equal((html.match(/class="directory-section"/g) || []).length, cats.sections.length);
    assert.match(html, /<h1 class="categories-page__title">\s*All Tools/);
    for (const title of ["Loans", "Investment", "Tax", "Business", "Math"]) assert.ok(html.includes(`>${title}<`) || html.includes(`${title}\n`), title);
    const links = hrefs(html);
    for (const route of ["/Toolzenhub/calculators/emi/", "/Toolzenhub/calculators/sip/", "/Toolzenhub/calculators/fd/", "/Toolzenhub/calculators/cagr/", "/Toolzenhub/calculators/margin/", "/Toolzenhub/calculators/profit/", "/Toolzenhub/calculators/gst/", "/Toolzenhub/calculators/percentage/"]) assert.ok(links.includes(route), route);
    for (const page of ["loans", "investment", "tax", "health", "business", "math", "converter"]) assert.ok(links.includes(`/Toolzenhub/${page}.html`), page);
    assert.equal(html.includes("categories.html#health"), false); // Health and Converter now have live tools and their own category pages
    assert.equal(html.includes("categories.html#converter"), false);
    assert.equal((html.match(/class="coming-soon-badge"/g) || []).length, 0); // roadmap categories are hidden from the public directory (owner, 2026-10-31)
    assert.equal(html.includes("directory-soon"), false);
    assert.equal(html.includes("directory-group--soon"), false);
    assert.ok(links.includes("/Toolzenhub/calculators.html"));
  });

  test("no tool that is not live is a link, and the search form is a plain GET to All Tools", () => {
    const html = dir.allToolsHtml();
    for (const soon of ["currency", "date"]) assert.equal(html.includes(`calculators/${soon}/`), false, soon);
    assert.match(html, /<form[^>]*action="\/Toolzenhub\/tools\.html"[^>]*method="get"/);
    assert.match(html, /id="tools-results"/);
    assert.match(html, /id="tools-directory"/);
    assert.match(html, /name="q"/);
  });
});

describe("category pages", () => {
  test("a page for each category with live tools and a landing route, except Loans (its own older page)", () => {
    assert.deepEqual(dir.categoryPageIds(), ["investment", "tax", "health", "business", "math", "converter"]);
  });

  test("Investment: SIP, PPF, FD, CAGR, SWP and XIRR are all links, and no Coming soon card is left", () => {
    const html = dir.categoryPageHtml("investment");
    assert.deepEqual(gridHrefs(html).filter((h) => h.includes("/calculators/")), ["/Toolzenhub/calculators/sip/", "/Toolzenhub/calculators/ppf/", "/Toolzenhub/calculators/fd/", "/Toolzenhub/calculators/cagr/", "/Toolzenhub/calculators/swp/", "/Toolzenhub/calculators/xirr/", "/Toolzenhub/calculators/risk-reward/"]);
    assert.match(html, /PPF Calculator/);
    assert.equal((html.match(/category-page-card--soon/g) || []).length, 0);
    assert.match(html, /<h1[^>]*>\s*Investment Calculators/);
  });

  test("Business, Tax and Math show exactly their live tools; Coming soon ones are not links", () => {
    const live = (id) => gridHrefs(dir.categoryPageHtml(id)).filter((h) => h.includes("/calculators/"));
    assert.deepEqual(live("business"), ["/Toolzenhub/calculators/profit/", "/Toolzenhub/calculators/margin/", "/Toolzenhub/calculators/roi/"]);
    assert.deepEqual(live("tax"), ["/Toolzenhub/calculators/gst/", "/Toolzenhub/calculators/income-tax/", "/Toolzenhub/calculators/gratuity/", "/Toolzenhub/calculators/salary-in-hand/"]);
    assert.deepEqual(live("math"), ["/Toolzenhub/calculators/percentage/", "/Toolzenhub/calculators/ratio/", "/Toolzenhub/calculators/age/"]);
    assert.match(dir.categoryPageHtml("math"), /Ratio Calculator/);
    assert.match(dir.categoryPageHtml("math"), /Age Calculator/);
  });

  test("the breadcrumb is Home > Calculators > category, and every page has SEO text in the data", () => {
    const html = dir.categoryPageHtml("tax");
    assert.deepEqual(hrefs(html).slice(0, 2), ["/Toolzenhub/", "/Toolzenhub/categories.html"]);
    for (const id of dir.categoryPageIds()) assert.ok(cats.categories.find((c) => c.id === id).seoDescription.length > 40, id);
  });
});
