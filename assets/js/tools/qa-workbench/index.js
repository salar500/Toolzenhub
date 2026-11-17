/* =========================================================
   ToolZen Hub
   QA Requirement-to-Release Workbench (AI Tools, Tool Pack 59)

   The shell: static markup, project bar, stage switcher, event
   routing. Each stage is a module in stages/ loaded when it opens
   (QD24). Saving is downloading; the open project stays in this
   tab's memory (session.js, QD30); a warning guards unsaved work
   (QD28). Nothing is stored in the browser.
========================================================= */

import { getToolById } from "../../data/tools.js";
import { LIMITS } from "./core.js";
import { getSession, setSession } from "./session.js";
import { P, STAGES, e, btn, heading, common, values, resetFields } from "./stages/ui.js";

export const showRelatedCalculators = true;
export const showRelatedArticles = false;

const MODULES = {
    overview: () => import("./stages/overview.js"),
    requirements: () => import("./stages/requirements.js"),
    cases: () => import("./stages/cases.js"),
    coverage: () => import("./stages/coverage.js"),
    execution: () => import("./stages/execution.js"),
    defects: () => import("./stages/defects.js"),
    report: () => import("./stages/report.js")
};

const FAQ = [
    ["Is my project saved?", "Only when you download it. The project file is a Markdown document with your project's data at its end; open it here again to continue. While you stay in this tab, the project also stays open when you visit another AI tool and come back, but a reload, closing the tab, or a phone closing the tab in the background ends it. Nothing is stored in your browser."],
    ["How large can a project be?", `Up to ${LIMITS.requirements} requirements, ${LIMITS.criteria} acceptance criteria, ${LIMITS.testCases} test cases, ${LIMITS.executions.toLocaleString("en-IN")} test runs and ${LIMITS.defects} defects, in a file of up to ${LIMITS.fileBytes / 1000000} MB. A large project is slower on a phone; start a new project for the next release rather than growing one without end.`],
    ["Can my team work on the same project?", "By sharing the file: one person downloads it and another opens it. There is no live editing or merging, so agree who works on the file at a time."],
    ["Does it run my tests?", "No. You run the tests and record what happened. Nothing here, and no AI answer, can mark a test as passed."],
    ["How does the AI help work?", "You copy a request into the AI product you use, or open the AI Workbench with your criteria filled in, and paste the AI's table of test cases back here. Each suggestion is shown first; nothing is added until you accept it. The AI Output Reviewer can check an AI answer against your acceptance criteria."]
];

export function markup() {

    const tool = getToolById("qa-workbench");

    return `
        <div class="calculator-page">
            <section class="calculator-intro">
                <div>
                    <span class="calculator-eyebrow">AI Tool</span>
                    <h1>${e(tool.title)}</h1>
                    <p>Keep one QA project together: requirements and acceptance criteria, test cases, the mapping between them, your test runs and defects. See exactly what is mapped, what was run and what passed, and download a QA report you can defend. AI help is optional and always waits for your approval.</p>
                </div>
                <div class="calculator-trust-card"><div class="calculator-trust-icon">✓</div><div><strong>Runs in your browser</strong><span>Nothing is sent or stored • Saved only as a file you download</span></div></div>
            </section>
            <div id="${P}-app" class="${P}-app">
                <div id="${P}-bar" class="${P}-bar"><p class="${P}-bar__status">No project is open. Start one or open a project file in the Overview.</p></div>
                <nav class="${P}-nav" aria-label="Workbench stages">
                    <div class="${P}-nav__select"><label class="calculator-form__label" for="${P}-stage-select">Stage</label><select id="${P}-stage-select" class="calculator-form__input">${STAGES.map((s, i) => `<option value="${s.id}">${i + 1}. ${e(s.title)}</option>`).join("")}</select></div>
                    <ol class="${P}-stages">${STAGES.map((s, i) => `<li><button type="button" class="${P}-stage" data-stage="${s.id}"${i ? "" : ' aria-current="step"'}><span>${i + 1}.</span> ${e(s.title)}</button></li>`).join("")}</ol>
                </nav>
                <section id="${P}-panel" class="calculator-results__card ${P}-panel" aria-labelledby="${P}-stage-title">${heading("Start a QA project")}<p class="ai-note">The Workbench starts when this page's script runs.</p></section>
                <div class="${P}-pager" id="${P}-pager"></div>
            </div>
            <p id="${P}-live" class="ai-sr-only" role="status" aria-live="polite"></p>
            <section class="calculator-info">
                <h2>How the QA Workbench works</h2>
                <ol>
                    <li>Start a project, or open a project file you downloaded earlier.</li>
                    <li>Add requirements and their acceptance criteria: what must be true for the work to be done.</li>
                    <li>Write test cases with ordered steps and expected results, and map each one to the criteria it tests. AI suggestions can help; each one waits for you to accept it.</li>
                    <li>See which criteria have no test case, record each test run as Pass, Fail or Blocked, and turn failures into defects.</li>
                    <li>Download the QA report and the project file. Open the file again next time, or give it to a teammate.</li>
                </ol>
            </section>
            <section class="calculator-info">
                <h2>What the figures mean</h2>
                <h3>Mapped, executed, passed</h3><p>Mapped means a test case is linked to a criterion; it does not mean the criterion was tested. Executed means the latest run in scope passed or failed; it does not mean it passed. The three are always shown apart, and there is no combined score.</p>
                <h3>Latest run and scope</h3><p>A test case can be run many times. Its result is its latest run by date and time, in the build you choose or in all builds. Blocked tests are not passed and not executed; a test with no run in scope is not run.</p>
                <h3>Defects</h3><p>Outstanding defects are the open ones and the ones fixed but awaiting retest. Deferred and closed defects are shown separately.</p>
            </section>
            <section class="calculator-info">
                <h2>Frequently Asked Questions</h2>
                ${FAQ.map(([q, a]) => `<details class="calculator-faq__item"><summary>${e(q)}</summary><p>${e(a)}</p></details>`).join("")}
            </section>
        </div>`;

}

export function render(mount = document.querySelector("#app")) {

    if (!mount) return;
    mount.innerHTML = markup();
    init(mount);

}

export function init() {

    const root = document.getElementById(`${P}-app`);
    if (!root) return;

    const $ = (id) => document.getElementById(`${P}-${id}`);
    const panel = $("panel");

    /* the session survives in-place navigation (session.js); a fresh page load starts empty */
    let s = getSession();
    if (!s) {
        s = { project: null, dirty: false, downloadedAt: "", stage: "overview", build: "", decision: "", notes: "" };
        setSession(s);
    }

    const ui = { editing: null, filters: {}, open: new Set(), suggestions: [], suggestionNotes: [], preview: null, mapping: "", runFor: "", lastRun: "", aiReq: "" };
    const loaded = {};
    let current = null;
    let ticket = 0;
    let warning = false;

    const announce = (text) => {
        $("live").textContent = "";
        setTimeout(() => {
            $("live").textContent = text;
        }, 30);
    };

    const onUnload = (event) => {
        event.preventDefault();
        event.returnValue = "";
    };

    /* the warning is listened for only while there are changes that are not in a downloaded file */
    const syncWarning = () => {
        const want = Boolean(s.project && s.dirty);
        if (want && !warning) window.addEventListener("beforeunload", onUnload);
        if (!want && warning) window.removeEventListener("beforeunload", onUnload);
        warning = want;
    };

    const changed = () => {
        s.dirty = true;
        syncWarning();
    };

    function renderBar() {

        if (!s.project) {
            $("bar").innerHTML = `<p class="${P}-bar__status">No project is open. Start one or open a project file in the Overview.</p>`;
            return;
        }

        const at = s.downloadedAt.slice(11);
        const state = s.dirty
            ? (s.downloadedAt ? `Changed since the download at ${at}. Not saved to a file.` : "Not saved to a file.")
            : s.downloadedAt ? `Project downloaded at ${at}. No changes since.` : "Opened from a file. No changes since.";

        $("bar").innerHTML = `<div class="${P}-bar__name"><strong>${e(s.project.project.name)}</strong> <span class="${P}-bar__state" data-dirty="${s.dirty}">${e(state)}</span></div><div class="${P}-bar__actions">${btn("download", "Download project", { primary: true })}${btn("goto-open", "Open or start another")}</div><p class="ai-note ${P}-bar__note">The downloaded file is the only copy that survives a reload or a closed tab. On a phone, the browser may close this tab while you are in another app.</p>`;

    }

    function renderNav() {

        const p = s.project;
        const counts = p ? { requirements: p.requirements.length, cases: p.testCases.length, execution: p.executions.length, defects: p.defects.length } : {};

        STAGES.forEach((stage, i) => {
            const b = root.querySelector(`.${P}-stage[data-stage="${stage.id}"]`);
            b.innerHTML = `<span>${i + 1}.</span> ${e(stage.title)}${counts[stage.id] ? ` <span class="${P}-count">(${counts[stage.id]})</span>` : ""}`;
            if (stage.id === s.stage) b.setAttribute("aria-current", "step");
            else b.removeAttribute("aria-current");
        });

        $("stage-select").value = s.stage;

        const i = STAGES.findIndex((x) => x.id === s.stage);
        const pagerButton = (stage, word) => `<button type="button" class="calculator-form__button calculator-form__button--secondary qa-btn" data-stage="${stage.id}">${word}: ${e(stage.title)}</button>`;
        $("pager").innerHTML = p ? `${i > 0 ? pagerButton(STAGES[i - 1], "Previous") : ""}${i < STAGES.length - 1 ? pagerButton(STAGES[i + 1], "Next") : ""}` : "";

    }

    /* draws the shown stage; a newer draw started meanwhile wins */
    async function redraw({ keepFocus = null } = {}) {

        const mine = (ticket += 1);
        renderBar();
        renderNav();

        if (!s.project && s.stage !== "overview") {
            current = null;
            panel.innerHTML = `${heading(STAGES.find((x) => x.id === s.stage).title)}<p class="${P}-empty">No project is open yet. ${btn("goto-open", "Start or open a project")}</p>`;
            return;
        }

        const mod = await (loaded[s.stage] ??= MODULES[s.stage]());
        await mod.prepare?.(ctx);
        if (mine !== ticket) return;

        resetFields();
        panel.innerHTML = mod.html(ctx);
        current = mod;
        if (keepFocus) document.getElementById(keepFocus)?.focus();
        mod.after?.(ctx);

    }

    async function go(stage) {

        s.stage = MODULES[stage] ? stage : "overview";
        ui.editing = null;
        ui.mapping = "";
        await redraw();
        $("stage-title")?.focus();
        $("stage-title")?.scrollIntoView?.({ block: "nearest" });

    }

    async function download() {

        if (!s.project) return;
        const [{ projectFile, projectFileName }, { downloadText, today }, { stamp }] = await Promise.all([import("./project-file.js"), import("../ai-tools/common/pack-format.js"), import("./core.js")]);
        const savedOn = stamp();
        const name = projectFileName(s.project, today());
        downloadText(projectFile(s.project, savedOn), name);
        s.dirty = false;
        s.downloadedAt = savedOn;
        syncWarning();
        renderBar();
        if (s.stage === "overview") await redraw();
        announce(`Downloaded ${name}. Open it here again to continue.`);

    }

    const ctx = { s, ui, $, panel, announce, changed, syncWarning, redraw, go, download };

    /* ---------- events, routed to the shown stage's module ---------- */

    root.addEventListener("submit", (event) => {
        const formEl = event.target.closest("form[data-form]");
        if (!formEl) return;
        event.preventDefault();
        current?.submit?.[formEl.dataset.form]?.(ctx, formEl, values(formEl));
    });

    root.addEventListener("click", (event) => {

        const stageButton = event.target.closest("[data-stage]");
        if (stageButton && root.contains(stageButton)) {
            go(stageButton.dataset.stage);
            return;
        }

        const link = event.target.closest("a[data-act]");
        if (link) {
            current?.link?.(ctx, link, event);
            return;
        }

        const button = event.target.closest("button[data-act]");
        if (!button || !root.contains(button)) return;
        const act = button.dataset.act;
        (current?.actions?.[act] ?? common[act])?.(ctx, button.dataset.id, button);

    });

    /* disclosures keep their open state across redraws */
    root.addEventListener("toggle", (event) => {
        const id = event.target.dataset?.req ?? event.target.dataset?.openId;
        if (!id) return;
        if (event.target.open) ui.open.add(id);
        else ui.open.delete(id);
    }, true);

    /* filters and scope; searches wait for a pause in typing */
    let searchTimer = 0;

    root.addEventListener("input", (event) => {
        const el = event.target;
        if (el.type === "search" && el.dataset.filter !== undefined) {
            ui.filters[el.name] = el.value;
            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => redraw({ keepFocus: el.id }), 200);
        } else current?.onInput?.(ctx, el);
    });

    root.addEventListener("change", (event) => {
        const el = event.target;
        if (el.id === `${P}-stage-select`) go(el.value);
        else if (el.tagName === "SELECT" && el.dataset.filter !== undefined) {
            ui.filters[el.name] = el.value;
            redraw({ keepFocus: el.id });
        } else if (el.name === "build" && el.dataset.scope !== undefined) {
            s.build = el.value;
            redraw({ keepFocus: el.id });
        } else current?.onChange?.(ctx, el);
    });

    /* a returning visitor finds the project as it was left */
    syncWarning();
    redraw().then(() => {
        root.dataset.ready = "true";
    });

}
