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
import { LEVELS, PATHS, PRACTICE_LABS_PREFIX, flatLessons, getPath, lessonCount, lessonUrl, levelUrl, moduleUrl, pathUrl, publishedPaths } from "./curriculum.js";
import { lessons as sqlLessons } from "../tools/sql-practice-lab/lessons.js";
import { set as sqlSet } from "../tools/sql-practice-lab/exercises.js";
import { sqlExtras } from "./sql-extras.js";

const SITE_NAME = "ToolZen Hub";
const HUB = () => ROUTES.practiceLabs;
const OVERVIEW = () => PRACTICE_LABS_PREFIX;

/* the content of a path's lessons, by lesson id: the shared lesson data plus the teaching sections */
const CONTENT = {
    sql: {
        lessons: new Map(sqlLessons.map((lesson) => [lesson.id, { ...lesson, ...sqlExtras[lesson.id] }])),
        exercises: new Map(sqlSet.exercises.map((exercise, index) => [exercise.id, { ...exercise, number: index + 1 }])),
        labTool: "sql-practice-lab",
        flashcards: "smart-flashcards"
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
function roadmapNav(path, { currentLessonId = null, currentModuleId = null, now = null } = {}) {

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

const labTrail = [{ label: "Practice Labs", href: HUB() }];


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

function exerciseBlock(exercise, index) {

    return `
                    <div class="learn-exercise" data-exercise="${esc(exercise.id)}">
                        <h3>Exercise ${index + 1}: ${esc(exercise.title)}</h3>
                        <p class="learn-exercise__goal"><strong>Goal.</strong> ${esc(exercise.objective)}</p>
                        <p>${esc(exercise.instructions)}</p>
                        <div class="learn-exercise__tool" hidden>
                            <label class="lx-label" for="learn-sql-${esc(exercise.id)}">Your SQL</label>
                            <textarea id="learn-sql-${esc(exercise.id)}" class="lx-textarea learn-editor" rows="5" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" maxlength="4000"></textarea>
                            <div class="learn-actions">
                                <button type="button" class="lx-btn" data-learn-check>Check answer</button>
                                <button type="button" class="lx-btn lx-btn--quiet" data-learn-clear>Clear</button>
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

                <section class="learn-section" aria-labelledby="learn-objectives">
                    <h2 id="learn-objectives">What you will learn</h2>
                    ${list(data.objectives)}
                </section>

                <section class="learn-section" aria-labelledby="learn-before">
                    <h2 id="learn-before">Before you start</h2>
                    <p>${prerequisite}</p>
                </section>

                <section class="learn-section" aria-labelledby="learn-idea">
                    <h2 id="learn-idea">The idea in plain words</h2>
                    <p>${esc(data.intro)}</p>
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

                <section class="learn-section" aria-labelledby="learn-examples">
                    <h2 id="learn-examples">${data.examples.length === 1 ? "Worked example" : "Worked examples"}</h2>
                    <p>Each example shows the SQL, what it does and the result it returns. Press <strong>Run this example</strong> to run it yourself on the practice database in your browser.</p>
                    ${data.examples.map((example, index) => `
                    <div class="learn-example">
                        <h3>Example ${index + 1}</h3>
                        <p>${esc(example.says)}</p>
                        <pre class="lx-code" tabindex="0" role="region" aria-label="SQL of example ${index + 1}"><code data-sql-source>${esc(example.sql)}</code></pre>
                        ${resultTable(example, `example ${index + 1}`)}
                        <p><button type="button" class="lx-btn" data-sql-run hidden>Run this example</button></p>
                        <div class="lx-live-result" data-sql-out data-label="example ${index + 1}" role="status" aria-live="polite"></div>
                    </div>`).join("")}
                </section>

                ${exercises.length ? `
                <section class="learn-section" aria-labelledby="learn-practice">
                    <h2 id="learn-practice">Practice</h2>
                    <p>Write the query yourself, then check it. Your SQL runs for real on a fresh copy of the practice database, and nothing you type leaves your browser. A hint comes before the answer; the solution and its explanation are there when you want them.</p>
                    <noscript><p class="lx-note">Running and checking SQL needs JavaScript and WebAssembly. The tasks, hints and solutions below can still be read.</p></noscript>
                    ${exercises.map((exercise, index) => exerciseBlock(exercise, index)).join("")}
                </section>` : `
                <section class="learn-section" aria-labelledby="learn-practice">
                    <h2 id="learn-practice">Practice</h2>
                    <p>This lesson is explained in words and examples, with no exercise of its own. Try the examples above in the sandbox of the <a href="${esc(lab.href)}">${esc(lab.title)}</a>, which runs any SQL you write.</p>
                </section>`}

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
   PATH, LEVEL AND MODULE PAGES
========================================================= */

const lessonItem = (path, level, module, lesson, number, content, withBlurb = true) => {
    const data = content.lessons.get(lesson.id);
    return `<li><a href="${esc(lessonUrl(path, level, module, lesson))}">${number}. ${esc(lesson.title)}</a>${withBlurb && data ? `<span class="learn-blurb">${esc(firstSentence(data.intro))}</span>` : ""}</li>`;
};

function pathBody(path, content) {

    const all = flatLessons(path);
    const first = all[0];
    const lab = getToolById(content.labTool);

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

                <section class="learn-section" aria-labelledby="learn-coming">
                    <h2 id="learn-coming">Still to come on this path</h2>
                    <p>The ${esc(path.title)} path is being built one tested lesson at a time. It does not cover everything yet. Planned next:</p>
                    ${list(path.coming)}
                    <p>Until then, the <a href="${esc(lab.href)}">${esc(lab.title)}</a> has forty-nine exercises and a free sandbox.</p>
                </section>`;

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
   THE OVERVIEW OF ALL LEARNING PATHS (/practice-labs/)
========================================================= */

function overviewBody() {

    const built = publishedPaths();

    return `
                ${intro({ eyebrow: "Learn by doing", title: "Practice Labs learning paths", text: "Structured routes from zero to job-ready skills. Each path goes from Beginner to Advanced in short lessons with worked examples, exercises and answers. They run in your browser and nothing you type is uploaded." })}

                <section class="learn-section" aria-labelledby="learn-available">
                    <h2 id="learn-available">Available now</h2>
                    <div class="learn-cards">
                        ${built.map((path) => `
                        <a class="learn-card" href="${esc(pathUrl(path))}">
                            <span class="learn-card__status">${lessonCount(path)} lessons, still growing</span>
                            <strong>${esc(path.title)}</strong>
                            <span>${esc(path.tagline)}</span>
                        </a>`).join("")}
                    </div>
                </section>

                <section class="learn-section" aria-labelledby="learn-planned">
                    <h2 id="learn-planned">Planned, one complete path at a time</h2>
                    <p>These paths are planned and are not published yet. A path appears here as a link only when it has real lessons.</p>
                    <div class="learn-cards">
                        ${PATHS.filter((path) => path.status === "planned").map((path) => `
                        <div class="learn-card learn-card--planned">
                            <span class="learn-card__status">Planned</span>
                            <strong>${esc(path.title)}</strong>
                            <span>${esc(path.tagline)}</span>
                        </div>`).join("")}
                    </div>
                </section>

                <p class="learn-start"><a class="learn-link" href="${esc(HUB())}">Looking for single exercises and flashcards? See all Practice Labs.</a></p>`;

}


/* =========================================================
   ALL PAGES
========================================================= */

const lessonTitle = (data, level, path) => `${data.title} | ${path.title} ${LEVELS[level.id].title} Lesson | ${SITE_NAME}`;

export function learnPages() {

    const pages = [];

    pages.push({
        kind: "overview",
        ...pageEntry({
            url: OVERVIEW(),
            title: `Practice Labs learning paths: SQL and more | ${SITE_NAME}`,
            description: "Free structured learning paths with worked examples, exercises and answers that run in your browser. SQL is available now; more paths are planned.",
            html: frame({ trail: [{ label: "Practice Labs", href: HUB() }, { label: "Learning paths" }], nav: "", body: overviewBody() }),
            trail: [{ label: "Practice Labs", href: HUB() }, { label: "Learning paths" }]
        })
    });

    for (const path of publishedPaths()) {

        const content = CONTENT[path.id];
        const all = flatLessons(path);
        const pathTrail = [...labTrail, { label: path.title }];

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

            const levelTrail = [...labTrail, { label: path.title, href: pathUrl(path) }, { label: LEVELS[level.id].title }];

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

                const moduleTrail = [...labTrail, { label: path.title, href: pathUrl(path) }, { label: LEVELS[level.id].title, href: levelUrl(path, level) }, { label: module.title }];

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

    }

    return pages;

}

export { getPath };
