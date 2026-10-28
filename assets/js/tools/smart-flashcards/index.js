/* =========================================================
   ToolZen Hub
   Smart Flashcards (Developer Tools)

   Short decks of original cards on JSON, HTTP and APIs, and software
   testing. Two kinds of card: a recall card (think, reveal, then say
   whether you knew it) and a single-answer choice card (the answer is
   checked for you). Every card has an explanation.

   This file is the page. The rules live in learning/: the session
   (session.js), the revision schedule (scheduler.js), the optional
   saved progress (progress-store.js) and the content check
   (content-schema.js). The decks are plain data in decks/ and load
   only when chosen.

   Behaviour that matters:
   - Nothing is saved unless the visitor turns saving on. With it off,
     nothing is written to any browser storage.
   - Everything from a deck or a file is put on the page as text,
     never as HTML.
   - No timer, no points, no streaks and no animation.
   - No network request is made by this tool beyond loading its own
     deck files.
========================================================= */

import { el, clear, codeBlock, announce, plural } from "../../learning/dom.js";
import { validateDeck } from "../../learning/content-schema.js";
import {
    startPass, current, resultOf, gradeCurrent, canAdvance, advance, back,
    missedCards, summarize, seededRandom
} from "../../learning/session.js";
import {
    localDay, grade as gradeEntry, dueCards, nextDueAfter, dayToIso, INTERVAL_DAYS
} from "../../learning/scheduler.js";
import {
    createStore, emptyState, readText, readImport, mergeStates, exportText, exportFileName, countCards, MAX_BYTES, KEY
} from "../../learning/progress-store.js";
import { getToolById } from "../../data/tools.js";

export const showRelatedCalculators = true;
export const showRelatedArticles = false;

const TITLE = "Smart Flashcards";

export const DECKS = [
    { id: "json", title: "JSON", cardCount: 30, load: () => import("./decks/json.js") }
];

const DIFFICULTY_LABEL = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };


/* =========================================================
   MARKUP (static, written into the generated page)
========================================================= */

export function markup() {

    return `
        <div class="calculator-page">

            <section class="calculator-intro">

                <div>

                    <span class="calculator-eyebrow">
                        Developer Tool
                    </span>

                    <h1>
                        ${TITLE}
                    </h1>

                    <p>
                        Revise JSON, HTTP and APIs, and software testing with
                        short original cards. Think of the answer first, then
                        check it. Every card explains why. Nothing is saved
                        unless you choose to save it on this device.
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
                            No account, no upload
                        </span>

                    </div>

                </div>

            </section>

            <section class="calculator-section">

                <div id="lx-app" class="lx-app" data-tool="smart-flashcards">
                    <p class="lx-note">
                        The flashcards need JavaScript, which runs in your
                        browser. If this message stays, JavaScript is off or
                        the page did not finish loading.
                    </p>
                </div>

                <p id="lx-live" class="lx-sr-only" role="status" aria-live="polite"></p>

            </section>

            <section class="calculator-info">

                <h2>How to Use Smart Flashcards</h2>

                <ol>
                    <li>Choose a deck, then choose the topics you want and start a session.</li>
                    <li>On a recall card, think of the answer first, then press Show answer and say whether you knew it. On a choice card, pick one option and press Check answer.</li>
                    <li>Read the explanation. It says why the answer is right, not only what it is.</li>
                    <li>At the end, review the cards you missed or study the deck again.</li>
                </ol>

            </section>

            <section class="calculator-info">

                <h2>The Decks</h2>

                <p>
                    <strong>JSON</strong> covers what strict JSON allows and
                    rejects, strings and numbers, how JSON differs from a
                    JavaScript object, and what a valid response still does
                    not prove. Each deck is written for this site and cites the
                    standard or documentation behind its answers. The cards are
                    revision aids, not a course and not a certification.
                </p>

            </section>

            <section class="calculator-info">

                <h2>Optional Progress Saving and Revision Dates</h2>

                <p>
                    Saving is off until you turn it on. When it is on, this
                    tool keeps, in this browser only, which cards you have
                    graded, the box each is in and the day you last graded it.
                    It never keeps your answers. Nothing is sent anywhere, and
                    you can export, import or delete it at any time.
                </p>

                <p>
                    Revision dates use five boxes. A card you know moves up one
                    box and a card you do not know goes back to box 1. The
                    boxes wait ${INTERVAL_DAYS.join(", ")} days. These
                    intervals are a simple design choice for this tool. They
                    are not a scientifically proven best schedule and they do
                    not promise that you will remember a card.
                </p>

                <p>
                    A recall card is graded by you, so it shows what you think
                    you know, not proof that you know it. A choice card is
                    graded by the tool.
                </p>

            </section>

        </div>
    `;

}


/* =========================================================
   INIT
========================================================= */

export function render(mount = document.querySelector("#app")) {

    if (!mount) return;
    mount.innerHTML = markup();
    init();

}

export function init() {

    const root = document.querySelector("#lx-app");
    const live = document.querySelector("#lx-live");

    if (!root) return;

    const store = createStore(() => window.localStorage);
    const decksLoaded = new Map();
    let known = null;

    const ui = {
        view: "decks",
        deckMeta: null,
        deck: null,
        topics: new Set(),
        shuffle: false,
        pass: null,
        passKind: "all",
        message: "",
        saving: false,
        progress: emptyState(),
        notices: [],
        focus: null,
        revealed: false,
        choice: null
    };

    async function getDeck(meta) {

        if (decksLoaded.has(meta.id)) return decksLoaded.get(meta.id);

        const module = await meta.load();
        const toolIds = { has: (id) => Boolean(getToolById(id)) };
        const problems = validateDeck(module.deck, { toolIds });

        if (problems.length > 0) {
            console.error(`Deck ${meta.id} is invalid:`, problems);
            throw new Error("invalid deck");
        }

        decksLoaded.set(meta.id, module.deck);
        return module.deck;

    }

    /* progress validation needs every deck's card ids, so all decks load once saving is used */
    async function ensureKnown() {

        if (known) return known;

        const out = {};
        for (const meta of DECKS) {
            const deck = await getDeck(meta);
            out[deck.id] = { version: deck.version, cardIds: new Set(deck.cards.map((c) => c.id)) };
        }
        known = out;
        return known;

    }

    async function loadSaved() {

        if (!store.isOn()) return;

        try {
            const knownDecks = await ensureKnown();
            const result = readText(store.read(), knownDecks);
            ui.progress = result.state;
            ui.notices = result.notices;
            ui.saving = true;
            if (result.notices.length > 0 || result.rejected) persist();
        } catch {
            ui.saving = false;
        }

    }

    function persist() {

        const result = store.write(ui.progress);

        if (!result.ok) {
            ui.notices = [result.reason === "too-large"
                ? "Your progress is larger than the limit, so it could not be saved."
                : "This browser would not save the progress. It is kept for this visit only."];
            ui.saving = false;
            return false;
        }

        return true;

    }

    const say = (message) => announce(live, message);

    /* ---------- actions ---------- */

    async function chooseDeck(meta) {

        try {
            ui.deck = await getDeck(meta);
        } catch {
            ui.message = "This deck could not be loaded. Reload the page to try again.";
            ui.view = "decks";
            draw();
            return;
        }

        ui.deckMeta = meta;
        ui.topics = new Set(ui.deck.topics.map((t) => t.id));
        ui.shuffle = false;
        ui.message = "";
        ui.view = "setup";
        ui.focus = "heading";
        draw();

    }

    function cardsForSelection() {
        return ui.deck.cards.filter((c) => ui.topics.has(c.topic));
    }

    function startSession(cards, kind) {

        const random = ui.shuffle && kind === "all" ? seededRandom(Date.now() % 4294967296) : undefined;
        ui.pass = startPass(cards, { random });
        ui.passKind = kind;
        ui.view = ui.pass.finished ? "setup" : "study";
        ui.message = ui.pass.finished ? "There are no cards to study with this choice." : "";
        ui.focus = "heading";
        draw();

    }

    function record(known_, evidence, choice) {

        const card = current(ui.pass);
        if (!card || resultOf(ui.pass, card.id)) return;

        ui.pass = gradeCurrent(ui.pass, known_, evidence, choice);

        if (ui.saving) {
            const deckProgress = ui.progress.decks[ui.deck.id] ?? { version: ui.deck.version, cards: {} };
            deckProgress.version = ui.deck.version;
            deckProgress.cards[card.id] = gradeEntry(deckProgress.cards[card.id], known_, localDay());
            ui.progress = { ...ui.progress, decks: { ...ui.progress.decks, [ui.deck.id]: deckProgress } };
            persist();
        }

    }

    function dueIds() {

        const entries = ui.progress.decks[ui.deck.id]?.cards ?? {};
        return dueCards(ui.deck.cards.map((c) => c.id), entries, localDay());

    }

    /* ---------- drawing ---------- */

    function draw() {

        clear(root);

        if (ui.view === "decks") drawDecks();
        else if (ui.view === "setup") drawSetup();
        else if (ui.view === "study") drawStudy();
        else drawSummary();

        root.append(drawProgressPanel());

        if (ui.focus === "heading") {
            root.querySelector("[data-focus='heading']")?.focus();
        } else if (ui.focus) {
            root.querySelector(`[data-focus='${ui.focus}']`)?.focus();
        }

        ui.focus = null;

    }

    function heading(text) {
        return el("h2", { class: "lx-title", tabindex: "-1", "data-focus": "heading", text });
    }

    function drawDecks() {

        root.append(
            heading("Choose a deck"),
            ui.message ? el("p", { class: "lx-note", role: "alert", text: ui.message }) : null,
            el("ul", { class: "lx-decks" }, DECKS.map((meta) => el("li", { class: "lx-deck" },
                el("h3", { text: meta.title }),
                el("p", { class: "lx-meta", text: plural(meta.cardCount, "card") }),
                el("button", { type: "button", class: "calculator-form__button lx-btn", onclick: () => chooseDeck(meta) },
                    `Choose ${meta.title}`)
            )))
        );

    }

    function drawSetup() {

        const cards = cardsForSelection();
        const due = ui.saving ? dueIds() : [];
        const entries = ui.progress.decks[ui.deck.id]?.cards ?? {};
        const nextDay = ui.saving ? nextDueAfter(ui.deck.cards.map((c) => c.id), entries, localDay()) : null;

        const topicBoxes = ui.deck.topics.map((t) => {
            const n = ui.deck.cards.filter((c) => c.topic === t.id).length;
            const id = `lx-topic-${t.id}`;
            return el("div", { class: "lx-check" },
                el("input", {
                    type: "checkbox", id, checked: ui.topics.has(t.id) || undefined,
                    onchange: (e) => {
                        if (!e.target.checked && ui.topics.size === 1) {
                            e.target.checked = true;
                            ui.message = "Keep at least one topic selected.";
                            say(ui.message);
                            draw();
                            return;
                        }
                        e.target.checked ? ui.topics.add(t.id) : ui.topics.delete(t.id);
                        ui.message = "";
                        draw();
                    }
                }),
                el("label", { for: id, text: `${t.title} (${n})` })
            );
        });

        root.append(
            heading(`${ui.deck.title} deck`),
            el("p", { text: ui.deck.description }),
            ui.message ? el("p", { class: "lx-note", role: "alert", text: ui.message }) : null,
            el("fieldset", { class: "lx-fieldset" },
                el("legend", { text: "Topics" }),
                topicBoxes
            ),
            el("div", { class: "lx-check" },
                el("input", { type: "checkbox", id: "lx-shuffle", checked: ui.shuffle || undefined, onchange: (e) => { ui.shuffle = e.target.checked; } }),
                el("label", { for: "lx-shuffle", text: "Shuffle the cards" })
            ),
            ui.saving
                ? el("p", { class: "lx-note", text: due.length > 0
                    ? `${plural(due.length, "card")} due for revision in this deck.`
                    : nextDay === null
                        ? "No cards are due yet. Cards you grade will come back for revision."
                        : `No cards are due today. The next card is due on ${dayToIso(nextDay)}.` })
                : null,
            el("div", { class: "lx-actions" },
                el("button", { type: "button", class: "calculator-form__button lx-btn", onclick: () => startSession(cards, "all") },
                    `Start session (${plural(cards.length, "card")})`),
                due.length > 0
                    ? el("button", { type: "button", class: "calculator-form__button calculator-form__button--secondary lx-btn", onclick: () => startSession(due.map((id) => ui.deck.cards.find((c) => c.id === id)), "due") },
                        `Review ${plural(due.length, "due card")}`)
                    : null,
                el("button", { type: "button", class: "calculator-form__button calculator-form__button--secondary lx-btn", onclick: () => { ui.view = "decks"; ui.message = ""; ui.focus = "heading"; draw(); } },
                    "Back to decks")
            )
        );

    }

    function drawStudy() {

        const pass = ui.pass;
        const card = current(pass);
        const result = resultOf(pass, card.id);
        const total = pass.cards.length;
        const topic = ui.deck.topics.find((t) => t.id === card.topic)?.title ?? "";
        const s = summarize(pass);
        const tool = card.tool ? getToolById(card.tool) : null;

        const article = el("article", {
            class: "lx-card", "aria-labelledby": "lx-card-title",
            onkeydown: (e) => {
                if (e.target.matches("input, textarea, select")) return;
                if (e.key === "ArrowRight" && canAdvance(ui.pass)) { e.preventDefault(); goNext(); }
                else if (e.key === "ArrowLeft" && ui.pass.index > 0) { e.preventDefault(); goBack(); }
            }
        });

        article.append(
            el("p", { class: "lx-meta" },
                `Card ${pass.index + 1} of ${total} · ${topic} · ${DIFFICULTY_LABEL[card.difficulty]}`),
            el("h2", { id: "lx-card-title", class: "lx-prompt", tabindex: "-1", "data-focus": "heading", text: card.prompt })
        );

        if (card.code) article.append(codeBlock(card.code));

        if (card.kind === "recall") drawRecall(article, card, result);
        else drawChoice(article, card, result);

        if (result) {
            article.append(
                el("div", { class: "lx-explanation" },
                    el("h3", { text: "Why" }),
                    el("p", { text: card.explanation }),
                    el("p", { class: "lx-meta", text: `Source: ${card.source}` }),
                    tool ? el("p", {}, "Try it in the ", el("a", { href: tool.href, text: tool.title }), ".") : null
                )
            );
        }

        const next = el("button", {
            type: "button", class: "calculator-form__button lx-btn", "data-focus": result ? "next" : undefined,
            disabled: canAdvance(pass) ? undefined : true, onclick: goNext
        }, pass.index === total - 1 ? "See summary" : "Next card");

        article.append(
            el("div", { class: "lx-actions" },
                el("button", {
                    type: "button", class: "calculator-form__button calculator-form__button--secondary lx-btn",
                    disabled: pass.index === 0 ? true : undefined, onclick: goBack
                }, "Previous card"),
                next
            ),
            !canAdvance(pass) ? el("p", { class: "lx-meta", text: "Next unlocks after you answer." }) : null
        );

        root.append(
            el("p", { class: "lx-progress", text: `${plural(s.seen, "card")} done, ${s.remaining} left. To review: ${s.notKnown}.` }),
            article
        );

    }

    function drawRecall(article, card, result) {

        if (!ui.revealed && !result) {
            article.append(el("div", { class: "lx-actions" },
                el("button", {
                    type: "button", class: "calculator-form__button lx-btn", "data-focus": "reveal-btn",
                    onclick: () => { ui.revealed = true; ui.focus = "knew"; say("Answer shown."); draw(); }
                }, "Show answer")));
            ui.focus = ui.focus ?? "reveal-btn";
            return;
        }

        article.append(
            el("div", { class: "lx-answer" }, el("h3", { text: "Answer" }), el("p", { text: card.answer }))
        );

        if (result) {
            article.append(el("p", { class: "lx-result", text: result.known ? "You marked this: known." : "You marked this: not known. It is in your review list." }));
            return;
        }

        article.append(
            el("div", { class: "lx-actions", role: "group", "aria-label": "Did you know this?" },
                el("button", { type: "button", class: "calculator-form__button lx-btn", "data-focus": "knew", onclick: () => grade(true) }, "I knew it"),
                el("button", { type: "button", class: "calculator-form__button calculator-form__button--secondary lx-btn", onclick: () => grade(false) }, "I did not know it")
            )
        );

        function grade(isKnown) {
            record(isKnown, "self");
            ui.revealed = false;
            say(isKnown ? "Marked known." : "Marked not known.");
            ui.focus = "next";
            draw();
        }

    }

    function drawChoice(article, card, result) {

        const name = "lx-choice";
        const chosen = result ? result.choice : ui.choice ?? null;
        let check = null;

        const options = card.options.map((text, i) => {
            const id = `lx-opt-${i}`;
            const marker = result
                ? (i === card.correct ? " (correct answer)" : i === result.choice ? " (your choice)" : "")
                : "";
            return el("div", { class: "lx-option" },
                el("input", {
                    type: "radio", id, name, value: i, checked: chosen === i || undefined, disabled: result ? true : undefined,
                    onchange: () => { ui.choice = i; if (check) check.disabled = false; }
                }),
                el("label", { for: id, text: text + marker })
            );
        });

        article.append(el("fieldset", { class: "lx-fieldset" }, el("legend", { text: "Choose one answer" }), options));

        if (result) {
            article.append(el("p", { class: "lx-result", role: "status", text: result.known ? "Correct." : `Not correct. The correct answer is: ${card.options[card.correct]}` }));
            return;
        }

        check = el("button", {
            type: "button", class: "calculator-form__button lx-btn",
            disabled: chosen === null ? true : undefined,
            onclick: () => {
                const index = ui.choice;
                if (index === null || index === undefined || check.disabled) return;
                check.disabled = true;
                record(index === card.correct, "answer", index);
                ui.choice = null;
                say(index === card.correct ? "Correct." : "Not correct.");
                ui.focus = "next";
                draw();
            }
        }, "Check answer");

        article.append(el("div", { class: "lx-actions" }, check));

    }

    function goNext() {

        if (!canAdvance(ui.pass)) return;
        ui.pass = advance(ui.pass);
        ui.revealed = false;
        ui.choice = null;

        if (ui.pass.finished) ui.view = "summary";
        ui.focus = "heading";
        draw();

    }

    function goBack() {

        ui.pass = back(ui.pass);
        ui.revealed = false;
        ui.choice = null;
        ui.focus = "heading";
        draw();

    }

    function drawSummary() {

        const s = summarize(ui.pass);
        const missed = missedCards(ui.pass);

        const topics = ui.deck.topics
            .filter((t) => s.byTopic[t.id])
            .map((t) => el("li", { text: `${t.title}: ${s.byTopic[t.id].known} known, ${s.byTopic[t.id].notKnown} not known` }));

        root.append(
            heading("Session complete"),
            el("p", { class: "lx-result", text: `You went through ${plural(s.seen, "card")}: ${s.known} known, ${s.notKnown} not known.` }),
            el("p", { class: "lx-meta", text: "Recall cards count as known when you said so; choice cards count as known when the answer was correct." }),
            topics.length ? el("ul", { class: "lx-list" }, topics) : null,
            ui.saving ? el("p", { class: "lx-note", text: "Your progress for these cards is saved on this device." }) : null,
            el("div", { class: "lx-actions" },
                el("button", {
                    type: "button", class: "calculator-form__button lx-btn", disabled: missed.length === 0 ? true : undefined,
                    onclick: () => startSession(missed, "missed")
                }, missed.length === 0 ? "No cards to review" : `Review ${plural(missed.length, "missed card")}`),
                el("button", {
                    type: "button", class: "calculator-form__button calculator-form__button--secondary lx-btn",
                    onclick: () => startSession(ui.passKind === "all" ? cardsForSelection() : ui.pass.cards, ui.passKind)
                }, "Study again"),
                el("button", {
                    type: "button", class: "calculator-form__button calculator-form__button--secondary lx-btn",
                    onclick: () => { ui.view = "decks"; ui.focus = "heading"; draw(); }
                }, "Choose another deck")
            )
        );

        say("Session complete.");

    }

    /* ---------- optional progress ---------- */

    function drawProgressPanel() {

        const available = store.available();
        const hasProgress = countCards(ui.progress) > 0;

        const panel = el("section", { class: "lx-progress-panel", "aria-labelledby": "lx-save-title" },
            el("h2", { id: "lx-save-title", text: "Your progress on this device" }),
            el("p", { class: "lx-meta", text: `If you turn this on, this browser keeps your revision boxes (up to ${MAX_BYTES / 1024} KB) under the key ${KEY}. It never keeps your answers and sends nothing anywhere. It is off by default.` }),
            el("div", { class: "lx-check" },
                el("input", {
                    type: "checkbox", id: "lx-save", checked: ui.saving || undefined, disabled: available ? undefined : true,
                    "aria-describedby": "lx-save-state", onchange: (e) => (e.target.checked ? enableSaving() : disableSaving())
                }),
                el("label", { for: "lx-save", text: "Save my progress on this device" })
            ),
            el("p", { id: "lx-save-state", class: "lx-meta", text: !available
                ? "This browser is not allowing storage, so progress cannot be saved. The flashcards still work for this visit."
                : ui.saving
                    ? `Saving is on. ${plural(countCards(ui.progress), "card")} saved.`
                    : "Saving is off. Nothing is stored." }),
            ...ui.notices.map((n) => el("p", { class: "lx-note", role: "status", text: n })),
            el("div", { class: "lx-actions" },
                el("button", { type: "button", class: "calculator-form__button calculator-form__button--secondary lx-btn", disabled: ui.saving && hasProgress ? undefined : true, onclick: doExport }, "Export progress"),
                el("button", { type: "button", class: "calculator-form__button calculator-form__button--secondary lx-btn", disabled: ui.saving ? undefined : true, onclick: () => panel.querySelector("#lx-import")?.click() }, "Import progress"),
                el("button", { type: "button", class: "calculator-form__button calculator-form__button--secondary lx-btn", disabled: ui.saving && hasProgress ? undefined : true, onclick: confirmReset }, "Reset progress")
            ),
            el("input", { type: "file", id: "lx-import", class: "lx-sr-only", accept: ".json,application/json", tabindex: "-1", "aria-label": "Choose a progress file (JSON)", onchange: doImport }),
            ui.saving ? null : el("p", { class: "lx-meta", text: "Export, import and reset work when saving is on." })
        );

        return panel;

    }

    async function enableSaving() {

        try {
            await ensureKnown();
        } catch {
            ui.notices = ["The decks could not be checked, so saving was not turned on."];
            draw();
            return;
        }

        ui.progress = emptyState();
        ui.notices = [];

        if (store.write(ui.progress).ok) {
            ui.saving = true;
            say("Saving is on.");
        } else {
            ui.saving = false;
            ui.notices = ["This browser would not save progress, so saving stays off."];
        }

        draw();

    }

    function disableSaving() {

        if (countCards(ui.progress) === 0) {
            store.clear();
            ui.saving = false;
            ui.notices = [];
            say("Saving is off.");
            draw();
            return;
        }

        confirm({
            title: "Turn saving off?",
            body: "Your saved progress will be deleted from this device. Export it first if you want to keep it.",
            action: "Turn off and delete",
            onYes: () => {
                store.clear();
                ui.progress = emptyState();
                ui.saving = false;
                ui.notices = [];
                say("Saving is off and saved progress was deleted.");
            },
            onNo: () => { ui.saving = true; }
        });

    }

    function confirmReset() {

        confirm({
            title: "Reset your progress?",
            body: "This deletes the saved box and review day of every card on this device. Saving stays on.",
            action: "Reset progress",
            onYes: () => {
                ui.progress = emptyState();
                persist();
                ui.notices = [];
                say("Progress was reset.");
            }
        });

    }

    function confirm({ title, body, action, onYes, onNo }) {

        const opener = document.activeElement;
        const dialog = el("div", { class: "lx-dialog", role: "dialog", "aria-modal": "true", "aria-labelledby": "lx-dialog-title" },
            el("h2", { id: "lx-dialog-title", text: title }),
            el("p", { text: body }),
            el("div", { class: "lx-actions" },
                el("button", { type: "button", class: "calculator-form__button lx-btn", onclick: () => finish(true) }, action),
                el("button", { type: "button", class: "calculator-form__button calculator-form__button--secondary lx-btn", onclick: () => finish(false) }, "Cancel")
            )
        );
        const backdrop = el("div", { class: "lx-backdrop" }, dialog);
        document.body.append(backdrop);

        import("../../ui/dialog-focus.js").then(({ activateDialog }) => {
            const trap = activateDialog({ dialog, onEscape: () => finish(false), restoreTo: opener });
            backdrop._trap = trap;
            if (backdrop._done) trap.release();
        });

        function finish(yes) {
            if (backdrop._done) return;
            backdrop._done = true;
            backdrop._trap?.release();
            backdrop.remove();
            (yes ? onYes : onNo)?.();
            draw();
            if (opener && document.contains(opener)) opener.focus();
        }

    }

    function doExport() {

        const blob = new Blob([exportText(ui.progress)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = el("a", { href: url, download: exportFileName(dayToIso(localDay())) });
        document.body.append(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        say("Progress file downloaded.");

    }

    async function doImport(event) {

        const input = event.target;
        const file = input.files?.[0];
        input.value = "";

        if (!file) return;

        if (file.size > MAX_BYTES) {
            ui.notices = [`That file is larger than ${MAX_BYTES / 1024} KB, which is more than this tool ever saves. Nothing was changed.`];
            draw();
            return;
        }

        try {
            const knownDecks = await ensureKnown();
            const result = readImport(await file.text(), knownDecks);

            if (result.error) {
                ui.notices = [`${result.error} Nothing was changed.`];
            } else {
                const merged = mergeStates(ui.progress, result.state);
                const previous = ui.progress;
                ui.progress = merged;
                if (persist()) {
                    ui.notices = [`Imported ${plural(result.keptCards, "card")}. For a card in both places, the later review day was kept.`, ...result.notices];
                    say("Progress imported.");
                } else {
                    ui.progress = previous;
                }
            }
        } catch {
            ui.notices = ["That file could not be read. Nothing was changed."];
        }

        draw();

    }

    loadSaved().then(draw);
    draw();
    root.dataset.ready = "true";

}
