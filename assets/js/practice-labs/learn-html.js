/* =========================================================
   ToolZen Hub
   Practice Labs learning paths: the pages

   Build-time only (listed in BUILD_ONLY, eleventy.shared.js): turns the curriculum (curriculum.js) and the lesson content
   (the SQL Practice Lab's lessons and exercises, plus sql-extras.js) into finished <main> markup, one page per path, level,
   module and lesson, and the overview at /practice-labs/. Everything is escaped here; the content is written in this
   repository. The roadmap on the left is the ecosystem's own sidebar markup (components/section-switcher.js), so the
   desktop sidebar, the phone bar and drawer and the search come from ui/section-rail.js unchanged.

   A lesson page carries its teaching text, examples and exercises in the HTML itself (read without script); the script
   (entries/learn.js) adds running examples and checking an answer.
========================================================= */

import { escapeHTML as esc } from "../ui/escape.js";
import { ROUTES } from "../routes.js";
import { renderBreadcrumb } from "../components/breadcrumb.js";
import { getToolById } from "../data/tools.js";
import { LEVELS, PRACTICE_LABS_PREFIX, flatLessons, getPath, lessonCount, lessonUrl, levelUrl, moduleUrl, pathUrl, publishedPaths } from "./curriculum.js";
import { DEPARTMENTS, getDepartment, isPublished, publishedDepartments } from "./departments.js";
import { lessons as sqlLessons } from "../tools/sql-practice-lab/lessons.js";
import { set as sqlSet } from "../tools/sql-practice-lab/exercises.js";
import { sqlExtras } from "./sql-extras.js";
import { lessons as sqlNewLessons, projects as sqlProjects, interview as sqlInterview } from "./sql/additions-lessons.js";
import { set as sqlNewSet, DATASET_NOTES } from "./sql/additions-data.js";
import { joinMarkup } from "./join-visualizer.js";
import { renderBlocks } from "./blocks-html.js";
import { lessons as mtLessons } from "./manual-testing/lessons.js";
import { lessons as mtLessons2 } from "./manual-testing/lessons-2.js";
import { lessons as mtLessons3 } from "./manual-testing/lessons-3.js";
import { interview as mtInterview } from "./manual-testing/interview.js";
import { lessons as tdLessons } from "./test-design/lessons.js";
import { lessons as pwLessons } from "./playwright/lessons.js";
import { lessons as pwLessons2, interview as pwInterview } from "./playwright/lessons-2.js";
import { WRITING as mtWriting } from "./manual-testing/writing.js";
import { lessons as aiLessons, interview as aiInterview } from "./ai/lessons.js";
import { AI_WRITING } from "./ai/writing.js";
import { lessons as stLessons, interview as stInterview } from "./data/lessons.js";
import { lessons as jsLessons, interview as jsInterview } from "./programming/lessons.js";
import { lessons as httpLessons, interview as httpInterview } from "./web/lessons.js";
import { lessons as htmlLessons, interview as htmlInterview } from "./web/html-lessons.js";

const SITE_NAME = "ToolZen Hub";
const HUB = () => ROUTES.practiceLabs;
const OVERVIEW = () => PRACTICE_LABS_PREFIX;
const departmentUrl = (department) => `${PRACTICE_LABS_PREFIX}${department.id}/`;

/* the breadcrumb steps above a path: Practice Labs, then the path's department when that department has a page */
const pathCrumbs = (path) => {
    const department = getDepartment(path.department);
    return [{ label: "Practice Labs", href: HUB() }, ...(department && isPublished(department) ? [{ label: department.title, href: departmentUrl(department) }] : [])];
};

/* the content of a path's lessons, by lesson id: the shared lesson data plus the teaching sections */
const CONTENT = {
    sql: {
        /* the SQL Practice Lab's lessons with the path's teaching sections, then the path's own later lessons (generated, sql/additions-*.js) */
        lessons: new Map([...sqlLessons.map((lesson) => [lesson.id, { ...lesson, ...sqlExtras[lesson.id] }]), ...sqlNewLessons.map((lesson) => [lesson.id, lesson])]),
        exercises: new Map([...sqlSet.exercises, ...sqlNewSet.exercises].map((exercise) => [exercise.id, exercise])),
        datasetNotes: DATASET_NOTES,
        projects: sqlProjects,
        interview: sqlInterview,
        morePractice: "has its own exercise list and a free sandbox for any SQL you want to try.",
        labTool: "sql-practice-lab",
        flashcards: "smart-flashcards"
    },
    playwright: {
        kind: "blocks",
        lessons: new Map([...pwLessons, ...pwLessons2].map((lesson) => [lesson.id, lesson])),
        interview: pwInterview,
        exercises: new Map(),
        writing: new Map(),
        labTool: null,
        flashcards: null,
        morePractice: ""
    },
    "ai-foundations": {
        kind: "blocks",
        lessons: new Map(aiLessons.map((lesson) => [lesson.id, lesson])),
        interview: aiInterview,
        exercises: new Map(),
        writing: new Map(AI_WRITING.map((exercise) => [exercise.id, exercise])),
        labTool: null,
        flashcards: null,
        morePractice: ""
    },
    statistics: {
        kind: "blocks",
        lessons: new Map(stLessons.map((lesson) => [lesson.id, lesson])),
        interview: stInterview,
        exercises: new Map(),
        writing: new Map(),
        labTool: "excel-practice-lab",
        flashcards: "smart-flashcards",
        morePractice: "evaluates real spreadsheet formulas such as AVERAGE, COUNTIF and AVERAGEIF on its own datasets, so you can practise the functions named in these lessons."
    },
    javascript: {
        kind: "blocks",
        lessons: new Map(jsLessons.map((lesson) => [lesson.id, lesson])),
        interview: jsInterview,
        exercises: new Map(),
        writing: new Map(),
        labTool: null,
        flashcards: null,
        morePractice: ""
    },
    "http-apis": {
        kind: "blocks",
        lessons: new Map(httpLessons.map((lesson) => [lesson.id, lesson])),
        interview: httpInterview,
        exercises: new Map(),
        writing: new Map(),
        labTool: "json-error-fixing-lab",
        flashcards: "smart-flashcards",
        morePractice: "teaches you to repair broken JSON bodies the way a strict parser sees them, the cause of many 400 responses."
    },
    "html-css-dom": {
        kind: "blocks",
        lessons: new Map(htmlLessons.map((lesson) => [lesson.id, lesson])),
        interview: htmlInterview,
        exercises: new Map(),
        writing: new Map(),
        labTool: null,
        flashcards: null,
        morePractice: ""
    },
    "test-design": {
        kind: "blocks",
        lessons: new Map(tdLessons.map((lesson) => [lesson.id, lesson])),
        exercises: new Map(),
        writing: new Map(),
        labTool: "test-design-lab",
        flashcards: "smart-flashcards",
        morePractice: "holds all twenty exercises in one list, for repeat practice."
    },
    "manual-testing": {
        kind: "blocks",
        lessons: new Map([...mtLessons, ...mtLessons2, ...mtLessons3].map((lesson) => [lesson.id, lesson])),
        exercises: new Map(),
        writing: new Map(mtWriting.map((exercise) => [exercise.id, exercise])),
        interview: mtInterview,
        labTool: "test-design-lab",
        flashcards: "smart-flashcards",
        morePractice: "drills boundary values and equivalence partitions with checked exercises; it pairs with the test data lessons."
    }
};

const clip = (text, max = 155) => {
    const clean = String(text).replace(/\s+/g, " ").trim();
    if (clean.length <= max) return clean;
    const cut = clean.slice(0, max);
    const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("; "));
    return stop > 60 ? cut.slice(0, stop + 1) : `${cut.slice(0, cut.lastIndexOf(" "))}...`;
};

const firstSentence = (text) => {
    const match = /^.*?[.!?](?=\s|$)/.exec(String(text).trim());
    return match ? match[0] : String(text).trim();
};

const list = (items, className = "") => `<ul${className ? ` class="${className}"` : ""}>${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;


/* =========================================================
   THE ROADMAP (left sidebar on a wide screen, bar and drawer on a phone)
========================================================= */

/** The path's roadmap in the ecosystem sidebar markup. `current` is the lesson id, or null on a path, level or module page. */
function roadmapNav(path, { currentLessonId = null, currentModuleId = null, now = null, currentExtra = null } = {}) {

    const all = flatLessons(path);
    const total = all.length;
    const groups = [];

    for (const level of path.levels) {
        for (const module of level.modules) {
            const current = module.lessons.some((lesson) => lesson.id === currentLessonId) || module.id === currentModuleId;
            const items = module.lessons.map((lesson) => {
                const entry = all.find((e) => e.lesson === lesson);
                const here = lesson.id === currentLessonId;
                return `<li><a href="${esc(lessonUrl(path, level, module, lesson))}"${here ? ' aria-current="page"' : ""}>${entry.number}. ${esc(lesson.title)}</a></li>`;
            }).join("");
            groups.push(`
                            <li class="section-switcher__group" data-open="${current || currentLessonId === null && currentModuleId === null && level.id === "beginner"}"${current ? ' data-current="true"' : ""}>
                                <span class="section-switcher__label">${esc(LEVELS[level.id].title)}: ${esc(module.title)}</span>
                                <ul>${items}</ul>
                            </li>`);
        }
    }

    /* projects and interview practice, when the path has them */
    const extra = CONTENT[path.id];
    const extraLink = (href, label, key) => `<li><a href="${esc(href)}"${currentExtra === key ? ' aria-current="page"' : ""}>${esc(label)}</a></li>`;
    if (extra?.projects?.length) {
        const here = currentExtra === "projects" || String(currentExtra).startsWith("project:");
        groups.push(`
                            <li class="section-switcher__group" data-open="${here}"${here ? ' data-current="true"' : ""}>
                                <span class="section-switcher__label">Projects</span>
                                <ul>${extraLink(projectsUrl(path), "All projects", "projects")}${extra.projects.map((project) => extraLink(projectUrl(path, project), project.title, `project:${project.id}`)).join("")}</ul>
                            </li>`);
    }
    if (extra?.interview) {
        const here = currentExtra === "interview";
        groups.push(`
                            <li class="section-switcher__group" data-open="${here}"${here ? ' data-current="true"' : ""}>
                                <span class="section-switcher__label">Interview practice</span>
                                <ul>${extraLink(interviewUrl(path), `${path.title} interview practice`, "interview")}</ul>
                            </li>`);
    }

    const onOverview = currentLessonId === null && currentModuleId === null && now === null;

    return `
                <nav class="section-switcher" data-rail-noun="lesson" aria-label="${esc(path.title)} learning path: switch lesson">
                    <details>
                        <summary>
                            <span>${esc(path.title)} roadmap</span>
                            <span class="section-switcher__now">${esc(now ?? `${path.title} overview`)}</span>
                            <span class="section-switcher__count">${total}</span>
                        </summary>
                        <p class="section-switcher__overview"><a href="${esc(pathUrl(path))}"${onOverview ? ' aria-current="page"' : ""}>${esc(path.title)} learning path</a></p>
                        <ul class="section-switcher__list">${groups.join("")}
                        </ul>
                        <p class="section-switcher__all"><a href="${esc(OVERVIEW())}">All learning paths</a></p>
                    </details>
                </nav>`;

}


/* =========================================================
   THE PAGE FRAME (the same frame as every ecosystem page: breadcrumb row, then sidebar and workspace)
========================================================= */

function frame({ trail, nav, body }) {

    return `
    <main id="app">

        <section class="categories-page directory-page learn-page">

            <div class="container container--workspace">

                ${renderBreadcrumb(trail)}

                ${nav
                    ? `<div class="ecosystem-layout" data-section-page>
                ${nav}
                <div class="ecosystem-main learn-main">
                ${body}
                </div>
            </div>`
                    : `<div class="learn-main learn-main--wide">
                ${body}
                </div>`}

            </div>

        </section>

    </main>`;

}

const intro = ({ eyebrow, title, text }) => `
                <div class="categories-page__intro learn-intro">
                    <span class="categories-page__eyebrow">${esc(eyebrow)}</span>
                    <h1 class="categories-page__title">${esc(title)}</h1>
                    ${text ? `<p class="categories-page__description">${esc(text)}</p>` : ""}
                </div>`;

/* one finished page: `url` is the address a visitor sees (with the site base), `trail` the breadcrumb items after Home */
const pageEntry = ({ url, title, description, html, trail }) => ({ url, title, description: clip(description), html, trail });


/* =========================================================
   RESULT TABLES AND EXERCISES
========================================================= */

const CELL = (value) => (value === null ? "NULL" : String(value));

function resultTable(example, label) {

    if (example.error) {
        return `<p class="lx-note"><strong>Result:</strong> SQLite reports an error: ${esc(example.error)}</p>`;
    }

    if (!example.columns || example.columns.length === 0) return "";

    const more = example.total > example.rows.length ? `<p class="lx-note">${example.total} rows in all; the first ${example.rows.length} are shown.</p>` : "";

    return `
                        <div class="lx-table-wrap" tabindex="0" role="region" aria-label="Expected result of ${esc(label)}">
                            <table class="lx-table">
                                <thead><tr>${example.columns.map((c) => `<th scope="col">${esc(c)}</th>`).join("")}</tr></thead>
                                <tbody>${example.rows.map((row) => `<tr>${row.map((v) => `<td>${esc(CELL(v))}</td>`).join("")}</tr>`).join("")}</tbody>
                            </table>
                        </div>
                        ${more}`;

}

function exampleBlock(example, index) {

    return `
                    <div class="learn-example"${example.dataset ? ` data-dataset="${esc(example.dataset)}"` : ""}>
                        <h3>Example ${index + 1}</h3>
                        <p>${esc(example.says)}</p>
                        <pre class="lx-code" tabindex="0" role="region" aria-label="SQL of example ${index + 1}"><code data-sql-source>${esc(example.sql)}</code></pre>
                        ${resultTable(example, `example ${index + 1}`)}
                        <p><button type="button" class="calculator-form__button lx-btn" data-sql-run hidden>Run this example</button></p>
                        <div class="lx-live-result" data-sql-out data-label="example ${index + 1}" role="status" aria-live="polite"></div>
                    </div>`;

}

function exerciseBlock(exercise, index, label = "Exercise") {

    return `
                    <div class="learn-exercise" data-exercise="${esc(exercise.id)}">
                        <h3>${label} ${index + 1}: ${esc(exercise.title)}</h3>
                        <p class="learn-exercise__goal"><strong>Goal.</strong> ${esc(exercise.objective)}</p>
                        <p>${esc(exercise.instructions)}</p>
                        ${exercise.plan ? `<p class="lx-note">Checked by its query plan: the lab runs EXPLAIN QUERY PLAN${exercise.kind === "query" ? " on your query, after checking its result" : ""} and looks for the index search the task asks for.</p>` : ""}
                        <div class="learn-exercise__tool" hidden>
                            <label class="lx-label" for="learn-sql-${esc(exercise.id)}">Your SQL</label>
                            <textarea id="learn-sql-${esc(exercise.id)}" class="lx-textarea learn-editor" rows="5" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" maxlength="4000"></textarea>
                            <div class="learn-actions">
                                <button type="button" class="calculator-form__button lx-btn" data-learn-check>Check answer</button>
                                <button type="button" class="calculator-form__button calculator-form__button--secondary lx-btn" data-learn-clear>Clear</button>
                            </div>
                            <div class="learn-feedback" data-learn-out role="status" aria-live="polite"></div>
                        </div>
                        <details class="learn-reveal">
                            <summary>Need a hint?</summary>
                            <ol>${exercise.hints.map((hint) => `<li>${esc(hint)}</li>`).join("")}</ol>
                        </details>
                        <details class="learn-reveal">
                            <summary>Show the solution and why it works</summary>
                            <pre class="lx-code" tabindex="0"><code>${esc(exercise.solution)}</code></pre>
                            <p>${esc(exercise.explanation)}</p>
                        </details>
                    </div>`;

}


/* =========================================================
   A LESSON PAGE
========================================================= */

function lessonBody(entry, content) {

    if (content.kind === "blocks") return blocksLessonBody(entry, content);

    const { path, level, module, lesson, number, total, previous, next } = entry;
    const data = content.lessons.get(lesson.id);
    const exercises = data.practise.map((id) => content.exercises.get(id)).filter(Boolean);
    const lab = getToolById(content.labTool);
    const cards = content.flashcards ? getToolById(content.flashcards) : null;
    const siblings = module.lessons.filter((other) => other.id !== lesson.id);

    const prerequisite = data.prerequisite
        ? esc(data.prerequisite)
        : (previous ? `Lesson ${previous.number}, <a href="${esc(lessonUrl(previous.path, previous.level, previous.module, previous.lesson))}">${esc(previous.lesson.title)}</a>.` : "None.");

    const pager = `
                <nav class="learn-pager" aria-label="Lesson navigation">
                    ${previous ? `<a class="learn-pager__link learn-pager__link--prev" rel="prev" href="${esc(lessonUrl(previous.path, previous.level, previous.module, previous.lesson))}"><span>Previous lesson</span>${esc(previous.lesson.title)}</a>` : `<span></span>`}
                    ${next ? `<a class="learn-pager__link learn-pager__link--next" rel="next" href="${esc(lessonUrl(next.path, next.level, next.module, next.lesson))}"><span>Next lesson</span>${esc(next.lesson.title)}</a>` : `<a class="learn-pager__link learn-pager__link--next" href="${esc(pathUrl(path))}"><span>You reached the end of the published lessons</span>Back to the ${esc(path.title)} learning path</a>`}
                </nav>`;

    return `
                <article class="learn-lesson">

                <header class="learn-lesson__head">
                    <p class="learn-eyebrow"><a href="${esc(pathUrl(path))}">${esc(path.title)}</a> · <a href="${esc(levelUrl(path, level))}">${esc(LEVELS[level.id].title)}</a> · <a href="${esc(moduleUrl(path, level, module))}">${esc(module.title)}</a></p>
                    <h1>${esc(data.title)}</h1>
                    <p class="learn-progress" aria-label="Lesson ${number} of ${total}">
                        <span class="learn-progress__text">Lesson ${number} of ${total}</span>
                        <span class="learn-progress__bar" aria-hidden="true"><span style="width:${Math.round(number / total * 100)}%"></span></span>
                    </p>
                </header>

                <section class="learn-section learn-lesson-card" aria-labelledby="learn-objectives">
                    <h2 id="learn-objectives">In this lesson</h2>
                    ${list(data.objectives)}
                    <p class="learn-lesson-card__before"><strong>Before you start:</strong> ${prerequisite}</p>
                </section>

                <section class="learn-section" aria-labelledby="learn-idea">
                    <h2 id="learn-idea">The idea in plain words</h2>
                    <p>${esc(data.intro)}</p>
                    ${data.dataset && content.datasetNotes?.[data.dataset] ? `<p class="lx-note"><strong>Data in this lesson:</strong> the shop database plus ${esc(content.datasetNotes[data.dataset])}</p>` : ""}
                    ${data.examples.length ? exampleBlock(data.examples[0], 0) : ""}
                </section>

                ${exercises.length ? `
                <section class="learn-section" aria-labelledby="learn-try">
                    <h2 id="learn-try">Your turn</h2>
                    <p>Try it now, while the example is fresh. Your SQL runs on a fresh copy of the practice database in your browser and is checked against the expected result; nothing you type is uploaded. A hint comes before the answer.</p>
                    <noscript><p class="lx-note">Running and checking SQL needs JavaScript and WebAssembly. The task, hints and solution below can still be read.</p></noscript>
                    ${exerciseBlock(exercises[0], 0)}
                </section>` : ""}

                ${data.visual === "join" ? joinMarkup() : ""}

                <section class="learn-section" aria-labelledby="learn-points">
                    <h2 id="learn-points">Key points</h2>
                    ${list(data.points)}
                </section>

                <section class="learn-section" aria-labelledby="learn-why">
                    <h2 id="learn-why">Why it matters at work</h2>
                    <p>${esc(data.why)}</p>
                </section>

                <section class="learn-section learn-analogy" aria-labelledby="learn-analogy">
                    <h2 id="learn-analogy">An everyday picture</h2>
                    <p>${esc(data.analogy)}</p>
                </section>

                ${data.examples.length > 1 ? `
                <section class="learn-section" aria-labelledby="learn-examples">
                    <h2 id="learn-examples">More examples</h2>
                    ${data.examples.slice(1).map((example, index) => exampleBlock(example, index + 1)).join("")}
                </section>` : ""}

                ${exercises.length > 1 ? `
                <section class="learn-section" aria-labelledby="learn-practice">
                    <h2 id="learn-practice">More practice</h2>
                    <p>Each task builds on the lesson. Check your answer, use a hint if you are stuck, and read the explanation even when you are right: it often shows a second way.</p>
                    ${exercises.slice(1).map((exercise, index) => exerciseBlock(exercise, index + 1)).join("")}
                </section>` : ""}

                ${exercises.length === 0 ? `
                <section class="learn-section" aria-labelledby="learn-practice">
                    <h2 id="learn-practice">Practice</h2>
                    <p>This lesson is explained in words and examples, with no exercise of its own. Run the example above, then change it and run it again; the sandbox of the <a href="${esc(lab.href)}">${esc(lab.title)}</a> runs any SQL you write.</p>
                </section>` : ""}

                ${data.mistakes.length ? `
                <section class="learn-section" aria-labelledby="learn-mistakes">
                    <h2 id="learn-mistakes">Common mistakes</h2>
                    ${list(data.mistakes)}
                </section>` : ""}

                <section class="learn-section" aria-labelledby="learn-check">
                    <h2 id="learn-check">Check your understanding</h2>
                    ${data.check.map((item, index) => `
                    <details class="learn-reveal">
                        <summary>Question ${index + 1}: ${esc(item.q)}</summary>
                        <p>${esc(item.a)}</p>
                    </details>`).join("")}
                </section>

                <section class="learn-section" aria-labelledby="learn-summary">
                    <h2 id="learn-summary">Summary</h2>
                    <p>${esc(data.summary)}</p>
                </section>

                ${pager}

                <section class="learn-section learn-related" aria-labelledby="learn-related">
                    <h2 id="learn-related">Keep going</h2>
                    <ul>
                        ${siblings.length ? `<li>More in this module, <a href="${esc(moduleUrl(path, level, module))}">${esc(module.title)}</a>: ${siblings.map((other) => `<a href="${esc(lessonUrl(path, level, module, other))}">${esc(other.title)}</a>`).join(", ")}.</li>` : ""}
                        <li>Every exercise and a free-form sandbox: <a href="${esc(lab.href)}">${esc(lab.title)}</a>.</li>
                        ${cards ? `<li>Revise the terms with the <a href="${esc(cards.href)}">${esc(cards.title)}</a>.</li>` : ""}
                        <li>The whole route: <a href="${esc(pathUrl(path))}">${esc(path.title)} learning path</a>.</li>
                    </ul>
                </section>

                </article>`;

}


/* =========================================================
   A LESSON OF A BLOCKS PATH (testing and other non-SQL subjects)
   The same frame as an SQL lesson: header, lesson card, the idea, then the lesson's own blocks (practice comes early),
   then why, analogy, mistakes, the check, summary, the pager and related links.
========================================================= */

function blocksLessonBody(entry, content) {

    const { path, level, module, lesson, number, total, previous, next } = entry;
    const data = content.lessons.get(lesson.id);
    const lab = content.labTool ? getToolById(content.labTool) : null;
    const cards = content.flashcards ? getToolById(content.flashcards) : null;
    const siblings = module.lessons.filter((other) => other.id !== lesson.id);
    const href = (e) => lessonUrl(e.path, e.level, e.module, e.lesson);

    const prerequisite = data.prerequisite
        ? esc(data.prerequisite)
        : (previous ? `Lesson ${previous.number}, <a href="${esc(href(previous))}">${esc(previous.lesson.title)}</a>.` : "None.");

    return `
                <article class="learn-lesson">

                <header class="learn-lesson__head">
                    <p class="learn-eyebrow"><a href="${esc(pathUrl(path))}">${esc(path.title)}</a> · <a href="${esc(levelUrl(path, level))}">${esc(LEVELS[level.id].title)}</a> · <a href="${esc(moduleUrl(path, level, module))}">${esc(module.title)}</a></p>
                    <h1>${esc(data.title)}</h1>
                    <p class="learn-progress" aria-label="Lesson ${number} of ${total}">
                        <span class="learn-progress__text">Lesson ${number} of ${total}</span>
                        <span class="learn-progress__bar" aria-hidden="true"><span style="width:${Math.round(number / total * 100)}%"></span></span>
                    </p>
                </header>

                <section class="learn-section learn-lesson-card" aria-labelledby="learn-objectives">
                    <h2 id="learn-objectives">In this lesson</h2>
                    ${list(data.objectives)}
                    <p class="learn-lesson-card__before"><strong>Before you start:</strong> ${prerequisite}</p>
                </section>

                <section class="learn-section" aria-labelledby="learn-idea">
                    <h2 id="learn-idea">The idea in plain words</h2>
                    <p>${esc(data.intro)}</p>
                </section>

                ${renderBlocks(data.blocks, { quizBlock, writing: content.writing, idPrefix: lesson.id })}

                <section class="learn-section" aria-labelledby="learn-why">
                    <h2 id="learn-why">Why it matters at work</h2>
                    <p>${esc(data.why)}</p>
                </section>

                <section class="learn-section learn-analogy" aria-labelledby="learn-analogy">
                    <h2 id="learn-analogy">An everyday picture</h2>
                    <p>${esc(data.analogy)}</p>
                </section>

                <section class="learn-section" aria-labelledby="learn-mistakes">
                    <h2 id="learn-mistakes">Common mistakes</h2>
                    ${list(data.mistakes)}
                </section>

                <section class="learn-section" aria-labelledby="learn-check">
                    <h2 id="learn-check">Check your understanding</h2>
                    ${data.check.map((item, index) => `
                    <details class="learn-reveal">
                        <summary>Question ${index + 1}: ${esc(item.q)}</summary>
                        <p>${esc(item.a)}</p>
                    </details>`).join("")}
                </section>

                <section class="learn-section" aria-labelledby="learn-summary">
                    <h2 id="learn-summary">Summary</h2>
                    <p>${esc(data.summary)}</p>
                </section>

                <nav class="learn-pager" aria-label="Lesson navigation">
                    ${previous ? `<a class="learn-pager__link learn-pager__link--prev" rel="prev" href="${esc(href(previous))}"><span>Previous lesson</span>${esc(previous.lesson.title)}</a>` : `<span></span>`}
                    ${next ? `<a class="learn-pager__link learn-pager__link--next" rel="next" href="${esc(href(next))}"><span>Next lesson</span>${esc(next.lesson.title)}</a>` : `<a class="learn-pager__link learn-pager__link--next" href="${esc(pathUrl(path))}"><span>You reached the end of the published lessons</span>Back to the ${esc(path.title)} learning path</a>`}
                </nav>

                <section class="learn-section learn-related" aria-labelledby="learn-related">
                    <h2 id="learn-related">Keep going</h2>
                    <ul>
                        ${siblings.length ? `<li>More in this module, <a href="${esc(moduleUrl(path, level, module))}">${esc(module.title)}</a>: ${siblings.map((other) => `<a href="${esc(lessonUrl(path, level, module, other))}">${esc(other.title)}</a>`).join(", ")}.</li>` : ""}
                        ${lab ? `<li>More practice: <a href="${esc(lab.href)}">${esc(lab.title)}</a>.</li>` : ""}
                        ${cards ? `<li>Revise the terms with the <a href="${esc(cards.href)}">${esc(cards.title)}</a>.</li>` : ""}
                        <li>The whole route: <a href="${esc(pathUrl(path))}">${esc(path.title)} learning path</a>.</li>
                    </ul>
                </section>

                </article>`;

}


/* =========================================================
   PATH, LEVEL AND MODULE PAGES
========================================================= */

const lessonItem = (path, level, module, lesson, number, content, withBlurb = true) => {
    const data = content.lessons.get(lesson.id);
    return `<li><a href="${esc(lessonUrl(path, level, module, lesson))}">${number}. ${esc(lesson.title)}</a>${withBlurb && data ? `<span class="learn-blurb">${esc(firstSentence(data.intro))}</span>` : ""}</li>`;
};

function pathBody(path, content) {

    const all = flatLessons(path);
    const first = all[0];
    const lab = content.labTool ? getToolById(content.labTool) : null;

    return `
                ${intro({ eyebrow: "Learning path", title: `${path.title}: from zero to confident`, text: path.tagline })}

                <p class="learn-start">
                    <a class="learn-button" href="${esc(lessonUrl(path, first.level, first.module, first.lesson))}">Start lesson 1: ${esc(first.lesson.title)}</a>
                    <span class="learn-start__note">${all.length} lessons published, ${path.levels.length} levels</span>
                </p>

                <section class="learn-section" aria-labelledby="learn-outcomes">
                    <h2 id="learn-outcomes">What you will be able to do</h2>
                    ${list(path.outcomes)}
                </section>

                <section class="learn-section" aria-labelledby="learn-who">
                    <h2 id="learn-who">Who it is for, and how it runs</h2>
                    <p><strong>For:</strong> ${esc(path.audience)}</p>
                    <p><strong>How it runs:</strong> ${esc(path.runsIn)} ${esc(path.title)} here is a free learning path written for this site; it is practice, not a qualification.</p>
                </section>

                <section class="learn-section" aria-labelledby="learn-roadmap">
                    <h2 id="learn-roadmap">The roadmap</h2>
                    ${path.levels.map((level) => `
                    <div class="learn-level">
                        <h3><a href="${esc(levelUrl(path, level))}">${esc(LEVELS[level.id].title)}</a> <span class="learn-count">${lessonCount(level)} lessons</span></h3>
                        <p>${esc(LEVELS[level.id].summary)}</p>
                        ${level.modules.map((module) => `
                        <div class="learn-module">
                            <h4><a href="${esc(moduleUrl(path, level, module))}">${esc(module.title)}</a></h4>
                            <ol start="${all.find((e) => e.lesson === module.lessons[0]).number}">
                                ${module.lessons.map((lesson) => lessonItem(path, level, module, lesson, all.find((e) => e.lesson === lesson).number, content, false)).join("")}
                            </ol>
                        </div>`).join("")}
                    </div>`).join("")}
                </section>

                ${content.projects?.length ? `
                <section class="learn-section" aria-labelledby="learn-path-projects">
                    <h2 id="learn-path-projects">Projects</h2>
                    <p>Put the lessons to work on realistic tasks, each with milestones checked as you go.</p>
                    <div class="learn-cards">
                        ${content.projects.map((project) => `
                        <a class="learn-card" href="${esc(projectUrl(path, project))}">
                            <span class="learn-card__status">${esc(LEVELS[project.level].title)} · ${project.milestones.length} milestones</span>
                            <strong>${esc(project.title)}</strong>
                            <span>${esc(firstSentence(project.scenario))}</span>
                        </a>`).join("")}
                    </div>
                </section>` : ""}

                ${content.interview ? `
                <section class="learn-section" aria-labelledby="learn-path-interview">
                    <h2 id="learn-path-interview">Interview practice</h2>
                    <p><a href="${esc(interviewUrl(path))}">${esc(path.title)} interview practice</a>: ${content.interview.quiz.length} questions with explanations${content.interview.coding.length ? ` and ${content.interview.coding.length} classic coding problems, checked in your browser` : ""}.</p>
                </section>` : ""}

                ${path.coming?.length ? `
                <section class="learn-section" aria-labelledby="learn-coming">
                    <h2 id="learn-coming">Still to come on this path</h2>
                    <p>The ${esc(path.title)} path is being built one tested lesson at a time. Planned next:</p>
                    ${list(path.coming)}
                </section>` : ""}

                ${lab ? `
                <section class="learn-section" aria-labelledby="learn-more-practice">
                    <h2 id="learn-more-practice">More practice</h2>
                    <p>The <a href="${esc(lab.href)}">${esc(lab.title)}</a> ${esc(content.morePractice)}</p>
                </section>` : ""}`;

}

function levelBody(path, level, content) {

    const all = flatLessons(path);
    const levels = path.levels;
    const index = levels.indexOf(level);
    const nextLevel = levels[index + 1];

    return `
                ${intro({ eyebrow: `${path.title} · Level ${LEVELS[level.id].order}`, title: `${path.title} ${LEVELS[level.id].title}`, text: LEVELS[level.id].summary })}

                ${level.modules.map((module) => `
                <section class="learn-section" aria-labelledby="learn-mod-${esc(module.id)}">
                    <h2 id="learn-mod-${esc(module.id)}"><a href="${esc(moduleUrl(path, level, module))}">${esc(module.title)}</a></h2>
                    <p>${esc(module.summary)}</p>
                    <ol start="${all.find((e) => e.lesson === module.lessons[0]).number}" class="learn-lessons">
                        ${module.lessons.map((lesson) => lessonItem(path, level, module, lesson, all.find((e) => e.lesson === lesson).number, content)).join("")}
                    </ol>
                </section>`).join("")}

                <p class="learn-start">
                    ${nextLevel ? `<a class="learn-button" href="${esc(levelUrl(path, nextLevel))}">Next level: ${esc(LEVELS[nextLevel.id].title)}</a>` : ""}
                    <a class="learn-link" href="${esc(pathUrl(path))}">Back to the ${esc(path.title)} learning path</a>
                </p>`;

}

function moduleBody(path, level, module, content) {

    const all = flatLessons(path);
    const first = all.find((e) => e.lesson === module.lessons[0]);

    return `
                ${intro({ eyebrow: `${path.title} · ${LEVELS[level.id].title}`, title: module.title, text: module.summary })}

                <p class="learn-start">
                    <a class="learn-button" href="${esc(lessonUrl(path, level, module, module.lessons[0]))}">Start with lesson ${first.number}: ${esc(module.lessons[0].title)}</a>
                </p>

                <section class="learn-section" aria-labelledby="learn-mod-lessons">
                    <h2 id="learn-mod-lessons">Lessons in this module</h2>
                    <ol start="${first.number}" class="learn-lessons">
                        ${module.lessons.map((lesson) => {
                            const entry = all.find((e) => e.lesson === lesson);
                            const data = content.lessons.get(lesson.id);
                            return `<li><a href="${esc(lessonUrl(path, level, module, lesson))}">${entry.number}. ${esc(lesson.title)}</a><span class="learn-blurb">${esc(firstSentence(data.intro))}</span>${list(data.objectives.slice(0, 3), "learn-objectives-list")}</li>`;
                        }).join("")}
                    </ol>
                </section>

                <p class="learn-start"><a class="learn-link" href="${esc(levelUrl(path, level))}">Back to ${esc(path.title)} ${esc(LEVELS[level.id].title)}</a></p>`;

}


/* =========================================================
   PROJECTS AND INTERVIEW PRACTICE
   /practice-labs/<path>/projects/ (index), /practice-labs/<path>/projects/<id>/ and /practice-labs/<path>/interview/
========================================================= */

const projectsUrl = (path) => `${pathUrl(path)}projects/`;
const projectUrl = (path, project) => `${projectsUrl(path)}${project.id}/`;
const interviewUrl = (path) => `${pathUrl(path)}interview/`;

/* concept questions: a radio group per question; without script the options and the answer (in a disclosure) are still readable */
function quizBlock(questions, prefix) {

    return `
                    <div class="learn-quiz">
                        ${questions.map((question, index) => `
                        <fieldset class="learn-quiz__q" data-answer="${question.answer}">
                            <legend>Question ${index + 1}. ${esc(question.q)}</legend>
                            <div class="learn-quiz__options">
                                ${question.options.map((option, choice) => `
                                <label class="learn-quiz__option"><input type="radio" name="${esc(prefix)}-${index}" value="${choice}"> <span>${esc(option)}</span></label>`).join("")}
                            </div>
                            <p class="learn-quiz__actions"><button type="button" class="calculator-form__button lx-btn" data-quiz-check hidden>Check</button></p>
                            <p class="learn-quiz__result" role="status" aria-live="polite"></p>
                            <details class="learn-reveal">
                                <summary>Show the answer and why</summary>
                                <p><strong>Answer:</strong> ${esc(question.options[question.answer])}. ${esc(question.explain)}</p>
                            </details>
                        </fieldset>`).join("")}
                    </div>`;

}

function projectBody(path, project, index, content) {

    const all = content.projects;
    const previous = all[index - 1];
    const next = all[index + 1];
    const milestones = project.milestones.map((id) => content.exercises.get(id)).filter(Boolean);

    return `
                <article class="learn-lesson learn-project">

                <header class="learn-lesson__head">
                    <p class="learn-eyebrow"><a href="${esc(pathUrl(path))}">${esc(path.title)}</a> · <a href="${esc(projectsUrl(path))}">Projects</a> · ${esc(LEVELS[project.level].title)}</p>
                    <h1>${esc(project.title)}</h1>
                    <p class="learn-progress"><span class="learn-progress__text">Project ${index + 1} of ${all.length} · ${milestones.length} checked milestones</span></p>
                </header>

                <section class="learn-section learn-lesson-card" aria-labelledby="learn-brief">
                    <h2 id="learn-brief">The brief</h2>
                    <p>${esc(project.scenario)}</p>
                </section>

                <section class="learn-section" aria-labelledby="learn-objectives">
                    <h2 id="learn-objectives">What you will practise</h2>
                    ${list(project.objectives)}
                </section>

                <section class="learn-section" aria-labelledby="learn-data">
                    <h2 id="learn-data">The data</h2>
                    <p>The shop database (customers, products, orders and order_items)${project.dataset && content.datasetNotes[project.dataset] ? `, plus ${esc(content.datasetNotes[project.dataset])}` : "."}</p>
                    <p>Every check starts from a fresh copy, so nothing you run can damage the data for the next milestone.</p>
                </section>

                <section class="learn-section" aria-labelledby="learn-requirements">
                    <h2 id="learn-requirements">Requirements</h2>
                    ${list(project.requirements)}
                </section>

                <section class="learn-section" aria-labelledby="learn-milestones">
                    <h2 id="learn-milestones">Milestones</h2>
                    <p>Work through the milestones in order. Each one is checked against the expected result by SQLite in your browser; a hint comes before the reference solution, and the explanation says why it works and what to watch for.</p>
                    <noscript><p class="lx-note">Checking needs JavaScript and WebAssembly. The tasks, hints and solutions can still be read.</p></noscript>
                    ${milestones.map((exercise, i) => exerciseBlock(exercise, i, "Milestone")).join("")}
                </section>

                <section class="learn-section" aria-labelledby="learn-validation">
                    <h2 id="learn-validation">How your work is checked</h2>
                    <p>A milestone counts as done when your query returns the expected rows and columns${milestones.some((m) => m.kind === "modify") ? ", or, for a milestone that changes data, when the lab's own query after your statements returns the expected result" : ""}. Column names and the order of rows do not matter unless the task asks for an order. Nothing is saved: the page keeps no record of finished milestones.</p>
                </section>

                <section class="learn-section" aria-labelledby="learn-further">
                    <h2 id="learn-further">Take it further</h2>
                    <p>No checks for these: use the sandbox of the <a href="${esc(getToolById(content.labTool).href)}">${esc(getToolById(content.labTool).title)}</a> or the milestone editors above.</p>
                    ${list(project.improvements)}
                </section>

                <nav class="learn-pager" aria-label="Project navigation">
                    ${previous ? `<a class="learn-pager__link learn-pager__link--prev" rel="prev" href="${esc(projectUrl(path, previous))}"><span>Previous project</span>${esc(previous.title)}</a>` : `<span></span>`}
                    ${next ? `<a class="learn-pager__link learn-pager__link--next" rel="next" href="${esc(projectUrl(path, next))}"><span>Next project</span>${esc(next.title)}</a>` : `<a class="learn-pager__link learn-pager__link--next" href="${esc(interviewUrl(path))}"><span>After the projects</span>Interview practice</a>`}
                </nav>

                </article>`;

}

function projectsIndexBody(path, content) {

    return `
                ${intro({ eyebrow: `${path.title} · Projects`, title: `${path.title} projects`, text: "Realistic tasks from real kinds of work, each broken into milestones that are checked as you go. Each project uses what several lessons taught, on its own dataset." })}

                <section class="learn-section" aria-labelledby="learn-project-list">
                    <h2 id="learn-project-list">Choose a project</h2>
                    <div class="learn-cards">
                        ${content.projects.map((project) => `
                        <a class="learn-card" href="${esc(projectUrl(path, project))}">
                            <span class="learn-card__status">${esc(LEVELS[project.level].title)} · ${project.milestones.length} milestones</span>
                            <strong>${esc(project.title)}</strong>
                            <span>${esc(firstSentence(project.scenario))}</span>
                        </a>`).join("")}
                    </div>
                </section>

                <section class="learn-section" aria-labelledby="learn-project-how">
                    <h2 id="learn-project-how">How the projects work</h2>
                    <p>Read the brief and the requirements first, as you would at work. Then solve the milestones in order: each is checked by SQLite in your browser, with hints and an explained reference solution. When you have finished, the "Take it further" list suggests extensions without a check, so you can practise judging your own result.</p>
                </section>`;

}

function interviewBody(path, content) {

    const coding = content.interview.coding.map((id) => content.exercises.get(id)).filter(Boolean);

    return `
                <article class="learn-lesson">

                <header class="learn-lesson__head">
                    <p class="learn-eyebrow"><a href="${esc(pathUrl(path))}">${esc(path.title)}</a> · Interview practice</p>
                    <h1>${esc(path.title)} interview practice</h1>
                    <p class="learn-progress"><span class="learn-progress__text">${content.interview.quiz.length} scenario and concept questions${coding.length ? ` · ${coding.length} checked coding problems` : ""}</span></p>
                </header>

                <section class="learn-section learn-lesson-card" aria-labelledby="learn-iq-how">
                    <h2 id="learn-iq-how">How to use this page</h2>
                    <p>${esc(content.interview.howTo ?? "Answer each question before opening the explanation, then solve any practical problems without looking at the hints. In an interview, say your reasoning out loud.")}</p>
                </section>

                <section class="learn-section" aria-labelledby="learn-iq-concepts">
                    <h2 id="learn-iq-concepts">Concept questions</h2>
                    ${quizBlock(content.interview.quiz, `${path.id}-iq`)}
                </section>

                ${coding.length ? `
                <section class="learn-section" aria-labelledby="learn-iq-coding">
                    <h2 id="learn-iq-coding">Coding problems</h2>
                    <p>Each problem is checked by SQLite in your browser on the practice databases.</p>
                    <noscript><p class="lx-note">Checking needs JavaScript and WebAssembly. The problems, hints and solutions can still be read.</p></noscript>
                    ${coding.map((exercise, i) => exerciseBlock(exercise, i, "Problem")).join("")}
                </section>` : ""}

                <nav class="learn-pager" aria-label="Interview practice navigation">
                    ${content.projects?.length ? `<a class="learn-pager__link learn-pager__link--prev" href="${esc(projectsUrl(path))}"><span>Back to</span>${esc(path.title)} projects</a>` : `<span></span>`}
                    <a class="learn-pager__link learn-pager__link--next" href="${esc(pathUrl(path))}"><span>Back to</span>The ${esc(path.title)} learning path</a>
                </nav>

                </article>`;

}


/* =========================================================
   THE PRACTICE LABS HOME (/practice-labs/) AND THE DEPARTMENT PAGES (/practice-labs/<department>/)
========================================================= */

const labOf = (id) => getToolById(id);

/* what a department offers, counted from real content only */
function departmentCounts(department) {
    const paths = department.paths.map(getPath).filter(Boolean);
    const lessons = paths.reduce((sum, path) => sum + lessonCount(path), 0);
    return { paths: paths.length, lessons, labs: department.labs.length };
}

const countText = ({ paths, lessons, labs }) => [
    paths ? `${paths} learning ${paths === 1 ? "path" : "paths"} (${lessons} lessons)` : "",
    labs ? `${labs} ${labs === 1 ? "lab" : "labs"} with checked exercises` : ""
].filter(Boolean).join(" · ");

/* where a department's "start here" leads: the first lesson of a path, or a lab */
function startHref(start) {
    if (start?.path) {
        const first = flatLessons(getPath(start.path))[0];
        return lessonUrl(first.path, first.level, first.module, first.lesson);
    }
    return start?.lab ? labOf(start.lab).href : null;
}

function overviewBody() {

    const live = publishedDepartments();
    const indexUrl = `${OVERVIEW()}search-index.json`;

    return `
                ${intro({ eyebrow: "Learn by doing", title: "Practice Labs", text: "Learn a software skill, then practise it straight away: lessons with runnable examples, exercises that are checked by real engines, and labs you can come back to. Everything runs in your browser. It is free, and there is nothing to sign up for." })}

                <section class="learn-section learn-search" aria-labelledby="learn-search-title" data-search-index="${esc(indexUrl)}" hidden>
                    <h2 id="learn-search-title">Find a lesson, lab or path</h2>
                    <form class="learn-search__form" role="search" onsubmit="return false">
                        <label class="lx-label" for="learn-search-q">Search</label>
                        <input id="learn-search-q" class="lx-input learn-search__input" type="search" autocomplete="off" spellcheck="false" placeholder="For example: joins, NULL, DAX, JSONPath">
                        <div class="learn-search__filters">
                            <label>Department
                                <select class="lx-select" data-filter="department">
                                    <option value="">All departments</option>
                                    ${live.map((d) => `<option value="${esc(d.id)}">${esc(d.title)}</option>`).join("")}
                                </select>
                            </label>
                            <label>Type
                                <select class="lx-select" data-filter="kind">
                                    <option value="">Everything</option>
                                    <option value="lesson">Lessons</option>
                                    <option value="lab">Labs</option>
                                    <option value="path">Learning paths</option>
                                    <option value="project">Projects</option>
                                    <option value="interview">Interview practice</option>
                                    <option value="department">Departments</option>
                                </select>
                            </label>
                            <label>Level
                                <select class="lx-select" data-filter="level">
                                    <option value="">Any level</option>
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </label>
                        </div>
                    </form>
                    <p class="learn-search__status" role="status" aria-live="polite"></p>
                    <ol class="learn-search__results"></ol>
                </section>

                <section class="learn-section" aria-labelledby="learn-departments">
                    <h2 id="learn-departments">Departments</h2>
                    <p>Each department is a specialist area with its own learning paths and labs. A department opens when it has real lessons or labs to offer; the others are being built and are listed so you can see where the platform is going.</p>
                    <div class="learn-cards learn-cards--departments">
                        ${DEPARTMENTS.map((department) => isPublished(department) ? `
                        <a class="learn-card" href="${esc(departmentUrl(department))}">
                            <span class="learn-card__status">${esc(countText(departmentCounts(department)))}</span>
                            <strong>${esc(department.title)}</strong>
                            <span>${esc(department.short)}</span>
                        </a>` : `
                        <div class="learn-card learn-card--planned">
                            <span class="learn-card__status">In development</span>
                            <strong>${esc(department.title)}</strong>
                            <span>${esc(department.short)}</span>
                        </div>`).join("")}
                    </div>
                </section>

                <section class="learn-section" aria-labelledby="learn-where">
                    <h2 id="learn-where">Not sure where to start?</h2>
                    <ul>
                        ${live.filter((d) => d.start).map((d) => `<li><a href="${esc(startHref(d.start))}">${esc(d.start.label)}</a> (${esc(d.title)})</li>`).join("")}
                    </ul>
                    <p>Every lesson shows what you need first and what comes next, so you can also start from any topic you need today.</p>
                </section>

                <p class="learn-start"><a class="learn-link" href="${esc(HUB())}">See every Practice Lab and the Smart Flashcards on one page</a></p>`;

}

/* the department's own sidebar: its learning paths, its labs, the other departments; the same markup as every ecosystem sidebar */
function departmentNav(department) {

    const link = (href, label) => `<li><a href="${esc(href)}">${esc(label)}</a></li>`;
    const groups = [
        ["Learning paths", department.paths.map(getPath).filter(Boolean).map((path) => link(pathUrl(path), `${path.title} learning path`))],
        ["Labs", department.labs.map((id) => link(labOf(id).href, labOf(id).title))],
        ["Other departments", publishedDepartments().filter((d) => d.id !== department.id).map((d) => link(departmentUrl(d), d.title))]
    ].filter(([, items]) => items.length);

    return `
                <nav class="section-switcher" data-rail-noun="page" aria-label="${esc(department.title)}: switch page">
                    <details>
                        <summary>
                            <span>${esc(department.title)}</span>
                            <span class="section-switcher__now">${esc(department.title)}</span>
                            <span class="section-switcher__count">${groups.reduce((sum, [, items]) => sum + items.length, 0)}</span>
                        </summary>
                        <p class="section-switcher__overview"><a href="${esc(departmentUrl(department))}" aria-current="page">${esc(department.title)} overview</a></p>
                        <ul class="section-switcher__list">${groups.map(([label, items]) => `
                            <li class="section-switcher__group" data-open="true">
                                <span class="section-switcher__label">${esc(label)}</span>
                                <ul>${items.join("")}</ul>
                            </li>`).join("")}
                        </ul>
                        <p class="section-switcher__all"><a href="${esc(OVERVIEW())}">All departments</a></p>
                    </details>
                </nav>`;

}

function departmentBody(department) {

    const paths = department.paths.map(getPath).filter(Boolean);
    const start = startHref(department.start);
    const statusText = { path: "Learning path", lab: "Lab", planned: "Being built" };
    const technologyHref = (t) => t.status === "path" ? pathUrl(getPath(t.path)) : t.status === "lab" ? labOf(t.lab).href : null;
    const related = department.related.map(getDepartment).filter(Boolean);

    return `
                ${intro({ eyebrow: "Practice Labs department", title: department.title, text: department.short })}

                ${start ? `<p class="learn-start"><a class="learn-button" href="${esc(start)}">${esc(department.start.label)}</a></p>` : ""}

                <section class="learn-section" aria-labelledby="learn-about">
                    <h2 id="learn-about">What this department teaches</h2>
                    ${department.intro.map((paragraph) => `<p>${esc(paragraph)}</p>`).join("")}
                    <p><strong>It is for:</strong></p>
                    ${list(department.audience)}
                </section>

                <section class="learn-section" aria-labelledby="learn-tech">
                    <h2 id="learn-tech">Subjects</h2>
                    <ul class="learn-tech">
                        ${department.technologies.map((t) => {
                            const href = technologyHref(t);
                            return `<li><span class="learn-badge learn-badge--${esc(t.status)}">${esc(statusText[t.status])}</span> ${href ? `<a href="${esc(href)}">${esc(t.title)}</a>` : esc(t.title)}</li>`;
                        }).join("")}
                    </ul>
                </section>

                ${paths.length ? `
                <section class="learn-section" aria-labelledby="learn-paths">
                    <h2 id="learn-paths">Learning paths</h2>
                    <div class="learn-cards">
                        ${paths.map((path) => `
                        <a class="learn-card" href="${esc(pathUrl(path))}">
                            <span class="learn-card__status">${lessonCount(path)} lessons · Beginner to Advanced${path.status === "building" ? " · still growing" : ""}</span>
                            <strong>${esc(path.title)}</strong>
                            <span>${esc(path.tagline)}</span>
                        </a>`).join("")}
                    </div>
                </section>` : ""}

                ${department.labs.length ? `
                <section class="learn-section" aria-labelledby="learn-labs">
                    <h2 id="learn-labs">Labs</h2>
                    <p>A lab is a set of exercises with an exact check, each with hints and an explained solution. Labs are the place to come back to for more practice.</p>
                    <div class="learn-cards">
                        ${department.labs.map((id) => labOf(id)).map((lab) => `
                        <a class="learn-card" href="${esc(lab.href)}">
                            <span class="learn-card__status">Lab · checked in your browser</span>
                            <strong>${esc(lab.title)}</strong>
                            <span>${esc(lab.description)}</span>
                        </a>`).join("")}
                    </div>
                </section>` : ""}

                ${department.decks.length ? `
                <section class="learn-section" aria-labelledby="learn-revise">
                    <h2 id="learn-revise">Revise</h2>
                    <p>The <a href="${esc(labOf("smart-flashcards").href)}">Smart Flashcards</a> have original decks for ${esc(department.decks.join(" and "))}. Use them a few days after a lesson to keep the terms fresh; saving your revision dates on this device is optional and off until you turn it on.</p>
                </section>` : ""}

                ${related.length ? `
                <section class="learn-section" aria-labelledby="learn-related-depts">
                    <h2 id="learn-related-depts">Related departments</h2>
                    <ul>
                        ${related.map((d) => `<li>${isPublished(d) ? `<a href="${esc(departmentUrl(d))}">${esc(d.title)}</a>` : `${esc(d.title)} (in development)`}: ${esc(d.short)}</li>`).join("")}
                    </ul>
                </section>` : ""}`;

}


/* =========================================================
   THE SEARCH INDEX (/practice-labs/search-index.json)
   Built from the same data as the pages, so search can only find pages that exist.
========================================================= */

export function learnSearchIndex() {

    const entries = [];

    for (const department of publishedDepartments()) {
        entries.push({ kind: "department", title: department.title, url: departmentUrl(department), department: department.id, level: "", text: department.short });
        for (const id of department.labs) {
            const lab = labOf(id);
            entries.push({ kind: "lab", title: lab.title, url: lab.href, department: department.id, level: "", text: lab.description });
        }
    }

    for (const path of publishedPaths()) {
        const content = CONTENT[path.id];
        entries.push({ kind: "path", title: `${path.title} learning path`, url: pathUrl(path), department: path.department, level: "", text: path.tagline });
        for (const entry of flatLessons(path)) {
            const data = content.lessons.get(entry.lesson.id);
            entries.push({
                kind: "lesson",
                title: entry.lesson.title,
                url: lessonUrl(entry.path, entry.level, entry.module, entry.lesson),
                department: path.department,
                level: entry.level.id,
                where: `${path.title} · ${LEVELS[entry.level.id].title} · ${entry.module.title}`,
                text: `${firstSentence(data.intro)} ${data.objectives.join(". ")}`
            });
        }
    }

    for (const path of publishedPaths()) {
        const content = CONTENT[path.id];
        for (const project of content.projects ?? []) {
            entries.push({ kind: "project", title: project.title, url: projectUrl(path, project), department: path.department, level: project.level, where: `${path.title} · Project`, text: project.scenario });
        }
        if (content.interview) {
            entries.push({ kind: "interview", title: `${path.title} interview practice`, url: interviewUrl(path), department: path.department, level: "", text: content.interview.quiz.map((q) => q.q).join(" ") });
        }
    }

    /* a lab belongs to the first department that lists it; drop repeats */
    const seen = new Set();
    return entries.filter((e) => (seen.has(e.url) ? false : seen.add(e.url)));

}


/* =========================================================
   ALL PAGES
========================================================= */

const lessonTitle = (data, level, path) => `${data.title} | ${path.title} ${LEVELS[level.id].title} Lesson | ${SITE_NAME}`;

export function learnPages() {

    const pages = [];

    const homeTrail = [{ label: "Practice Labs", href: HUB() }, { label: "Departments" }];

    pages.push({
        kind: "overview",
        ...pageEntry({
            url: OVERVIEW(),
            title: `Practice Labs Departments: Learn and Practise Software Skills | ${SITE_NAME}`,
            description: "Learn software skills by doing them: SQL, testing, analytics, APIs and more, with lessons, checked exercises and labs that run in your browser. Free, no sign-up.",
            html: frame({ trail: homeTrail, nav: "", body: overviewBody() }),
            trail: homeTrail
        })
    });

    for (const department of publishedDepartments()) {

        const trail = [{ label: "Practice Labs", href: HUB() }, { label: department.title }];

        pages.push({
            kind: "department",
            ...pageEntry({
                url: departmentUrl(department),
                title: `${department.title}: Lessons, Labs and Practice | ${SITE_NAME}`,
                description: department.short,
                html: frame({ trail, nav: departmentNav(department), body: departmentBody(department) }),
                trail
            })
        });

    }

    for (const path of publishedPaths()) {

        const content = CONTENT[path.id];
        const all = flatLessons(path);
        const pathTrail = [...pathCrumbs(path), { label: path.title }];

        pages.push({
            kind: "path",
            ...pageEntry({
                url: pathUrl(path),
                title: `Learn ${path.title} Online: Free ${path.title} Learning Path | ${SITE_NAME}`,
                description: `${path.tagline} ${all.length} lessons so far.`,
                html: frame({ trail: pathTrail, nav: roadmapNav(path), body: pathBody(path, content) }),
                trail: pathTrail
            })
        });

        for (const level of path.levels) {

            const levelTrail = [...pathCrumbs(path), { label: path.title, href: pathUrl(path) }, { label: LEVELS[level.id].title }];

            pages.push({
                kind: "level",
                ...pageEntry({
                    url: levelUrl(path, level),
                    title: `${path.title} ${LEVELS[level.id].title}: Lessons and Exercises | ${SITE_NAME}`,
                    description: `${LEVELS[level.id].summary} ${level.modules.map((m) => m.title).join(", ")}.`,
                    html: frame({ trail: levelTrail, nav: roadmapNav(path, { currentModuleId: level.modules[0].id, now: `${LEVELS[level.id].title} level` }), body: levelBody(path, level, content) }),
                    trail: levelTrail
                })
            });

            for (const module of level.modules) {

                const moduleTrail = [...pathCrumbs(path), { label: path.title, href: pathUrl(path) }, { label: LEVELS[level.id].title, href: levelUrl(path, level) }, { label: module.title }];

                pages.push({
                    kind: "module",
                    ...pageEntry({
                        url: moduleUrl(path, level, module),
                        title: `${module.title}: ${path.title} ${LEVELS[level.id].title} Module | ${SITE_NAME}`,
                        description: module.summary,
                        html: frame({ trail: moduleTrail, nav: roadmapNav(path, { currentModuleId: module.id, now: module.title }), body: moduleBody(path, level, module, content) }),
                        trail: moduleTrail
                    })
                });

                for (const lesson of module.lessons) {

                    const entry = all.find((e) => e.lesson === lesson);
                    const data = content.lessons.get(lesson.id);
                    const lessonTrail = [...moduleTrail.slice(0, -1), { label: module.title, href: moduleUrl(path, level, module) }, { label: lesson.title }];

                    pages.push({
                        kind: "lesson",
                        ...pageEntry({
                            url: lessonUrl(path, level, module, lesson),
                            title: lessonTitle(data, level, path),
                            description: `${firstSentence(data.intro)} ${LEVELS[level.id].title} ${path.title} lesson with examples, exercises and answers.`,
                            html: frame({ trail: lessonTrail, nav: roadmapNav(path, { currentLessonId: lesson.id, now: lesson.title }), body: lessonBody(entry, content) }),
                            trail: lessonTrail
                        })
                    });

                }

            }

        }

        if (content.projects?.length) {

            const projectsTrail = [...pathCrumbs(path), { label: path.title, href: pathUrl(path) }, { label: "Projects" }];

            pages.push({
                kind: "projects",
                ...pageEntry({
                    url: projectsUrl(path),
                    title: `${path.title} Projects: Practice With Real Datasets | ${SITE_NAME}`,
                    description: `${content.projects.length} ${path.title} practice projects with realistic data and milestones checked in your browser: ${content.projects.map((p) => p.title).join(", ")}.`,
                    html: frame({ trail: projectsTrail, nav: roadmapNav(path, { now: "Projects", currentExtra: "projects" }), body: projectsIndexBody(path, content) }),
                    trail: projectsTrail
                })
            });

            content.projects.forEach((project, index) => {
                const trail = [...pathCrumbs(path), { label: path.title, href: pathUrl(path) }, { label: "Projects", href: projectsUrl(path) }, { label: project.title }];
                pages.push({
                    kind: "project",
                    ...pageEntry({
                        url: projectUrl(path, project),
                        title: `${project.title}: ${path.title} Project | ${SITE_NAME}`,
                        description: `${firstSentence(project.scenario)} A ${path.title} practice project with ${project.milestones.length} checked milestones.`,
                        html: frame({ trail, nav: roadmapNav(path, { now: project.title, currentExtra: `project:${project.id}` }), body: projectBody(path, project, index, content) }),
                        trail
                    })
                });
            });

        }

        if (content.interview) {

            const trail = [...pathCrumbs(path), { label: path.title, href: pathUrl(path) }, { label: "Interview practice" }];

            pages.push({
                kind: "interview",
                ...pageEntry({
                    url: interviewUrl(path),
                    title: `${path.title} Interview Questions with Checked Answers | ${SITE_NAME}`,
                    description: content.interview.description ?? `${content.interview.quiz.length} ${path.title} interview questions with explanations, checked in your browser.`,
                    html: frame({ trail, nav: roadmapNav(path, { now: "Interview practice", currentExtra: "interview" }), body: interviewBody(path, content) }),
                    trail
                })
            });

        }

    }

    return pages;

}

export { getPath };
