/**
 * G3C-B2: the independent item validator (scripts/growth-manifest/validate.mjs). Each case breaks one thing in a valid
 * synthetic item set and expects the matching problem, so the validator cannot silently pass what the consumer rejects.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { computeItemFingerprint, sortItemsCanonical } from "../../scripts/growth-manifest/canonical.mjs";
import { mapRegistry } from "../../scripts/growth-manifest/items.mjs";
import { MAX_ENTRIES, validateItems } from "../../scripts/growth-manifest/validate.mjs";
import { baseRegistry } from "../helpers/growth-registry.mjs";

const good = () => structuredClone(mapRegistry(baseRegistry()).items);
const refingerprint = (item) => {
  try {
    return { ...item, sourceFingerprint: computeItemFingerprint(item) };
  } catch {
    return item; // a value that cannot be fingerprinted (for example a fraction) keeps its old one
  }
};
const find = (items, id) => items.find((i) => i.id === id);

/** Applies `mutate` to a copy of the valid items (re-fingerprinting the touched item) and expects `code`. */
function expectProblem(mutate, code, { refresh = true } = {}) {
  const items = good();
  const touched = mutate(items) ?? null;
  const final = refresh && touched ? items.map((i) => (i.id === touched ? refingerprint(i) : i)) : items;
  const result = validateItems(final);
  assert.equal(result.ok, false, `expected ${code}`);
  assert.ok(result.problems.some((p) => p.code === code), `expected ${code}, got ${JSON.stringify(result.problems)}`);
  return result;
}

describe("valid items", () => {
  test("pass and report the categoryless sections", () => {
    const r = validateItems(good());
    assert.equal(r.ok, true, JSON.stringify(r.problems));
    assert.deepEqual(r.categorylessSections, ["time-tools"]);
  });

  test("an empty set is valid", () => assert.equal(validateItems([]).ok, true));
});

describe("shape and identity", () => {
  test("not an array, not objects, wrong key set", () => {
    assert.equal(validateItems(null).ok, false);
    assert.equal(validateItems({}).ok, false);
    assert.equal(validateItems(["x"]).ok, false);
    expectProblem((items) => delete find(items, "tool:stopwatch").image, "SHAPE", { refresh: false });
    expectProblem((items) => (find(items, "tool:stopwatch").extra = 1), "SHAPE", { refresh: false });
  });

  test("status, type and id", () => {
    expectProblem((items) => ((find(items, "tool:stopwatch").status = "coming_soon"), "tool:stopwatch"), "STATUS");
    expectProblem((items) => ((find(items, "tool:stopwatch").type = "page"), "tool:stopwatch"), "IDENTITY");
    expectProblem((items) => ((find(items, "tool:stopwatch").sourceId = "other"), "tool:stopwatch"), "IDENTITY");
    expectProblem((items) => ((find(items, "article:1").id = "article:01"), "article:01"), "IDENTITY");
    expectProblem((items) => items.push(structuredClone(find(items, "tool:stopwatch"))), "DUPLICATE");
  });

  test("slugs", () => {
    expectProblem((items) => ((find(items, "article:1").slug = "bad slug"), "article:1"), "SLUG");
    expectProblem((items) => ((find(items, "tool:stopwatch").slug = "stop"), "tool:stopwatch"), "SLUG");
  });
});

describe("paths", () => {
  test("unsupported canonical paths", () => {
    for (const bad of ["tools/a/", "//x/", "https://x.test/a/", "/a b/", "/a?b/", "/a#b/", "/a/../b/", "/a%20b/", "/a//b/", ""]) {
      expectProblem((items) => ((find(items, "tool:stopwatch").canonicalPath = bad), "tool:stopwatch"), "PATH");
    }
  });

  test("duplicate paths, compared case-insensitively", () => {
    expectProblem((items) => ((find(items, "article:2").canonicalPath = find(items, "article:1").canonicalPath.toUpperCase()), "article:2"), "PATH_DUPLICATE");
  });
});

describe("text, taxonomy, dates, capabilities", () => {
  test("titles and descriptions", () => {
    expectProblem((items) => ((find(items, "article:1").title = "a\nb"), "article:1"), "TITLE");
    expectProblem((items) => ((find(items, "article:1").title = "   "), "article:1"), "TITLE");
    expectProblem((items) => ((find(items, "article:1").description = ""), "article:1"), "DESCRIPTION");
  });

  test("the character policy and NFC apply to every string", () => {
    expectProblem((items) => ((find(items, "tool:stopwatch").description = "zero\u200bwidth"), "tool:stopwatch"), "TEXT_POLICY");
    expectProblem((items) => ((find(items, "article:1").image.alt = "cafe\u0301"), "article:1"), "TEXT_POLICY");
  });

  test("taxonomy ids", () => {
    expectProblem((items) => ((find(items, "tool:stopwatch").section = "Time Tools"), "tool:stopwatch"), "TAXONOMY");
    expectProblem((items) => ((find(items, "tool:stopwatch").section = null), "tool:stopwatch"), "TAXONOMY");
    expectProblem((items) => ((find(items, "article:1").category = null), "article:1"), "TAXONOMY");
    expectProblem((items) => ((find(items, "tool:emi-calculator").category = "Loans"), "tool:emi-calculator"), "TAXONOMY");
  });

  test("dates", () => {
    expectProblem((items) => ((find(items, "tool:stopwatch").publishedAt = "2026-01-01"), "tool:stopwatch"), "DATE");
    expectProblem((items) => ((find(items, "article:1").publishedAt = null), "article:1"), "DATE");
    expectProblem((items) => ((find(items, "article:1").publishedAt = "2026-02-30"), "article:1"), "DATE");
    expectProblem((items) => ((find(items, "article:1").updatedAt = "2026-08-24"), "article:1"), "DATE");
  });

  test("capabilities", () => {
    expectProblem((items) => ((find(items, "tool:stopwatch").capabilities = null), "tool:stopwatch"), "CAPABILITY");
    expectProblem((items) => ((find(items, "tool:emi-calculator").capabilities = ["validation", "reset"]), "tool:emi-calculator"), "CAPABILITY");
    expectProblem((items) => ((find(items, "tool:emi-calculator").capabilities = ["reset", "reset"]), "tool:emi-calculator"), "CAPABILITY");
    expectProblem((items) => ((find(items, "tool:emi-calculator").capabilities = ["9bad"]), "tool:emi-calculator"), "CAPABILITY");
    expectProblem((items) => ((find(items, "article:1").capabilities = []), "article:1"), "CAPABILITY");
  });

  test("marketingEligible must be a boolean and consistent with status", () => {
    expectProblem((items) => ((find(items, "article:1").marketingEligible = "yes"), "article:1"), "ELIGIBILITY");
    expectProblem((items) => {
      const item = find(items, "article:1");
      item.status = "coming_soon";
      item.marketingEligible = true;
      return "article:1";
    }, "ELIGIBILITY");
  });
});

describe("relationships and images", () => {
  test("related ids", () => {
    expectProblem((items) => ((find(items, "tool:emi-calculator").relatedContentIds = ["article:1", "tool:stopwatch"]), "tool:emi-calculator"), "RELATION");
    expectProblem((items) => ((find(items, "tool:emi-calculator").relatedContentIds = ["tool:stopwatch", "tool:stopwatch"]), "tool:emi-calculator"), "RELATION");
    expectProblem((items) => ((find(items, "tool:emi-calculator").relatedContentIds = ["tool:emi-calculator"]), "tool:emi-calculator"), "RELATION");
    expectProblem((items) => ((find(items, "tool:emi-calculator").relatedContentIds = ["tool:ghost"]), "tool:emi-calculator"), "RELATION");
    expectProblem((items) => ((find(items, "tool:emi-calculator").relatedContentIds = ["nonsense"]), "tool:emi-calculator"), "RELATION");
  });

  test("a dangling target after one item is removed", () => {
    expectProblem((items) => items.splice(items.indexOf(find(items, "article:2")), 1), "RELATION");
  });

  test("image descriptors", () => {
    const mutate = (change) => (items) => {
      change(find(items, "article:1").image);
      return "article:1";
    };
    expectProblem(mutate((img) => (img.path = "/assets/js/x.png")), "IMAGE");
    expectProblem(mutate((img) => (img.path = "https://cdn.test/x.png")), "IMAGE");
    expectProblem(mutate((img) => (img.alt = "")), "IMAGE");
    expectProblem(mutate((img) => (img.width = 0)), "IMAGE");
    expectProblem(mutate((img) => (img.height = 1.5)), "IMAGE");
    expectProblem(mutate((img) => (img.width = 1000001)), "IMAGE");
    expectProblem(mutate((img) => (img.extra = 1)), "IMAGE");
    expectProblem(mutate((img) => delete img.alt), "IMAGE");
  });
});

describe("fingerprints, order and limits", () => {
  test("fingerprint format and consistency", () => {
    expectProblem((items) => (find(items, "tool:stopwatch").sourceFingerprint = "md5:abc"), "FINGERPRINT", { refresh: false });
    expectProblem((items) => (find(items, "tool:stopwatch").title = "Changed without re-fingerprinting"), "FINGERPRINT", { refresh: false });
  });

  test("canonical order is tools first, then articles numerically", () => {
    const items = good();
    assert.equal(validateItems(sortItemsCanonical(items)).ok, true);
    const swapped = [items[2], items[0], items[1], items[3]];
    const r = validateItems(swapped);
    assert.ok(r.problems.some((p) => p.code === "ORDER"));
  });

  test("the entry ceiling", () => {
    assert.equal(MAX_ENTRIES, 1000);
    const one = good()[0];
    const r = validateItems(Array.from({ length: MAX_ENTRIES + 1 }, () => one));
    assert.ok(r.problems.some((p) => p.code === "LIMIT"));
  });
});
