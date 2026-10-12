/* =========================================================
   ToolZen Hub
   Cron Expression Explainer (Developer Tools)

   Paste a cron expression written in cronie crontab syntax (five
   time fields, or one alias such as @daily) and read what each
   field means, a plain-language summary where one can be stated
   exactly, and the next five matching times in UTC. All of the
   rules (syntax, the day-of-month / day-of-week rule, the search
   for the next runs, the summary and the notes) are in
   cron-engine.js; this file is the page around them and does not
   repeat any of them.

   The tool reads ONE dialect and says so on the page. It is not
   Kubernetes, GitHub Actions, Quartz or AWS syntax, and it makes
   no claim about other cron programs.

   Behaviour that matters:
   - The expression is explained only when the visitor presses
     Explain (or Enter in the box, or an example). Typing and
     pasting never explain, never announce and never change the
     result, and the clipboard is never read.
   - Everything from the expression is put on the page with
     textContent, never as HTML and never as a link.
   - Copy offers only the normalised expression or the summary
     text, and only when the visitor presses its button.
   - No network request, no storage of any kind, no URL or title
     change and no logging of the expression.
========================================================= */

import {
    explainCron,
    DIALECT,
    MAX_INPUT_CHARS
} from "./cron-engine.js";

import {
    getToolById
} from "../../data/tools.js";


/* No related calculator or article exists; the tool links the Unix Timestamp Converter in its text. */
export const showRelatedCalculators = false;
export const showRelatedArticles = false;


const TITLE =
    getToolById("cron-expression-explainer").title;

const TIMESTAMP_TOOL =
    getToolById("unix-timestamp-converter");

const EXAMPLES = [
    "*/15 * * * *",
    "30 4 * * mon-fri",
    "0 0 1,15 * 5",
    "0 */2 * * *",
    "@daily",
    "0 0 29 2 *"
];

const countText = (n) =>
    `${n.toLocaleString("en-US")} character${n === 1 ? "" : "s"}`;


/* =========================================================
   MARKUP
   Static HTML, rendered into the generated page by the site build.
========================================================= */

export function markup() {

    return `
        <div class="calculator-page">

            <!-- INTRO -->

            <section class="calculator-intro">

                <div>

                    <span class="calculator-eyebrow">
                        Developer Tool
                    </span>

                    <h1>
                        ${TITLE}
                    </h1>

                    <p>
                        Paste a five-field cron expression to see what each
                        field means, a plain-language summary and the next
                        five matching times in UTC. It checks the syntax and
                        says what it does not support.
                    </p>

                </div>

                <div class="calculator-trust-card">

                    <div class="calculator-trust-icon">
                        ✓
                    </div>

                    <div>

                        <strong>
                            100% Free to Use
                        </strong>

                        <span>
                            Your expression is read in your browser
                        </span>

                    </div>

                </div>

            </section>


            <!-- THE WORKSPACE -->

            <section class="calculator-section">

                <div
                    id="ce-panel"
                    class="ce-workspace"
                    data-state="empty"
                >

                    <p
                        id="ce-dialect"
                        class="ce-dialect"
                    >
                        <strong>${DIALECT}.</strong>
                        Not Kubernetes, GitHub Actions, Quartz or AWS syntax,
                        which differ. Other cron programs may differ too.
                    </p>

                    <div class="ce-pane">

                        <div class="ce-pane__head">

                            <label
                                for="ce-input"
                                class="ce-label"
                            >
                                Cron expression
                            </label>

                            <span
                                id="ce-count"
                                class="ce-meta"
                            >0 characters</span>

                        </div>

                        <input
                            type="text"
                            id="ce-input"
                            class="ce-input"
                            spellcheck="false"
                            autocomplete="off"
                            autocapitalize="off"
                            autocorrect="off"
                            aria-describedby="ce-hint"
                        >

                        <p
                            id="ce-hint"
                            class="ce-hint"
                        >
                            Five fields separated by spaces: minute, hour,
                            day of month, month, day of week. Or one alias
                            such as <code>@daily</code>. Then press Explain.
                        </p>

                    </div>

                    <div class="ce-examples-wrap">

                        <p
                            id="ce-examples-label"
                            class="ce-examples-label"
                        >Examples</p>

                        <div
                            class="ce-examples"
                            role="group"
                            aria-labelledby="ce-examples-label"
                        >
                            ${EXAMPLES.map((expression) => `
                            <button
                                type="button"
                                class="ce-chip"
                                data-expression="${expression}"
                            >${expression}</button>`).join("")}
                        </div>

                    </div>

                    <div class="ce-actions">

                        <button
                            type="button"
                            id="ce-explain"
                            class="calculator-form__button ce-button"
                        >
                            Explain
                        </button>

                        <button
                            type="button"
                            id="ce-reset"
                            class="calculator-form__button calculator-form__button--secondary ce-button"
                        >
                            Reset
                        </button>

                    </div>


                    <div class="ce-result">

                        <p
                            id="ce-status"
                            class="ce-status"
                        >
                            <span
                                id="ce-status-text"
                            >Enter an expression, or choose an example.</span>
                        </p>

                        <p
                            id="ce-stale"
                            class="ce-stale"
                            hidden
                        >The text in the box changed after this was explained. Press Explain to update.</p>

                        <div
                            id="ce-error"
                            class="ce-error"
                            hidden
                        >

                            <p class="ce-error__title">
                                This could not be read as a cron expression
                            </p>

                            <p
                                id="ce-error-message"
                                class="ce-error__message"
                            ></p>

                            <p
                                id="ce-error-where"
                                class="ce-error__where"
                            ></p>

                        </div>

                    </div>


                    <div
                        id="ce-results"
                        class="ce-results"
                        hidden
                    >

                        <h2
                            id="ce-results-heading"
                            class="ce-results__heading"
                            tabindex="-1"
                        >
                            Explanation
                        </h2>

                        <section class="ce-card ce-card--wide" aria-labelledby="ce-summary-heading">

                            <div class="ce-card__head">
                                <h3 id="ce-summary-heading">Summary</h3>
                                <div class="ce-card__tools">
                                    <button
                                        type="button"
                                        id="ce-copy-expression"
                                        class="calculator-form__button calculator-form__button--secondary ce-copy"
                                    >Copy expression</button>
                                    <button
                                        type="button"
                                        id="ce-copy-summary"
                                        class="calculator-form__button calculator-form__button--secondary ce-copy"
                                    >Copy summary</button>
                                </div>
                            </div>

                            <p id="ce-summary" class="ce-summary"></p>

                            <dl id="ce-expression" class="ce-list"></dl>

                        </section>

                        <section class="ce-card ce-card--wide" aria-labelledby="ce-fields-heading">
                            <h3 id="ce-fields-heading">Field by field</h3>
                            <div id="ce-fields" class="ce-fields"></div>
                        </section>

                        <section class="ce-card" aria-labelledby="ce-notes-heading">
                            <h3 id="ce-notes-heading">Notes</h3>
                            <p id="ce-notes-empty" class="ce-muted" hidden>Nothing here needs a special note.</p>
                            <ul id="ce-notes" class="ce-notes"></ul>
                        </section>

                        <section class="ce-card" aria-labelledby="ce-runs-heading">
                            <h3 id="ce-runs-heading">Next five matching times (UTC)</h3>
                            <p id="ce-runs-never" class="ce-muted" hidden></p>
                            <ol id="ce-runs" class="ce-runs"></ol>
                            <ul id="ce-assumptions" class="ce-assumptions"></ul>
                        </section>

                    </div>

                </div>

            </section>

            <p
                id="ce-live"
                class="ce-sr-only"
                role="status"
                aria-live="polite"
            ></p>


            <!-- HOW TO USE -->

            <section class="calculator-info">

                <h2>
                    How to Use the ${TITLE}
                </h2>

                <ol>
                    <li>
                        Type or paste a cron expression into the box, or choose
                        an example. It has five fields separated by spaces, or
                        it is one alias such as <code>@daily</code>.
                    </li>
                    <li>
                        Press Explain, or press Enter in the box. Nothing is
                        explained while you type.
                    </li>
                    <li>
                        Read the summary where there is one, the meaning of each
                        field, the notes about anything subtle, and the next
                        five times the expression matches, in UTC.
                    </li>
                    <li>
                        If the text cannot be read, the message says which field
                        is wrong and where. Reset clears the box and the result.
                    </li>
                </ol>

            </section>


            <!-- SYNTAX AT A GLANCE -->

            <section class="calculator-info">

                <h2>
                    Crontab Syntax at a Glance
                </h2>

                <p>
                    This tool reads the crontab time syntax of the cronie
                    project. A time has five fields:
                </p>

                <div class="ce-scroll" role="region" aria-label="The five fields and their values" tabindex="0">
                    <table class="ce-static-table">
                        <thead>
                            <tr><th scope="col">Field</th><th scope="col">Values</th><th scope="col">Names</th></tr>
                        </thead>
                        <tbody>
                            <tr><th scope="row">Minute</th><td>0 to 59</td><td>None</td></tr>
                            <tr><th scope="row">Hour</th><td>0 to 23</td><td>None</td></tr>
                            <tr><th scope="row">Day of month</th><td>1 to 31</td><td>None</td></tr>
                            <tr><th scope="row">Month</th><td>1 to 12</td><td><code>jan</code> to <code>dec</code></td></tr>
                            <tr><th scope="row">Day of week</th><td>0 to 7 (0 and 7 are both Sunday)</td><td><code>sun</code> to <code>sat</code></td></tr>
                        </tbody>
                    </table>
                </div>

                <ul>
                    <li><code>*</code> means every value in the field's range.</li>
                    <li><code>1,15</code> is a list; <code>8-11</code> is an inclusive range (the first number must be at most the second).</li>
                    <li><code>*/15</code> and <code>0-23/2</code> are steps. A step follows <code>*</code> or a range, and it restarts in each field.</li>
                    <li>Names are three letters in any case, in the month and day-of-week fields only.</li>
                    <li>Aliases read here: <code>@yearly</code>, <code>@annually</code>, <code>@monthly</code>, <code>@weekly</code>, <code>@daily</code>, <code>@midnight</code> and <code>@hourly</code>, written alone and in lowercase.</li>
                </ul>

                <p>
                    Refused, each with its own message: <code>?</code>,
                    <code>L</code>, <code>W</code>, <code>#</code>,
                    <code>~</code>, <code>@reboot</code>, a step after a single
                    number such as <code>0/35</code>, a range that runs
                    backwards, a sixth field, full names such as
                    <code>monday</code>, and anything that is not plain ASCII.
                    The tool accepts at most ${MAX_INPUT_CHARS} characters, 64
                    per field and 3 digits per number; those are limits of this
                    tool, not of cron.
                </p>

            </section>


            <!-- DAY OF MONTH AND DAY OF WEEK -->

            <section class="calculator-info">

                <h2>
                    Day of Month and Day of Week
                </h2>

                <p>
                    The two day fields are combined by a rule that surprises
                    many people. In cronie, if <strong>both</strong> fields are
                    written without a <code>*</code>, the command runs when
                    <strong>either</strong> one matches. If either field starts
                    with <code>*</code>, <strong>both</strong> must match. The
                    rule looks at how the field is <em>written</em>, not at the
                    days it selects.
                </p>

                <div class="ce-scroll" role="region" aria-label="Examples of the day rule for March 2026" tabindex="0">
                    <table class="ce-static-table">
                        <caption>Days of March 2026 (1 March is a Sunday) on which each expression runs at 00:00</caption>
                        <thead>
                            <tr><th scope="col">Expression</th><th scope="col">Rule</th><th scope="col">Days</th></tr>
                        </thead>
                        <tbody>
                            <tr><th scope="row"><code>0 0 1,15 * 5</code></th><td>Both restricted: either</td><td>1, 6, 13, 15, 20, 27</td></tr>
                            <tr><th scope="row"><code>0 0 * * 5</code></th><td>Day of month is a star: both</td><td>6, 13, 20, 27</td></tr>
                            <tr><th scope="row"><code>0 0 1,15 * *</code></th><td>Day of week is a star: both</td><td>1, 15</td></tr>
                            <tr><th scope="row"><code>0 0 */2 * 1</code></th><td>Starts with *: both</td><td>9, 23</td></tr>
                            <tr><th scope="row"><code>0 0 1-31 * 1</code></th><td>Not written with *: either</td><td>Every day</td></tr>
                            <tr><th scope="row"><code>0 0 1 * 0-7</code></th><td>Not written with *: either</td><td>Every day</td></tr>
                        </tbody>
                    </table>
                </div>

                <p>
                    The cronie source describes it in a comment:
                    <code>* * 1,15 * Sun</code> runs on the first and fifteenth
                    and every Sunday; <code>* * * * Sun</code> runs only on
                    Sundays; <code>* * 1,15 * *</code> runs only on the first
                    and fifteenth.
                </p>

            </section>


            <!-- STEPS -->

            <section class="calculator-info">

                <h2>
                    Why */35 Is Not Every 35 Minutes
                </h2>

                <p>
                    A step is evaluated inside its field. <code>*/35</code> in
                    the minute field means the minutes 0 and 35 of <em>every</em>
                    hour, so it runs at 10:00, 10:35, 11:00, 11:35 and so on,
                    which is not a 35-minute interval. The same holds for hours:
                    <code>*/23</code> is the hours 0 and 23. If the step is
                    larger than the range, only the first value matches, and the
                    tool says so.
                </p>

                <p>
                    A step after a single number, such as <code>0/35</code>, is a
                    syntax error in cronie. Write <code>0-59/35</code> or
                    <code>*/35</code>.
                </p>

            </section>


            <!-- DIALECTS COMPARED -->

            <section class="calculator-info">

                <h2>
                    Cron Dialects Compared
                </h2>

                <p>
                    The same five-field look hides real differences. This tool
                    supports only the first column. The other columns are what
                    each project's own documentation says, as read on 12 October
                    2026. A dash means this page makes no claim: check that
                    project's documentation.
                </p>

                <div class="ce-scroll" role="region" aria-label="Cron dialects compared" tabindex="0">
                    <table class="ce-static-table ce-dialects">
                        <thead>
                            <tr>
                                <th scope="col"><span class="ce-sr-only">Topic</span></th>
                                <th scope="col">Cronie (this tool)</th>
                                <th scope="col">Kubernetes CronJob</th>
                                <th scope="col">GitHub Actions</th>
                                <th scope="col">Quartz</th>
                                <th scope="col">AWS EventBridge Scheduler</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th scope="row">Time fields</th>
                                <td>5, then the command</td>
                                <td>5</td>
                                <td>5</td>
                                <td>6 or 7: seconds first, then minutes, hours, day of month, month, day of week, and an optional year</td>
                                <td>6, including a year</td>
                            </tr>
                            <tr>
                                <th scope="row">Day of week</th>
                                <td>0 to 7 (0 and 7 are Sunday) or names</td>
                                <td>0 to 6 (Sunday to Saturday) or names</td>
                                <td>0 to 6 or SUN to SAT</td>
                                <td>1 to 7 or SUN to SAT</td>
                                <td>1 to 7 or SUN to SAT</td>
                            </tr>
                            <tr>
                                <th scope="row">Both day fields set</th>
                                <td>If both are written without <code>*</code>, either may match; if either starts with <code>*</code>, both must match</td>
                                <td>—</td>
                                <td>—</td>
                                <td>Support for setting both is not complete; <code>?</code> must currently be used in one</td>
                                <td><code>*</code> cannot be used in both; <code>?</code> goes in the other</td>
                            </tr>
                            <tr>
                                <th scope="row"><code>?</code> <code>L</code> <code>W</code> <code>#</code></th>
                                <td>Not supported; <code>?</code> is a syntax error</td>
                                <td><code>?</code> means the same as <code>*</code></td>
                                <td>—</td>
                                <td>Supported</td>
                                <td>Supported, each in its own fields</td>
                            </tr>
                            <tr>
                                <th scope="row">Steps</th>
                                <td>After <code>*</code> or a range only; <code>0/35</code> is a syntax error</td>
                                <td>After a range or <code>*</code></td>
                                <td>Documented, with the example <code>20/15 * * * *</code></td>
                                <td><code>0/15</code> in the seconds field means 0, 15, 30 and 45</td>
                                <td><code>1/10</code> means every tenth minute from minute 1</td>
                            </tr>
                            <tr>
                                <th scope="row">Macros such as <code>@daily</code></th>
                                <td>Supported (<code>@midnight</code> is accepted by the source but not listed in the manual)</td>
                                <td>Supported, including <code>@midnight</code></td>
                                <td>Not supported</td>
                                <td>—</td>
                                <td>—</td>
                            </tr>
                            <tr>
                                <th scope="row">Time zone</th>
                                <td>The daemon's; <code>CRON_TZ</code> sets one per table</td>
                                <td>The controller's local zone unless <code>.spec.timeZone</code> is set</td>
                                <td>UTC by default; a <code>timezone</code> key takes an IANA name</td>
                                <td>—</td>
                                <td>UTC, or the IANA zone you choose</td>
                            </tr>
                            <tr>
                                <th scope="row">Daylight saving</th>
                                <td>Times that do not exist never match; repeated times run twice</td>
                                <td>—</td>
                                <td>—</td>
                                <td>—</td>
                                <td>A skipped time is not run in spring; a repeated time runs once in autumn; UTC is not adjusted</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <p>
                    Sources: the cronie manual page and source; the Kubernetes
                    CronJob page; the GitHub Actions "Events that trigger
                    workflows" page; the Quartz 2.3.0 CronTrigger tutorial; the
                    AWS EventBridge Scheduler "Schedule types" page.
                </p>

            </section>


            <!-- TIME ZONES -->

            <section class="calculator-info">

                <h2>
                    Time Zones and Daylight Saving
                </h2>

                <p>
                    The times this tool lists are in <strong>UTC</strong>. They
                    are not the local time of any server, and there is no
                    time-zone choice. The scheduler that runs your job decides
                    which zone the expression is read in, so a job that runs at
                    09:00 there may be a different hour here.
                </p>

                <p>
                    The cronie manual says that times which do not exist during
                    a daylight saving change never match, and that repeated
                    times run twice. This tool does not simulate daylight
                    saving. "Now" is the clock of this device, read once when
                    you press Explain. To convert an instant to other formats,
                    use the
                    <a href="${TIMESTAMP_TOOL.href}">${TIMESTAMP_TOOL.title}</a>.
                </p>

            </section>


            <!-- WHAT IT DOES NOT DO -->

            <section class="calculator-info">

                <h2>
                    What This Tool Does Not Do
                </h2>

                <ul>
                    <li>It does not run, test or even read a command: only the five time fields.</li>
                    <li>It does not read a crontab file or several lines.</li>
                    <li>It does not build or generate expressions.</li>
                    <li>It does not read Quartz, AWS, Kubernetes or GitHub Actions syntax as those systems do.</li>
                    <li>It does not promise that a real scheduler runs at the times shown.</li>
                    <li>It was checked against the cronie source and manual page. No cronie program was run to confirm it.</li>
                </ul>

            </section>


            <!-- FAQ -->

            <section class="calculator-info">

                <h2>
                    ${TITLE} FAQ
                </h2>

                <details>
                    <summary>
                        Does this work for Kubernetes or GitHub Actions?
                    </summary>
                    <p>
                        The syntax looks similar, but the projects differ: see
                        the comparison above. This tool is pinned to cronie
                        crontab syntax. A schedule written for another system can
                        look valid here and still mean something else there.
                    </p>
                </details>

                <details>
                    <summary>
                        Why does my schedule run on more days than I expected?
                    </summary>
                    <p>
                        When the day-of-month and day-of-week fields are both
                        written without <code>*</code>, cron runs when either one
                        matches. <code>0 0 1,15 * 5</code> runs on the 1st, the
                        15th and every Friday.
                    </p>
                </details>

                <details>
                    <summary>
                        What does */5 mean exactly?
                    </summary>
                    <p>
                        Every fifth value of that field, starting at its first
                        value. In the minute field it is 0, 5, 10 and so on up to
                        55, restarting in each hour.
                    </p>
                </details>

                <details>
                    <summary>
                        Why is 0/5 rejected?
                    </summary>
                    <p>
                        In cronie a step must follow <code>*</code> or a range.
                        Some other schedulers document a start value with a step,
                        but cronie does not read it, so the tool refuses it
                        rather than guess. Write <code>0-59/5</code> or
                        <code>*/5</code>.
                    </p>
                </details>

                <details>
                    <summary>
                        Is my expression sent anywhere?
                    </summary>
                    <p>
                        No. It is read by code running in your browser, and it
                        is not uploaded, stored or put in the page address.
                        Reloading the page clears it.
                    </p>
                </details>

            </section>

        </div>
    `;
}


/* =========================================================
   RENDER
========================================================= */

export function render(
    mount = document.querySelector("#app")
) {

    if (!mount) {
        return;
    }

    mount.innerHTML = markup();

    init();

}


/* =========================================================
   INIT
========================================================= */

export function init() {

    const panel = document.querySelector("#ce-panel");

    if (!panel) {
        return;
    }

    const input = document.querySelector("#ce-input");
    const count = document.querySelector("#ce-count");
    const statusText = document.querySelector("#ce-status-text");
    const stale = document.querySelector("#ce-stale");
    const errorBox = document.querySelector("#ce-error");
    const errorMessage = document.querySelector("#ce-error-message");
    const errorWhere = document.querySelector("#ce-error-where");
    const results = document.querySelector("#ce-results");
    const resultsHeading = document.querySelector("#ce-results-heading");
    const summaryText = document.querySelector("#ce-summary");
    const expressionList = document.querySelector("#ce-expression");
    const fieldsBox = document.querySelector("#ce-fields");
    const notesList = document.querySelector("#ce-notes");
    const notesEmpty = document.querySelector("#ce-notes-empty");
    const runsList = document.querySelector("#ce-runs");
    const runsNever = document.querySelector("#ce-runs-never");
    const assumptionsList = document.querySelector("#ce-assumptions");
    const live = document.querySelector("#ce-live");

    const buttons = {
        explain: document.querySelector("#ce-explain"),
        reset: document.querySelector("#ce-reset"),
        copyExpression: document.querySelector("#ce-copy-expression"),
        copySummary: document.querySelector("#ce-copy-summary")
    };

    const BASE_DESCRIPTION = "ce-hint";

    let announceTimer = null;

    /* what was explained, so Copy copies exactly what is shown and the page can tell when the box has moved on */
    let shown = null;

    let explainedFrom = null;


    /* ---------- small helpers ---------- */

    function announce(message) {

        clearTimeout(announceTimer);

        live.textContent = "";

        announceTimer = setTimeout(() => {
            live.textContent = message;
        }, 50);

    }

    function setStatus(kind, text) {

        panel.dataset.state = kind;

        statusText.textContent = text;

    }

    /* an element whose only content is text: nothing from an expression is ever markup */
    function node(tag, className, text) {

        const element = document.createElement(tag);

        if (className) {
            element.className = className;
        }

        if (text !== undefined) {
            element.textContent = text;
        }

        return element;

    }

    function row(list, term, ...details) {

        const wrap = node("div", "ce-row");

        wrap.append(node("dt", "", term));

        for (const detail of details) {
            wrap.append(node("dd", "", detail));
        }

        list.append(wrap);

    }

    function markInvalid(invalid) {

        if (invalid) {
            input.setAttribute("aria-invalid", "true");
            input.setAttribute("aria-describedby", `${BASE_DESCRIPTION} ce-error-message ce-error-where`);
        } else {
            input.removeAttribute("aria-invalid");
            input.setAttribute("aria-describedby", BASE_DESCRIPTION);
        }

    }

    function clearResults() {

        shown = null;
        explainedFrom = null;

        results.hidden = true;
        stale.hidden = true;
        errorBox.hidden = true;

        for (const element of [expressionList, fieldsBox, notesList, runsList, assumptionsList]) {
            element.replaceChildren();
        }

        summaryText.textContent = "";
        errorMessage.textContent = "";
        errorWhere.textContent = "";
        runsNever.textContent = "";
        runsNever.hidden = true;
        notesEmpty.hidden = true;

        buttons.copyExpression.disabled = true;
        buttons.copySummary.disabled = true;

        markInvalid(false);

    }

    function updateCount() {

        count.textContent = countText(input.value.length);

        if (explainedFrom !== null && input.value !== explainedFrom) {
            stale.hidden = false;
        } else {
            stale.hidden = true;
        }

    }


    /* ---------- showing a result ---------- */

    function showError(error) {

        results.hidden = true;

        shown = null;

        errorMessage.textContent = error.message;

        if (typeof error.position === "number") {
            errorWhere.textContent = `Position ${error.position}`;
            errorWhere.hidden = false;
        } else {
            errorWhere.textContent = "";
            errorWhere.hidden = true;
        }

        errorBox.hidden = false;

        markInvalid(true);

        setStatus("invalid", "Could not read this as a cron expression.");

        announce(`Could not read this as a cron expression. ${error.message}`);

        input.focus();

    }

    /* the field table as plain text, for Copy summary when there is no summary sentence */
    function fieldsAsText(result) {

        return result.fields
            .map((field) => `${field.name}: ${field.text} = ${field.meaning} (${field.valuesText})`)
            .join("\n");

    }

    function renderFields(result) {

        const table = node("div", "ce-table");

        table.setAttribute("role", "table");
        table.setAttribute("aria-label", "What each of the five fields means");

        const head = node("div", "ce-table__head");

        head.setAttribute("role", "row");

        for (const label of ["Field", "As written", "Meaning", "Values"]) {
            const cell = node("div", "ce-table__cell ce-table__cell--head", label);
            cell.setAttribute("role", "columnheader");
            head.append(cell);
        }

        table.append(head);

        for (const field of result.fields) {

            const line = node("div", "ce-table__row");

            line.setAttribute("role", "row");

            const cells = [
                ["Field", field.name, true],
                ["As written", field.text, false],
                ["Meaning", field.meaning, false],
                ["Values", field.valuesText, false]
            ];

            for (const [label, text, isHeader] of cells) {

                const cell = node("div", "ce-table__cell", text);

                cell.setAttribute("role", isHeader ? "rowheader" : "cell");
                cell.dataset.label = label;

                if (label === "As written") {
                    cell.classList.add("ce-mono");
                }

                line.append(cell);

            }

            table.append(line);

        }

        fieldsBox.replaceChildren(table);

    }

    function showExplained(result) {

        errorBox.hidden = true;

        markInvalid(false);

        /* summary and the expression */
        summaryText.textContent = result.summary
            ? `${result.summary.sentence}.`
            : "This schedule is explained field by field below.";

        expressionList.replaceChildren();

        row(expressionList, "Dialect", result.dialect);
        row(expressionList, "Expression", result.normalized);

        if (result.alias) {
            row(expressionList, `${result.alias.name} is the same as`, result.expansion);
        }

        renderFields(result);

        /* notes */
        notesList.replaceChildren();

        for (const note of result.notes) {
            notesList.append(node("li", "", note.text));
        }

        notesEmpty.hidden = result.notes.length > 0;

        /* next runs */
        runsList.replaceChildren();

        const runs = result.nextRuns;

        for (const run of runs.runs) {
            runsList.append(node("li", "ce-run", run.text));
        }

        if (runs.never) {
            runsNever.textContent = "This schedule never runs (for example, no month in it has day 31). The search covered a full 400-year calendar cycle.";
            runsNever.hidden = false;
        } else if (runs.runs.length === 0) {
            runsNever.textContent = "No matching time was found in the search.";
            runsNever.hidden = false;
        } else {
            runsNever.hidden = true;
        }

        assumptionsList.replaceChildren();

        for (const text of result.assumptions) {
            assumptionsList.append(node("li", "", text));
        }

        shown = {
            expression: result.normalized,
            summary: result.summary
                ? `${result.summary.sentence}.`
                : fieldsAsText(result)
        };

        buttons.copyExpression.disabled = false;
        buttons.copySummary.disabled = false;

        results.hidden = false;

        setStatus("explained", "Explained.");

        const noteCount = result.notes.length;

        const first = runs.runs[0];

        announce(
            `Explained. ${noteCount} note${noteCount === 1 ? "" : "s"}. ${first ? `Next run ${first.text}.` : "This schedule never runs."}`
        );

    }


    /* ---------- the one action ---------- */

    function explain() {

        const text = input.value;

        const result = explainCron(text, { nowMs: Date.now() });

        clearResults();

        explainedFrom = text;

        updateCount();

        switch (result.state) {

            case "empty":
                explainedFrom = null;
                setStatus("empty", "Enter an expression, or choose an example.");
                announce("There is no expression to explain.");
                input.focus();
                return;

            case "invalid":
                showError(result.error);
                return;

            default:
                showExplained(result);
                resultsHeading.focus({ preventScroll: false });

        }

    }


    /* ---------- copy: the text shown, only on a click ---------- */

    async function copy(which) {

        if (!shown) {
            return;
        }

        const text = shown[which];

        let copied = false;

        try {

            await navigator.clipboard.writeText(text);

            copied = true;

        } catch (problem) {

            try {

                const holder = node("textarea", "ce-sr-only");

                holder.value = text;
                holder.setAttribute("readonly", "");
                holder.setAttribute("aria-hidden", "true");

                document.body.append(holder);

                holder.select();

                copied = document.execCommand("copy");

                holder.remove();

            } catch (second) {

                copied = false;

            }

        }

        const message = copied
            ? `${which === "expression" ? "Expression" : "Summary"} copied to the clipboard.`
            : "Could not copy automatically. Select the text and copy it yourself.";

        announce(message);

        statusText.textContent = message;

    }


    /* ---------- events ---------- */

    buttons.explain.addEventListener("click", explain);

    buttons.reset.addEventListener("click", () => {

        input.value = "";

        clearResults();

        updateCount();

        setStatus("empty", "Cleared. Enter an expression, or choose an example.");

        announce("Cleared.");

        input.focus();

    });

    for (const chip of document.querySelectorAll(".ce-chip")) {

        chip.addEventListener("click", () => {

            input.value = chip.dataset.expression;

            explain();

        });

    }

    buttons.copyExpression.addEventListener("click", () => copy("expression"));

    buttons.copySummary.addEventListener("click", () => copy("summary"));

    input.addEventListener("input", updateCount);

    input.addEventListener("keydown", (event) => {

        if (event.key === "Enter") {

            event.preventDefault();

            explain();

        }

    });

    clearResults();

    updateCount();

    panel.dataset.ready = "true";

}
