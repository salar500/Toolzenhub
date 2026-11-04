/* =========================================================
   ToolZen Hub
   Shared calculator scaffold: a few fields, live results

   For a calculator whose whole job is "read some fields, show some
   figures". The calculator supplies a CONFIG (its wording, its fields
   and a pure solve() function); this file draws the same page the
   other calculators have (intro, form, results, how to use, reading
   the result, assumptions, a worked example, FAQ) and wires it.

   solve(values, context) is pure and returns one of
       { state: "incomplete" }
       { state: "invalid", errors: { fieldKey: "message" } }
       { state: "ok", metrics: [{ label, value, primary? }], notes: [text], summary: "text" }
   `values` holds the raw field strings. `context.today` is the
   device date (yyyy-mm-dd) so solve() itself stays testable.

   The worked example on the page is produced by calling solve() on
   config.example, so the numbers shown can never drift from the code.
   Everything runs in the browser; nothing is sent or stored.
========================================================= */

import { getCalculatorById } from "../../data/calculators.js";
import { fieldShell, setFieldsInvalid, clearFieldsInvalid } from "../../ui/field.js";
import { resultMetric, resultEmpty, resultError } from "../../ui/result.js";
import { escapeHTML } from "../../ui/escape.js";
import { parseNumber, todayIso, money, plain } from "./number-text.js";

export { parseNumber, todayIso, money, plain };


function controlHTML(prefix, f) {

    const id = `${prefix}-${f.key}`;
    const describedBy = `aria-describedby="${escapeHTML(id)}-hint"`;

    if (f.kind === "select") {

        const option = (o) => `<option value="${escapeHTML(o.value)}"${o.value === f.value ? " selected" : ""}>${escapeHTML(o.label)}</option>`;
        /* options may carry a `group`: consecutive options with the same group sit in one <optgroup> */
        const body = [];

        for (const o of f.options) {
            const last = body[body.length - 1];
            if (o.group && last && last.group === o.group) {
                last.items.push(o);
            } else {
                body.push({ group: o.group, items: [o] });
            }
        }

        return `<select id="${escapeHTML(id)}" class="calculator-form__input" ${describedBy}>${
            body.map((g) => g.group ? `<optgroup label="${escapeHTML(g.group)}">${g.items.map(option).join("")}</optgroup>` : g.items.map(option).join("")).join("")
        }</select>`;

    }

    if (f.kind === "date") {

        return `<input id="${escapeHTML(id)}" class="calculator-form__input" type="date" min="0001-01-01" max="9999-12-31" ${describedBy}>
                                <span class="tt-date-actions">
                                    <button type="button" class="tt-inline-button" data-today="${escapeHTML(id)}" aria-label="Use today's date for this field">Use today</button>
                                </span>`;

    }

    const slider = f.slider
        ? ` data-slider-min="${f.slider.min}" data-slider-max="${f.slider.max}" data-slider-step="${f.slider.step}"`
        : "";

    return `<input id="${escapeHTML(id)}" class="calculator-form__input" type="text" inputmode="decimal" autocomplete="off" autocapitalize="off" spellcheck="false"${f.value !== undefined ? ` value="${escapeHTML(f.value)}"` : ""}${slider} ${describedBy}>`;

}

function listHTML(items, tag = "ul") {

    return items?.length ? `<${tag}>${items.map((t) => `<li>${t}</li>`).join("")}</${tag}>` : "";

}

export function createSimpleCalculator(config) {

    const prefix = config.prefix;
    const tool = () => getCalculatorById(config.toolId);
    const ids = Object.fromEntries(config.fields.map((f) => [f.key, `${prefix}-${f.key}`]));
    const errorId = `${prefix}-results-error`;
    const defaultValues = () => Object.fromEntries(config.fields.map((f) => [f.key, f.value ?? ""]));

    function exampleHTML() {

        if (!config.example) {
            return "";
        }

        const solved = config.solve({ ...defaultValues(), ...config.example.values }, { today: config.example.today ?? "2026-01-01" });

        if (solved.state !== "ok") {
            return "";
        }

        return `
            <section class="calculator-info">
                <h2>Worked Example</h2>
                <p>${config.example.text}</p>
                ${listHTML(solved.metrics.map((m) => `<strong>${escapeHTML(m.label)}:</strong> ${escapeHTML(m.value)}`))}
            </section>`;

    }

    function markup() {

        const faq = (config.faq ?? []).map((q) => `
                    <details class="calculator-faq__item"><summary>${escapeHTML(q.q)}</summary><p>${q.a}</p></details>`).join("");

        return `
        <div class="calculator-page">

            <section class="calculator-intro">
                <div>
                    <span class="calculator-eyebrow">${escapeHTML(config.eyebrow)}</span>
                    <h1>${escapeHTML(tool().title)}</h1>
                    <p>${config.intro}</p>
                </div>
                <div class="calculator-trust-card">
                    <div class="calculator-trust-icon">✓</div>
                    <div>
                        <strong>100% Free to Use</strong>
                        <span>Calculated in your browser • Nothing is stored</span>
                    </div>
                </div>
            </section>

            <section class="calculator-section">
                <div class="calculator-section__title">${escapeHTML(config.sectionTitle)}</div>
                <p class="calculator-section__description">${config.sectionText}</p>
                <form id="${prefix}-form" class="calculator-form" novalidate>
                    <div class="calculator-form__grid">${config.fields.map((f) => fieldShell({
                        id: ids[f.key],
                        label: f.label,
                        unit: f.unit,
                        hint: f.hint,
                        control: controlHTML(prefix, f)
                    })).join("")}
                    </div>
                    <div class="calculator-form__actions">
                        <button type="button" id="${prefix}-reset" class="calculator-form__button calculator-form__button--secondary">Reset</button>
                        <button type="button" id="${prefix}-copy" class="calculator-form__button calculator-form__button--secondary" disabled>Copy summary</button>
                    </div>
                </form>
            </section>

            <section id="${prefix}-results" class="calculator-results">${resultEmpty(config.emptyMessage)}</section>
            <p id="${prefix}-live" class="sc-sr-only" role="status" aria-live="polite"></p>

            <section class="calculator-info">
                <h2>How to Use the ${escapeHTML(tool().title)}</h2>
                ${listHTML(config.howTo, "ol")}
            </section>

            <section class="calculator-info">
                <h2>Reading the Result</h2>
                ${(config.reading ?? []).map((t) => `<p>${t}</p>`).join("")}
            </section>
            ${exampleHTML()}
            <section class="calculator-info">
                <h2>Assumptions and Limits</h2>
                ${listHTML(config.assumptions)}
            </section>
            ${faq ? `<section class="calculator-info"><h2>Frequently Asked Questions</h2>${faq}</section>` : ""}

        </div>`;

    }

    function render(mount = document.querySelector("#app")) {

        if (!mount) {
            return;
        }

        mount.innerHTML = markup();
        init();

    }

    function init() {

        const form = document.querySelector(`#${prefix}-form`);
        const results = document.querySelector(`#${prefix}-results`);
        const live = document.querySelector(`#${prefix}-live`);
        const resetButton = document.querySelector(`#${prefix}-reset`);
        const copyButton = document.querySelector(`#${prefix}-copy`);

        if (!form || !results) {
            return;
        }

        const inputs = Object.fromEntries(Object.entries(ids).map(([key, id]) => [key, document.getElementById(id)]));
        const all = Object.values(inputs);
        let lastSummary = "";
        let announceTimer = null;
        let lastSpoken = "";

        const announce = (text) => {

            clearTimeout(announceTimer);

            announceTimer = setTimeout(() => {
                if (live && text !== lastSpoken) {
                    live.textContent = text;
                    lastSpoken = text;
                }
            }, 600);

        };

        function update() {

            clearFieldsInvalid(all, errorId);

            const solved = config.solve(
                Object.fromEntries(Object.entries(inputs).map(([key, el]) => [key, el.value])),
                { today: todayIso() }
            );

            lastSummary = "";
            copyButton.disabled = true;

            if (solved.state === "incomplete") {
                results.innerHTML = resultEmpty(config.emptyMessage);
                announce("");
                return;
            }

            if (solved.state === "invalid") {
                const entries = Object.entries(solved.errors);
                results.innerHTML = resultError(entries.map(([, m]) => m).join(" "), { id: errorId });
                setFieldsInvalid(entries.map(([key]) => inputs[key]).filter(Boolean), errorId);
                announce(entries[0][1]);
                return;
            }

            results.innerHTML = `
        <div class="calculator-results__grid">${solved.metrics.map((m) => resultMetric(m)).join("")}
        </div>
        ${(solved.notes ?? []).map((n) => `<p class="sc-note">${escapeHTML(n)}</p>`).join("")}
        <p class="sc-note">${escapeHTML(config.footnote)}</p>`;

            lastSummary = `${tool().title}\n${solved.summary}\n${config.footnote} ToolZen Hub`;
            copyButton.disabled = false;
            announce(solved.metrics.slice(0, 2).map((m) => `${m.label}: ${m.value}.`).join(" "));

        }

        for (const el of all) {
            el.addEventListener("input", update);
            el.addEventListener("change", update);
        }

        /* the "Use today" helper of the Time Tools works on any date field here */

        for (const button of form.querySelectorAll("[data-today]")) {
            button.addEventListener("click", () => {
                const input = document.getElementById(button.dataset.today);
                if (input) {
                    input.value = todayIso();
                    input.dispatchEvent(new Event("input", { bubbles: true }));
                    input.focus();
                }
            });
        }

        resetButton?.addEventListener("click", () => {

            const start = defaultValues();

            for (const [key, el] of Object.entries(inputs)) {
                el.value = start[key];
            }

            clearTimeout(announceTimer);
            lastSpoken = "";

            if (live) {
                live.textContent = "Cleared.";
            }

            update();
            all[0]?.focus();

        });

        copyButton?.addEventListener("click", async () => {

            if (!lastSummary) {
                return;
            }

            try {
                await navigator.clipboard.writeText(lastSummary);
                if (live) {
                    live.textContent = "Summary copied.";
                }
            } catch {
                if (live) {
                    live.textContent = "Copy is not available in this browser.";
                }
            }

        });

        update();

    }

    return { markup, render, init };

}
