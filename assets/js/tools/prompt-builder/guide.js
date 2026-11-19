/* =========================================================
   ToolZen Hub
   AI Prompt Builder: professions, tools and the context review (AI
   programme D18)

   Loaded only when the visitor opens "Start from your profession"
   or chooses a task, so the page's first load is unchanged. The
   profession list opens that profession's tasks; the tool step
   offers the tools that fit the chosen task (the profession's own
   tools first), with the visitor's experience of each tool asked
   separately, or "I don't use a specific tool", or "Recommend
   one", or another tool by name; the context review shows what
   the prompt is built from, with links back to each answer.
   Markup only from fixed data and escaped values; nothing stored.
========================================================= */

import { escapeHTML as e } from "../../ui/escape.js";
import { ROLE_GROUPS, ROLES, getRole } from "./roles.js";
import { toolsFor, handoffLines, toolPrompt, TOOL_BY_ID, TOOL_EXPERIENCE, ROLE_TOOLS } from "./tools.js";
import { getTask } from "./taxonomy.js";
import { DETAIL, DEFAULT_DETAIL, EXTRAS, ANSWER_FORMATS, TONES, loadMethod, methodPrompt, checkPrompt } from "./method.js";
import { approachesFor, EMPHASES, AUDIENCES, strategyId, nextStrategy } from "./strategies.js";

export { loadMethod, DEFAULT_DETAIL };

const label = (title) => title.replace(/^Testing: /, "").replace(/^./, (c) => c.toUpperCase());

/** The profession select, grouped. */
export function professionPicker(P) {

    return `
                            <div class="calculator-form__group">
                                <label class="calculator-form__label" for="${P}-profession">Your profession</label>
                                <select id="${P}-profession" class="calculator-form__input">
                                    <option value="">Choose…</option>${ROLE_GROUPS.map((g) => `
                                    <optgroup label="${e(g.title)}">${ROLES.filter((r) => r.group === g.id).map((r) => `<option value="${e(r.id)}">${e(r.title)}</option>`).join("")}</optgroup>`).join("")}
                                </select>
                            </div>
                            <div id="${P}-profession-tasks"></div>`;

}

export const roleTitle = (roleId) => getRole(roleId)?.title ?? "";

/** The tasks of a profession, as buttons that open the task (the page's own [data-use-task] handler). */
export function professionTasks(roleId) {

    const role = getRole(roleId);
    if (!role) return "";

    return `<p class="ai-note">Tasks of a ${e(role.title.toLowerCase())}. Choose one; you can still change anything after.</p>
                            <ul class="wb-matches">${role.tasks.map(getTask).filter(Boolean).map((t) => `
                                <li class="wb-match"><span><strong>${e(label(t.title))}</strong></span>
                                <button type="button" class="calculator-form__button calculator-form__button--secondary" data-use-task="${e(t.id)}" data-role="${e(role.id)}">Use this task</button></li>`).join("")}
                            </ul>`;

}

/** The tool step for a task, or "" when no tool applies. */
export function toolsHTML(P, taskId, roleId) {

    const tools = toolsFor(taskId, ROLE_TOOLS[roleId] ?? []);
    if (!tools.length) return "";

    const options = TOOL_EXPERIENCE.map((x) => `<option value="${e(x.id)}">${e(x.id ? x.label : "Your experience with it")}</option>`).join("");

    return `
                            <legend class="calculator-form__label">Tools you use for this task (optional)</legend>
                            <p class="ai-note">The prompt then works the way your tools do: their terms, steps and what to export. Your experience with a tool is asked separately from your experience in your job.</p>${tools.length > 8 ? `
                            <div class="calculator-form__group"><label class="calculator-form__label" for="${P}-tool-search">Find a tool</label><input id="${P}-tool-search" class="calculator-form__input" type="search" autocomplete="off"></div>` : ""}
                            <ul class="wb-tool-list" id="${P}-tool-list">${tools.map((x) => `
                                <li class="wb-tool" data-name="${e(x.name.toLowerCase())}">
                                    <label class="wb-tool__pick"><input type="checkbox" name="${P}-tool" value="${e(x.id)}"> <span><strong>${e(x.name)}</strong> <span class="ai-note">${e(x.kind)}</span></span></label>
                                    <label class="ai-sr-only" for="${P}-tool-exp-${e(x.id)}">Your experience with ${e(x.name)}</label>
                                    <select id="${P}-tool-exp-${e(x.id)}" class="calculator-form__input wb-tool__exp" data-tool-exp="${e(x.id)}" hidden>${options}</select>
                                </li>`).join("")}
                            </ul>
                            <div class="wb-tool-other">
                                <label class="wb-tool__pick"><input type="checkbox" name="${P}-toolchoice" value="none"> <span>I don't use a specific tool</span></label>
                                <label class="wb-tool__pick"><input type="checkbox" name="${P}-toolchoice" value="recommend"> <span>Recommend a suitable tool</span></label>
                            </div>
                            <div class="calculator-form__group"><label class="calculator-form__label" for="${P}-tool-other">Another tool (optional)</label><input id="${P}-tool-other" class="calculator-form__input" type="text" maxlength="100" autocomplete="off" placeholder="For example Katalon or Insomnia"></div>`;

}

/** Draws the tool step for a task ("" for none: image, video and audio prompts) and restores a file's tools. */
export function showTools(P, form, taskId, roleId, prefill) {

    const box = document.getElementById(`${P}-tools`);
    box.innerHTML = taskId ? toolsHTML(P, taskId, roleId) : "";
    box.hidden = !box.innerHTML;
    if (box.innerHTML && (prefill?.tools || prefill?.toolChoice || prefill?.otherTool)) applyTools(P, form, prefill);

}

/** Above the pack: the context review, and for a task with a method the prompt check. */
export function contextHTML(P, pack, tools, method, checkOpen) {

    const field = (id) => document.getElementById(`${P}-${id}`);
    const exp = field("experience");

    return reviewHTML(P, pack, { ...tools, hasTools: !field("tools").hidden, role: field("role").value, experience: exp.selectedIndex > 0 ? exp.selectedOptions[0].textContent : "" })
        + (method ? checkHTML(P, pack, { ...tools, method, answers: Object.fromEntries([...document.querySelectorAll(`#${P}-questions [data-key]:not(select)`)].map((x) => [x.dataset.key, x.value])) }, checkOpen) : "");

}

/** Keeps the choices consistent: a tool or "another tool" clears "none" and "recommend"; each of those clears the rest. */
export function onToolChange(P, form, target) {

    const tools = [...form.querySelectorAll(`input[name="${P}-tool"]`)];
    const choices = [...form.querySelectorAll(`input[name="${P}-toolchoice"]`)];

    if (target.name === `${P}-toolchoice` && target.checked) {
        for (const c of choices) if (c !== target) c.checked = false;
        for (const x of tools) x.checked = false;
        const other = form.querySelector(`#${P}-tool-other`);
        if (other) other.value = "";
    } else if (target.name === `${P}-tool` && target.checked) {
        for (const c of choices) c.checked = false;
    }

    for (const x of tools) {
        const exp = form.querySelector(`[data-tool-exp="${CSS.escape(x.value)}"]`);
        if (exp) exp.hidden = !x.checked;
    }

}

export function filterTools(P, form, text) {

    const q = text.trim().toLowerCase();
    for (const li of form.querySelectorAll(`#${P}-tool-list .wb-tool`)) li.hidden = Boolean(q) && !li.dataset.name.includes(q) && !li.querySelector("input").checked;

}

/** The compiler's tool input from the form. */
export function toolInput(P, form, taskId, detail = "", extras = []) {

    const ids = [...form.querySelectorAll(`input[name="${P}-tool"]:checked`)].map((x) => x.value).filter((id) => TOOL_BY_ID[id]);
    const otherTool = form.querySelector(`#${P}-tool-other`)?.value.trim() ?? "";
    const choice = form.querySelector(`input[name="${P}-toolchoice"]:checked`)?.value ?? "";

    const input = {
        tools: ids.map((id) => ({ tool: TOOL_BY_ID[id], experience: form.querySelector(`[data-tool-exp="${CSS.escape(id)}"]`)?.value ?? "" })),
        toolChoice: choice,
        otherTool,
        handoffs: handoffLines(ids),
        offered: toolsFor(taskId).map((x) => x.name),
        detail,
        extras
    };

    return { ...input, toolPrompt: toolPrompt(input, taskId) };

}

/** What a Work Pack file keeps about the tools: { tools: { id: experience }, toolChoice, otherTool }. */
export function toolState(P, form, taskId) {

    const input = toolInput(P, form, taskId);

    return { tools: Object.fromEntries(input.tools.map((u) => [u.tool.id, u.experience])), toolChoice: input.toolChoice, otherTool: input.otherTool };

}

/** Restores the tool step from a Work Pack file (only tools still offered for the task). */
export function applyTools(P, form, saved) {

    for (const [id, exp] of Object.entries(saved?.tools ?? {})) {
        const box = form.querySelector(`input[name="${P}-tool"][value="${CSS.escape(id)}"]`);
        if (!box) continue;
        box.checked = true;
        const select = form.querySelector(`[data-tool-exp="${CSS.escape(id)}"]`);
        if (select && TOOL_EXPERIENCE.some((x) => x.id === exp)) select.value = exp;
    }
    const choice = form.querySelector(`input[name="${P}-toolchoice"][value="${CSS.escape(saved?.toolChoice ?? "")}"]`);
    if (choice && !Object.keys(saved?.tools ?? {}).length) choice.checked = true;
    const other = form.querySelector(`#${P}-tool-other`);
    if (other && typeof saved?.otherTool === "string") other.value = saved.otherTool.slice(0, 100);
    onToolChange(P, form, {});

}

/* ---------- prompt detail and adjustments (D19); the controls stay in place while the pack below is rewritten ---------- */

/** The prompt controls above the pack: detail level with word counts, parts to add, presentation, reset. */
export function controlsHTML(P) {

    const select = (id, label, list) => `<div class="calculator-form__group"><label class="calculator-form__label" for="${P}-${id}">${e(label)}</label><select id="${P}-${id}" class="calculator-form__input">${list.map((x) => `<option value="${e(x.id)}">${e(x.label)}</option>`).join("")}</select></div>`;

    return `
                    <fieldset class="${P}-detail">
                        <legend class="calculator-form__label">Prompt detail</legend>${DETAIL.map((d) => `
                        <label class="wb-tool__pick ${P}-detail__option"><input type="radio" name="${P}-detail" value="${d.id}"${d.id === DEFAULT_DETAIL ? " checked" : ""}> <span><strong>${e(d.label)}</strong> <span class="ai-note" data-words="${d.id}"></span><br><span class="ai-note">${e(d.hint)}</span></span></label>`).join("")}
                    </fieldset>
                    <fieldset class="${P}-detail ${P}-version">
                        <legend class="calculator-form__label">Prompt version</legend>
                        <label class="wb-tool__pick ${P}-detail__option"><input type="radio" name="${P}-version" value="full" checked> <span><strong>Full</strong><br><span class="ai-note">Everything at the detail chosen above.</span></span></label>
                        <label class="wb-tool__pick ${P}-detail__option"><input type="radio" name="${P}-version" value="concise"> <span><strong>Concise</strong><br><span class="ai-note">The same objective, context, method outline, safeguards and checks, without the detail.</span></span></label>
                    </fieldset>
                    <div class="${P}-approach">
                        <button type="button" id="${P}-another" class="calculator-form__button calculator-form__button--secondary">Generate another approach</button>
                        <p class="ai-note" id="${P}-approach-why" aria-live="polite"></p>
                        <details class="${P}-edit">
                            <summary>Choose the professional approach yourself</summary>
                            <div class="calculator-form__grid">${select("approach", "Approach", [{ id: "", label: "Recommended for this task" }])}${select("emphasis", "Emphasis", [{ id: "", label: "None" }, ...EMPHASES])}${select("audience", "Written for", [{ id: "", label: "Anyone" }, ...AUDIENCES])}</div>
                        </details>
                    </div>
                    <details class="${P}-edit ${P}-refine">
                        <summary>Refine the prompt</summary>
                        <fieldset class="${P}-extras">
                            <legend class="calculator-form__label">Add to the prompt</legend>${EXTRAS.map((x) => `
                            <label class="wb-tool__pick"><input type="checkbox" name="${P}-extra" value="${x.id}"> <span>${e(x.label)}</span></label>`).join("")}
                        </fieldset>
                        <div class="calculator-form__grid">${select("answer-format", "Answer format", ANSWER_FORMATS)}${select("tone", "Tone of the answer", TONES)}</div>
                        <button type="button" id="${P}-refine-reset" class="calculator-form__button calculator-form__button--secondary">Back to the recommended prompt</button>
                    </details>
                    <p class="ai-note">These rewrite the prompt here from fixed professional rules; no AI is used and nothing is sent. Your answers on the left stay as they are.</p>`;

}

/**
 * Shows the controls for a task with a method (drawn once, then kept so a visitor's choice stays across tasks), wires
 * them the first time, and applies a reopened file's settings. rewrite() redraws the pack and returns its word count.
 * Returns the method.
 */
let currentTask = null;
/* the approaches already shown per task in this visit, so "another approach" does not repeat one (memory only) */
const shown = new Map();

export function setupControls(P, method, previous, prefill, rewrite, announce) {

    const box = document.getElementById(`${P}-prompt-controls`);
    const kept = previous && box.innerHTML ? promptState(P) : null;

    box.hidden = !method;
    if (method && !box.innerHTML) {
        box.innerHTML = controlsHTML(P);
        box.addEventListener("change", () => announce(`Prompt rewritten: ${rewrite()} words. No AI is used.`, 0));
        box.addEventListener("click", (event) => {
            if (event.target.id === `${P}-another`) {
                const s = readControls(P);
                const used = shown.get(currentTask.id) ?? new Set();
                const id = strategyId(s.approach || "-", s.emphasis || "-", s.audience || "-");
                used.add(id);
                let next = nextStrategy(currentTask, id, [...used]);
                if (!next) {
                    used.clear();
                    next = nextStrategy(currentTask, id, []);
                }
                shown.set(currentTask.id, used);
                applyControls(P, { ...promptState(P), approach: next.approach.id, emphasis: next.emphasis.id, audience: next.audience.id });
                rewrite();
                announce(`Another approach: ${[next.approach.label || "the recommended method", next.emphasis.label, next.audience.label].filter(Boolean).join(", ")}. Your task, answers and tools are unchanged.`, 0);
                return;
            }
            if (event.target.id !== `${P}-refine-reset`) return;
            applyControls(P, {});
            rewrite();
            announce("Back to the recommended prompt: Detailed, nothing added.", 0);
        });
    }
    if (method) {
        currentTask = method.task;
        /* the approaches of this task's profession; a kept or saved approach stays only if this task has it too */
        const approach = document.getElementById(`${P}-approach`);
        approach.innerHTML = [{ id: "", label: "Recommended for this task" }, ...approachesFor(method.task)].map((x) => `<option value="${e(x.id)}">${e(x.label)}</option>`).join("");
        applyControls(P, prefill?.prompt ?? kept ?? {});
        document.getElementById(`${P}-another`).hidden = !approachesFor(method.task).length;
    }

    return method;

}

/** "full" or "concise": which version leads in the pack. */
export function promptVersion(P) {

    return document.querySelector(`input[name="${P}-version"]:checked`)?.value === "concise" ? "concise" : "full";

}

/** The settings as a Work Pack file keeps them (strings only). */
export function promptState(P) {

    const s = readControls(P);
    return { ...s, extras: s.extras.join(",") };

}

/** Moves the detail one level (-1 or 1); returns the new level's label, or "" at either end. */
export function stepDetail(P, by) {

    const levels = [...document.querySelectorAll(`input[name="${P}-detail"]`)];
    const next = levels[levels.findIndex((r) => r.checked) + by];
    if (!next) return "";
    next.checked = true;
    return DETAIL.find((d) => d.id === next.value).label;

}

/** Writes each level's word count beside it; compileAt(level) compiles the same answers at that level. */
export function countWords(P, current, pack, compileAt) {

    for (const el of document.querySelectorAll(`#${P}-prompt-controls [data-words]`)) {
        el.textContent = `· ${el.dataset.words === current ? pack.promptWords : compileAt(el.dataset.words).promptWords} words`;
    }
    /* what the chosen approach changes, in one line */
    const why = document.getElementById(`${P}-approach-why`);
    const s = readControls(P);
    const a = currentTask && approachesFor(currentTask).find((x) => x.id === s.approach);
    if (why) why.textContent = a ? `${a.label}: ${a.why}` : "The recommended method for this task. Generate another approach to see a different professional way of doing it.";

}

/** Shorter and longer under the main prompt, and the edit box. Shorter and longer step the prompt detail for a task with a method, the depth otherwise. */
export function adjustHTML(P, pack) {

    const ends = pack.detail ? [pack.detail === "standard", pack.detail === "comprehensive"] : [pack.depth === "short", pack.depth === "multi"];
    const button = (by, text, off) => `<button type="button" class="calculator-form__button calculator-form__button--secondary" data-adjust="${by}"${off ? " disabled" : ""}>${text}</button>`;

    return `<div class="${P}-adjust">${button(-1, "Make it shorter", ends[0])}${button(1, "Make it more detailed", ends[1])}</div>
                    <p class="ai-note">${pack.detail ? "These change the prompt detail" : "These change the depth"} and rewrite the pack here; no AI is used.</p>
${otherVersion(P, pack)}${sectionsHTML(P, pack)}
                    <details class="${P}-edit">
                        <summary>Edit the prompt before copying</summary>
                        <label class="calculator-form__label" for="${P}-master-edit">Your edited prompt (changes here are not kept when an answer changes)</label>
                        <textarea id="${P}-master-edit" class="calculator-form__input ai-textarea" rows="10">${e(shownPrompt(P, pack))}</textarea>
                        <button type="button" id="${P}-copy-edit" class="calculator-form__button calculator-form__button--secondary">Copy the edited prompt</button>
                    </details>`;

}

const shownPrompt = (P, pack) => pack.concisePrompt && promptVersion(P) === "concise" ? pack.concisePrompt : pack.masterPrompt;
const count = (text) => (String(text).match(/\S+/g) ?? []).length;
const copyBlock = (id, title, text) => `
                        <div class="${"wb"}-prompt">
                            <div class="wb-prompt__head"><h4 class="wb-prompt__title" id="${id}-title">${e(title)}</h4><button type="button" class="calculator-form__button calculator-form__button--secondary wb-copy" data-copy="${id}" aria-describedby="${id}-title">Copy</button></div>
                            <pre class="wb-prompt__text" id="${id}" tabindex="0" aria-labelledby="${id}-title">${e(text)}</pre>
                        </div>`;

/* the version that does not lead, one press away (D21) */
function otherVersion(P, pack) {

    if (!pack.concisePrompt) return "";
    const concise = promptVersion(P) === "concise";
    const [title, text] = concise ? ["Full prompt", pack.masterPrompt] : ["Concise prompt", pack.concisePrompt];
    return `
                    <details class="${P}-edit" id="${P}-other-version">
                        <summary>Show the ${concise ? "full" : "concise"} prompt (${count(text)} words)</summary>${copyBlock(`${P}-alt`, title, text)}
                    </details>`;

}

/* each labelled section of the prompt, to copy one at a time */
function sectionsHTML(P, pack) {

    const sections = shownPrompt(P, pack).split("\n\n").filter((b) => /^[A-Z][^\n]{2,80}:\n/.test(b));
    if (sections.length < 2) return "";
    return `
                    <details class="${P}-edit" id="${P}-sections">
                        <summary>Copy one section (${sections.length})</summary>${sections.map((b, i) => copyBlock(`${P}-sec-${i}`, b.split(":\n")[0], b)).join("")}
                    </details>`;

}

/** The visitor's settings from the controls. */
export function readControls(P) {

    const $ = (id) => document.getElementById(`${P}-${id}`);

    return {
        detail: document.querySelector(`input[name="${P}-detail"]:checked`)?.value ?? DEFAULT_DETAIL,
        extras: [...document.querySelectorAll(`input[name="${P}-extra"]:checked`)].map((x) => x.value),
        format: $("answer-format")?.value ?? "",
        tone: $("tone")?.value ?? "",
        approach: $("approach")?.value ?? "",
        emphasis: $("emphasis")?.value ?? "",
        audience: $("audience")?.value ?? "",
        version: promptVersion(P)
    };

}

/** Sets the controls (a reopened file, a reset). */
export function applyControls(P, saved = {}) {

    const detail = DETAIL.some((d) => d.id === saved.detail) ? saved.detail : DEFAULT_DETAIL;
    for (const r of document.querySelectorAll(`input[name="${P}-detail"]`)) r.checked = r.value === detail;
    const extras = String(saved.extras ?? "").split(",");
    for (const c of document.querySelectorAll(`input[name="${P}-extra"]`)) c.checked = extras.includes(c.value);
    const set = (id, list, v) => { const el = document.getElementById(`${P}-${id}`); if (el) el.value = list.some((x) => x.id === v) ? v : ""; };
    set("answer-format", ANSWER_FORMATS, saved.format);
    set("tone", TONES, saved.tone);
    set("approach", currentTask ? approachesFor(currentTask) : [], saved.approach);
    set("emphasis", EMPHASES, saved.emphasis);
    set("audience", AUDIENCES, saved.audience);
    for (const r of document.querySelectorAll(`input[name="${P}-version"]`)) r.checked = r.value === (saved.version === "concise" ? "concise" : "full");

}

/** The method part of the compile input for these settings. */
export function methodFor(method, settings, blueprint, answers, context) {

    const parts = [settings.approach, settings.emphasis, settings.audience];
    return method ? methodPrompt(method, {
        ...settings,
        strategy: parts.some(Boolean) ? strategyId(...parts.map((x) => x || "-")) : "",
        answers,
        context,
        deliverable: blueprint.deliverable,
        blueprint,
        hasMaterial: Boolean(context?.trim()) || Object.values(answers).some((v) => String(v).length > 200)
    }) : null;

}

/** The prompt check: twenty fixed rules, listed with what to do about each one not met. */
export function checkHTML(P, pack, info, expanded = false) {

    const checks = checkPrompt(pack, info);
    const open = checks.filter((c) => !c.ok);

    return `
                <details class="${P}-part ${P}-check" id="${P}-prompt-check"${expanded ? " open" : ""}>
                    <summary><strong>Prompt check: ${checks.length - open.length} of ${checks.length} met</strong></summary>
                    <p class="ai-note">Checked here by fixed rules, not by an AI: ${checks.filter((c) => c.kind === "structure").length} points check what the prompt contains, ${checks.filter((c) => c.kind === "rule").length} apply a rule to it. A long prompt does not score higher; a point not met is a suggestion, not an error.</p>
                    <ul class="${P}-check__list">${checks.map((c) => `
                        <li>${c.ok ? "Met" : "Not met"}: ${e(c.label)}${c.note ? `. <span class="ai-note">${e(c.note)}</span>` : ""}</li>`).join("")}
                    </ul>
                </details>`;

}

/** The context review above the Work Pack: what the prompt is built from, with links back to change each part. */
export function reviewHTML(P, pack, info) {

    const tools = info.tools.map((u) => `${u.tool.name}${u.experience ? ` (${TOOL_EXPERIENCE.find((x) => x.id === u.experience)?.label.toLowerCase()})` : ""}`);
    if (info.otherTool) tools.push(info.otherTool);
    const toolLine = tools.length ? tools.join(", ") : info.toolChoice === "none" ? "No specific tool" : info.toolChoice === "recommend" ? "The AI will recommend one" : info.hasTools ? "None chosen" : "";
    const row = (k, v, href) => v ? `<div><dt>${e(k)}</dt><dd>${e(v)}${href ? ` <a href="#${P}-${href}" class="wb-review__edit">Change<span class="ai-sr-only"> ${e(k.toLowerCase())}</span></a>` : ""}</dd></div>` : "";

    return `
                <section class="${P}-part ${P}-review" aria-labelledby="${P}-h-review">
                    <h3 id="${P}-h-review">Your context</h3>
                    <dl class="${P}-stage__facts">
                        ${row("Profession", info.role, "role")}
                        ${row("Experience in your work", info.experience, "experience")}
                        ${row("Task", pack.overview.task, "outcomes")}
                        ${row("Tools", toolLine, "tools")}
                        ${row("Still missing", pack.missing.join(", "), "questions")}
                        ${row("Check first", pack.conflicts.join(" "), "questions")}
                    </dl>
                    <p class="ai-note">Change any answer on the left; the prompt is written again as you type.</p>
                </section>`;

}
