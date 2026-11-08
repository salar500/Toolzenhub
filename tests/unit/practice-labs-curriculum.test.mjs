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
const { lessons: newLessons } = await import("../../assets/js/practice-labs/sql/additions-lessons.js");
const { set: newSet, DATASETS } = await import("../../assets/js/practice-labs/sql/additions-data.js");
const { validateExerciseSet } = await import("../../assets/js/learning/content-schema.js");
const { learnPages, learnSearchIndex } = await import("../../assets/js/practice-labs/learn-html.js");
const { DEPARTMENTS, isPublished } = await import("../../assets/js/practice-labs/departments.js");

const slug = /^[a-z0-9]+(-[a-z0-9]+)*$/;

test("path ids are unique, every path has levels and a known department", () => {
  assert.equal(new Set(PATHS.map((p) => p.id)).size, PATHS.length);
  for (const path of PATHS) {
    assert.ok(path.levels?.length, path.id);
    assert.ok(DEPARTMENTS.some((d) => d.id === path.department && d.paths.includes(path.id)), `${path.id}: department must list it`);
  }
});

test("departments: the owner's eight, unique slugs that never collide with a path or a reserved name", () => {
  assert.equal(DEPARTMENTS.length, 8);
  const names = [...DEPARTMENTS.map((d) => d.id), ...PATHS.map((p) => p.id), "shoplite", "api-sandbox", "search", "projects", "interview"];
  assert.equal(new Set(names).size, names.length);
  for (const d of DEPARTMENTS) {
    assert.match(d.id, /^[a-z0-9]+(-[a-z0-9]+)*$/);
    for (const t of d.technologies) assert.ok(["path", "lab", "planned"].includes(t.status), `${d.id}: ${t.title}`);
    if (isPublished(d)) assert.ok(d.intro.join(" ").split(/\s+/).length >= 150, `${d.id}: a published department needs 150+ words of its own text`);
  }
});

test("SQL: every lesson exists, is used once, and its slug is unique and URL-safe", () => {
  const path = publishedPaths().find((p) => p.id === "sql");
  const all = flatLessons(path);
  const ids = all.map((e) => e.lesson.id);
  assert.equal(new Set(ids).size, ids.length, "a lesson is listed twice");
  assert.deepEqual([...ids].sort(), [...lessons, ...newLessons].map((l) => l.id).sort(), "every lab lesson and every path lesson is placed, and none is invented");
  const slugs = all.map((e) => e.lesson.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const s of [...slugs, ...path.levels.flatMap((l) => [l.id, ...l.modules.map((m) => m.id)])]) assert.match(s, slug);
});

test("SQL: levels follow the lessons' own level, beginner to advanced", () => {
  const path = publishedPaths().find((p) => p.id === "sql");
  const rank = { beginner: 1, intermediate: 2, advanced: 3 };
  const byId = new Map([...lessons, ...newLessons].map((l) => [l.id, l]));
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

test("generated pages: one per node, unique addresses, one h1, title and description present, no raw markup leaks", async () => {
  const pages = learnPages();
  const { projects: sqlProjects } = await import("../../assets/js/practice-labs/sql/additions-lessons.js");
  const perPath = PATHS.reduce((n, path) => n + 1 + path.levels.length + path.levels.reduce((m, l) => m + l.modules.length, 0) + flatLessons(path).length, 0);
  const extras = 1 + sqlProjects.length + 1 + 1; /* SQL: projects index, each project, interview; Manual Testing: interview */
  assert.equal(pages.length, 1 + DEPARTMENTS.filter(isPublished).length + perPath + extras);
  assert.equal(new Set(pages.map((p) => p.url)).size, pages.length);
  for (const page of pages) {
    assert.equal((page.html.match(/<h1[ >]/g) || []).length, 1, page.url);
    assert.ok(page.title.length > 10 && page.description.length > 40, page.url);
    assert.ok(page.description.length <= 160, `${page.url}: description ${page.description.length}`);
    assert.ok(!/undefined|\[object/.test(page.html), `${page.url}: leaked value`);
  }
});

test("search index: every entry points to a generated page or an existing lab, no duplicates", () => {
  const index = learnSearchIndex();
  const urls = new Set(learnPages().map((p) => p.url));
  assert.equal(new Set(index.map((e) => e.url)).size, index.length);
  for (const e of index) assert.ok(urls.has(e.url) || e.kind === "lab", `${e.kind} ${e.url}`);
});

test("SQL path additions: valid exercise set, ids never collide with the lab, every lesson complete", () => {
  assert.deepEqual(validateExerciseSet(newSet), []);
  const labIds = new Set(set.exercises.map((e) => e.id));
  for (const e of newSet.exercises) {
    assert.ok(!labIds.has(e.id), `${e.id} collides with a lab exercise`);
    assert.ok(e.id.startsWith("sqlp-"), e.id);
    if (e.dataset) assert.ok(DATASETS[e.dataset], `${e.id}: unknown dataset`);
    if (e.plan) { assert.ok(e.plan.must && e.plan.mustNot, e.id); new RegExp(e.plan.must); new RegExp(e.plan.mustNot); }
    else assert.ok(e.expected.rows.length > 0, `${e.id}: no expected rows`);
  }
  for (const l of newLessons) {
    assert.ok(l.objectives.length >= 2 && l.check.length >= 2 && l.mistakes.length >= 2 && l.examples.length >= 1, l.id);
    for (const key of ["why", "analogy", "summary", "intro"]) assert.ok(l[key].length > 60, `${l.id}: ${key}`);
    for (const x of l.examples) assert.ok(x.columns.length > 0, `${l.id}: example without a result`);
  }
});

test("Manual testing path: every lesson has content, blocks render, writing exercises exist", async () => {
  const { lessons: mt1 } = await import("../../assets/js/practice-labs/manual-testing/lessons.js");
  const { lessons: mt2 } = await import("../../assets/js/practice-labs/manual-testing/lessons-2.js");
  const { lessons: mt3 } = await import("../../assets/js/practice-labs/manual-testing/lessons-3.js");
  const mt = [...mt1, ...mt2, ...mt3];
  const { WRITING } = await import("../../assets/js/practice-labs/manual-testing/writing.js");
  const path = PATHS.find((p) => p.id === "manual-testing");
  const byId = new Map(mt.map((l) => [l.id, l]));
  const writing = new Set(WRITING.map((w) => w.id));
  for (const e of flatLessons(path)) {
    const l = byId.get(e.lesson.id);
    assert.ok(l, e.lesson.id);
    assert.equal(l.level, e.level.id, e.lesson.id);
    assert.ok(l.objectives.length >= 2 && l.check.length >= 2 && l.mistakes.length >= 2, l.id);
    assert.ok(l.blocks.some((b) => ["quiz", "order", "write", "bughunt", "labset", "locator"].includes(b.type)), `${l.id}: needs a checked practice block`);
    for (const b of l.blocks.filter((b) => b.type === "write")) assert.ok(writing.has(b.exercise), `${l.id}: ${b.exercise}`);
    for (const b of l.blocks.filter((b) => b.type === "quiz")) for (const q of b.questions) assert.ok(q.answer >= 0 && q.answer < q.options.length, q.q);
  }
});

test("Test Design path: every lab exercise is used exactly once, by an id that exists", async () => {
  const { lessons } = await import("../../assets/js/practice-labs/test-design/lessons.js");
  const { set } = await import("../../assets/js/tools/test-design-lab/exercises.js");
  const used = lessons.flatMap((l) => l.blocks.filter((b) => b.type === "labset").flatMap((b) => b.ids));
  assert.equal(new Set(used).size, used.length);
  assert.deepEqual([...used].sort(), set.exercises.map((e) => e.id).sort());
  for (const l of lessons) assert.ok(l.objectives.length >= 2 && l.check.length >= 2, l.id);
});
