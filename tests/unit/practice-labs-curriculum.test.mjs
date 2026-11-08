/*
 * Practice Labs learning paths: the curriculum is complete and consistent.
 * Every published lesson must have its content, its exercises and its teaching sections, and every URL part must be unique.
 */
import test from "node:test";
import assert from "node:assert/strict";

/* routes.js reads the page address; a build-time stand-in (the site root "/") before it is imported */
globalThis.window = { location: { hostname: "toolzenhub.in", pathname: "/" } };

const { PATHS, flatLessons, publishedPaths } = await import("../../assets/js/practice-labs/curriculum.js");
const { lessons } = await import("../../assets/js/tools/sql-practice-lab/lessons.js");
const { set } = await import("../../assets/js/tools/sql-practice-lab/exercises.js");
const { sqlExtras } = await import("../../assets/js/practice-labs/sql-extras.js");
const { learnPages } = await import("../../assets/js/practice-labs/learn-html.js");

const slug = /^[a-z0-9]+(-[a-z0-9]+)*$/;

test("path ids are unique and planned paths have no levels (no page is promised)", () => {
  assert.equal(new Set(PATHS.map((p) => p.id)).size, PATHS.length);
  for (const path of PATHS.filter((p) => p.status === "planned")) assert.equal(path.levels, undefined, path.id);
});

test("SQL: every lesson exists, is used once, and its slug is unique and URL-safe", () => {
  const path = publishedPaths().find((p) => p.id === "sql");
  const all = flatLessons(path);
  const ids = all.map((e) => e.lesson.id);
  assert.equal(new Set(ids).size, ids.length, "a lesson is listed twice");
  assert.deepEqual([...ids].sort(), lessons.map((l) => l.id).sort(), "every lab lesson is placed, and none is invented");
  const slugs = all.map((e) => e.lesson.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const s of [...slugs, ...path.levels.flatMap((l) => [l.id, ...l.modules.map((m) => m.id)])]) assert.match(s, slug);
});

test("SQL: levels follow the lessons' own level, beginner to advanced", () => {
  const path = publishedPaths().find((p) => p.id === "sql");
  const rank = { beginner: 1, intermediate: 2, advanced: 3 };
  const byId = new Map(lessons.map((l) => [l.id, l]));
  let last = 0;
  for (const e of flatLessons(path)) {
    assert.equal(e.level.id, byId.get(e.lesson.id).level, e.lesson.id);
    assert.ok(rank[e.level.id] >= last, `${e.lesson.id} goes back a level`);
    last = rank[e.level.id];
  }
});

test("SQL: each lesson has all teaching sections, real examples and existing exercises", () => {
  const exercises = new Set(set.exercises.map((e) => e.id));
  for (const lesson of lessons) {
    const x = sqlExtras[lesson.id];
    assert.ok(x, `${lesson.id}: no teaching sections`);
    assert.ok(x.objectives.length >= 2, `${lesson.id}: objectives`);
    for (const key of ["why", "analogy", "summary"]) assert.ok(x[key].length > 60, `${lesson.id}: ${key}`);
    assert.ok(x.check.length >= 2 && x.check.every((c) => c.q && c.a), `${lesson.id}: knowledge check`);
    assert.ok(lesson.examples.length >= 1 && lesson.points.length >= 1, `${lesson.id}: examples`);
    for (const id of lesson.practise) assert.ok(exercises.has(id), `${lesson.id}: unknown exercise ${id}`);
  }
});

test("generated pages: one per node, unique addresses, one h1, title and description present, no raw markup leaks", () => {
  const pages = learnPages();
  assert.equal(pages.length, 1 + 1 + 3 + 7 + 18);
  assert.equal(new Set(pages.map((p) => p.url)).size, pages.length);
  for (const page of pages) {
    assert.equal((page.html.match(/<h1[ >]/g) || []).length, 1, page.url);
    assert.ok(page.title.length > 10 && page.description.length > 40, page.url);
    assert.ok(page.description.length <= 160, `${page.url}: description ${page.description.length}`);
    assert.ok(!/undefined|\[object/.test(page.html), `${page.url}: leaked value`);
  }
});
