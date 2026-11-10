/* =========================================================
   ToolZen Hub
   AI Tools: the shared brief page

   A brief tool is "a guided form in, a pasteable brief out". The
   tool supplies a CONFIG (its wording, its fields, a pure
   compose() and an example); this file draws the page every brief
   tool shares (intro, form, the brief with its clarity check and
   actions, how to use it, what it contains, FAQ) and wires it, the
   way calculators/common/simple-calculator.js does for the simple
   calculators.

   The brief is composed in the browser as the visitor types and
   is theirs to edit before copying. Nothing is sent to any AI
   service and nothing is stored.
========================================================= */

import { getToolById } from "../../../data/tools.js";
import { fieldShell, hintIdOf } from "../../../ui/field.js";
import { escapeHTML } from "../../../ui/escape.js";
import { buildBrief } from "./brief-engine.js";


const ASSISTANTS = "ChatGPT, Claude, Gemini, Copilot or any other assistant";


function controlHTML(id, f) {

    const describedBy = f.hint ? ` aria-describedby="${escapeHTML(hintIdOf(id))}"` : "";
    const placeholder = f.placeholder ? ` placeholder="${escapeHTML(f.placeholder)}"` : "";

    if (f.kind === "select") {
        return `<select id="${escapeHTML(id)}" class="calculator-form__input"${describedBy}>${
            f.options.map((o, i) => `<option value="${escapeHTML(o.value)}"${i === 0 ? " selected" : ""}>${escapeHTML(o.label)}</option>`).join("")
        }</select>`;
    }

    if (f.kind === "text") {
        return `<input id="${escapeHTML(id)}" class="calculator-form__input" type="text" autocomplete="off" spellcheck="true" maxlength="${f.maxlength ?? 200}"${placeholder}${describedBy}>`;
    }

    return `<textarea id="${escapeHTML(id)}" class="calculator-form__input ai-textarea" rows="${f.rows ?? 3}" maxlength="${f.maxlength ?? 4000}"${placeholder}${describedBy}></textarea>`;

}


function listHTML(items, tag = "ul") {

    return items?.length ? `<${tag}>${items.map((t) => `<li>${t}</li>`).join("")}</${tag}>` : "";

}


export function createBriefTool(config) {

    const prefix = config.prefix;
    const tool = () => getToolById(config.toolId);
    const idOf = (key) => `${prefix}-${key}`;
    const outputId = `${prefix}-output`;

    function checkHTML(brief) {

        if (brief.state === "empty") {
            return `<p class="ai-check__line">Fill in the form. The ${escapeHTML(config.outputName)} appears here as you type.</p>`;
        }

        const { missing, warnings, total, score } = brief.check;
        const head = missing.length
            ? `<p class="ai-check__line"><strong>Not ready yet.</strong> ${missing.length} essential${missing.length === 1 ? "" : "s"} missing: ${missing.map((m) => escapeHTML(m.label)).join(", ")}.</p>`
            : `<p class="ai-check__line"><strong>Ready to paste.</strong> All ${total === 1 ? "the essential is" : "essentials are"} in, ${brief.words} words.</p>`;
        const tips = warnings.length
            ? `<ul class="ai-check__tips">${warnings.map((w) => `<li><strong>${escapeHTML(w.label)}:</strong> ${escapeHTML(w.text)}</li>`).join("")}</ul>`
            : "";

        return `${head}${tips}<p class="ai-check__score">Completeness ${score} of 100. A check of the brief itself, not of the answer an assistant will give.</p>`;

    }

    function markup() {

        const fields = config.fields.map((f) => fieldShell({
            id: idOf(f.key),
            label: f.required ? `${f.label} (essential)` : f.label,
            hint: f.hint,
            control: controlHTML(idOf(f.key), f)
        })).join("");

        const faq = (config.faq ?? []).map((q) => `
                    <details class="calculator-faq__item"><summary>${escapeHTML(q.q)}</summary><p>${q.a}</p></details>`).join("");

        return `
        <div class="calculator-page">

            <section class="calculator-intro">
                <div>
                    <span class="calculator-eyebrow">AI Tool</span>
                    <h1>${escapeHTML(tool().title)}</h1>
                    <p>${config.intro}</p>
                </div>
                <div class="calculator-trust-card">
                    <div class="calculator-trust-icon">✓</div>
                    <div>
                        <strong>Built in your browser</strong>
                        <span>No AI service is called • Nothing is stored</span>
                    </div>
                </div>
            </section>

            <section class="calculator-section">
                <div class="calculator-section__title">${escapeHTML(config.sectionTitle)}</div>
                <p class="calculator-section__description">${config.sectionText}</p>
                <form id="${prefix}-form" class="calculator-form ai-form" novalidate>
                    <div class="calculator-form__grid">${fields}
                    </div>
                    <div class="calculator-form__actions">
                        <button type="button" id="${prefix}-load-example" class="calculator-form__button calculator-form__button--secondary">Load example</button>
                        <button type="button" id="${prefix}-reset" class="calculator-form__button calculator-form__button--secondary">Reset</button>
                    </div>
                </form>
            </section>

            <section id="${prefix}-results" class="calculator-results">
                <div class="calculator-results__card">
                    <div id="${prefix}-check" class="ai-check" data-state="empty">${checkHTML({ state: "empty" })}</div>
                    <label class="calculator-form__label" for="${outputId}">Your ${escapeHTML(config.outputName)}</label>
                    <textarea id="${outputId}" class="ai-output" rows="18" spellcheck="false" aria-describedby="${prefix}-output-note"></textarea>
                    <p id="${prefix}-output-note" class="ai-note">Edit it here before you copy. Changing a field above writes it again.</p>
                    <div class="calculator-form__actions ai-actions">
                        <button type="button" id="${prefix}-copy" class="calculator-form__button" disabled>Copy ${escapeHTML(config.outputName)}</button>
                        <button type="button" id="${prefix}-download" class="calculator-form__button calculator-form__button--secondary" disabled>Download .md</button>
                    </div>
                    <p class="ai-usewith">Paste it as the first message of a new chat with ${ASSISTANTS}, then add anything it says you will provide.</p>
                </div>
            </section>
            <p id="${prefix}-live" class="ai-sr-only" role="status" aria-live="polite"></p>

            <section class="calculator-info">
                <h2>How to use it</h2>
                ${listHTML(config.howTo, "ol")}
            </section>

            <section class="calculator-info">
                <h2>What the ${escapeHTML(config.outputName)} contains, and why</h2>
                ${config.parts.map((p) => `<h3>${escapeHTML(p.title)}</h3><p>${p.text}</p>`).join("")}
            </section>

            <section class="calculator-info">
                <h2>Using it with an AI assistant</h2>
                ${listHTML(config.useWith)}
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
        const output = document.querySelector(`#${outputId}`);
        const check = document.querySelector(`#${prefix}-check`);
        const live = document.querySelector(`#${prefix}-live`);
        const copyButton = document.querySelector(`#${prefix}-copy`);
        const downloadButton = document.querySelector(`#${prefix}-download`);
        const exampleButton = document.querySelector(`#${prefix}-load-example`);
        const resetButton = document.querySelector(`#${prefix}-reset`);

        if (!form || !output || !check) {
            return;
        }

        const inputs = Object.fromEntries(config.fields.map((f) => [f.key, document.getElementById(idOf(f.key))]));
        let announceTimer = null;
        let lastSpoken = "";

        const announce = (text, delay = 600) => {

            clearTimeout(announceTimer);

            announceTimer = setTimeout(() => {
                if (live && text !== lastSpoken) {
                    live.textContent = text;
                    lastSpoken = text;
                }
            }, delay);

        };

        const values = () => Object.fromEntries(Object.entries(inputs).map(([key, el]) => [key, el.value]));

        function update() {

            const brief = buildBrief(config, values());

            check.innerHTML = checkHTML(brief);
            check.dataset.state = brief.state;
            output.value = brief.markdown;
            copyButton.disabled = !brief.markdown;
            downloadButton.disabled = !brief.markdown;

            announce(brief.state === "empty"
                ? ""
                : brief.state === "ok"
                    ? `${config.outputName} ready, ${brief.words} words.`
                    : `${brief.check.missing.length} essential${brief.check.missing.length === 1 ? "" : "s"} missing: ${brief.check.missing.map((m) => m.label).join(", ")}.`);

        }

        for (const el of Object.values(inputs)) {
            el.addEventListener("input", update);
            el.addEventListener("change", update);
        }

        /* the page is live from here: typing before this point changed nothing (tests wait for it) */
        form.dataset.ready = "true";

        exampleButton?.addEventListener("click", () => {

            for (const [key, el] of Object.entries(inputs)) {
                el.value = config.example.values[key] ?? (el.tagName === "SELECT" ? el.options[0].value : "");
            }

            update();
            announce("Example loaded.", 0);

        });

        resetButton?.addEventListener("click", () => {

            for (const el of Object.values(inputs)) {
                el.value = el.tagName === "SELECT" ? el.options[0].value : "";
            }

            update();
            announce("Cleared.", 0);
            inputs[config.fields[0].key]?.focus();

        });

        copyButton?.addEventListener("click", async () => {

            if (!output.value) {
                return;
            }

            try {
                await navigator.clipboard.writeText(output.value);
                announce(`${config.outputName} copied.`, 0);
            } catch {
                output.focus();
                output.select();
                announce("Copying was refused by the browser. The text is selected: press Ctrl+C or Cmd+C.", 0);
            }

        });

        downloadButton?.addEventListener("click", () => {

            if (!output.value) {
                return;
            }

            const blob = new Blob([output.value], { type: "text/markdown;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = `${config.fileName}.md`;
            document.body.append(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            announce(`Downloaded ${config.fileName}.md.`, 0);

        });

    }

    return {
        markup,
        render,
        init,
        build: (raw) => buildBrief(config, raw)
    };

}
