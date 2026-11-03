/* =========================================================
   ToolZen Hub
   Risk-Reward and Position Size Calculator

   For a person planning a trade who wants the distance to the
   stop and the target, the ratio, the win rate the ratio needs to
   break even and, with an account size and a risk percentage, how
   many units keep the loss at stop near that share of the account.

   THIS IS ARITHMETIC ON THE VISITOR'S OWN NUMBERS. It is not a
   signal or advice, it never calls a ratio good or bad, and it
   includes no fee, slippage, tax or leverage.

   The maths is in formulas/risk-reward.js (pure, exact fractions,
   tested against an independent oracle). This file reads the
   fields, asks that module to solve, and shows the answer. The
   results update as you type, so there is no Calculate button.
   Everything is calculated in the browser; nothing is sent or stored.
========================================================= */

import {
    solveRiskReward,
    groupedText,
    DEFAULT_INPUTS
} from "../formulas/risk-reward.js";

import {
    getCalculatorById
} from "../../data/calculators.js";

import {
    fieldShell,
    setFieldsInvalid,
    clearFieldsInvalid
} from "../../ui/field.js";

import {
    resultMetric,
    resultEmpty,
    resultError
} from "../../ui/result.js";

import {
    escapeHTML
} from "../../ui/escape.js";

const TITLE =
    getCalculatorById("risk-reward").title;

const IDS = {
    entry: "rr-entry",
    stop: "rr-stop",
    target: "rr-target",
    account: "rr-account",
    riskPercent: "rr-risk-percent"
};

const SIDE_NAME = "rr-side";
const ERROR_ID = "rr-results-error";
const EMPTY_MESSAGE =
    "Enter the entry, stop-loss and target prices to see the risk, the reward and the ratio.";

const LABELS = {
    entry: "Entry price",
    stop: "Stop-loss price",
    target: "Target price",
    account: "Account size",
    riskPercent: "Risk per trade"
};

const num = (t) => groupedText(t);

/* ---------- markup ---------- */

function textField({ id, label, unit, hint, inputmode = "decimal" }) {

    return fieldShell({
        id,
        label,
        unit,
        hint,
        control: `<input
                                    id="${escapeHTML(id)}"
                                    class="calculator-form__input"
                                    type="text"
                                    inputmode="${inputmode}"
                                    autocomplete="off"
                                    autocapitalize="off"
                                    spellcheck="false"
                                    aria-describedby="${escapeHTML(id)}-hint"
                                >`
    });

}

export function markup() {

    return `
        <div class="calculator-page">

            <section class="calculator-intro">

                <div>

                    <span class="calculator-eyebrow">
                        Investment Tool
                    </span>

                    <h1>
                        ${escapeHTML(TITLE)}
                    </h1>

                    <p>
                        Enter an entry, a stop-loss and a target to see the
                        risk, the reward, the ratio and the win rate needed
                        to break even. Add an account size and a risk
                        percentage to size the position.
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
                            Calculated in your browser • Nothing is stored
                        </span>

                    </div>

                </div>

            </section>


            <section class="calculator-section">

                <div class="calculator-section__title">
                    Plan the Trade
                </div>

                <p class="calculator-section__description">
                    Use prices in the same unit. Results update as you type.
                </p>

                <form
                    id="rr-form"
                    class="calculator-form"
                    novalidate
                >

                    <fieldset class="rr-side">

                        <legend class="calculator-form__label">
                            Direction
                        </legend>

                        <label class="rr-side__option">
                            <input type="radio" name="${SIDE_NAME}" value="long" checked>
                            <span>Long (buy first)</span>
                        </label>

                        <label class="rr-side__option">
                            <input type="radio" name="${SIDE_NAME}" value="short">
                            <span>Short (sell first)</span>
                        </label>

                    </fieldset>

                    <div class="calculator-form__grid">

                        ${textField({
                            id: IDS.entry,
                            label: LABELS.entry,
                            hint: "The price you plan to enter at."
                        })}

                        ${textField({
                            id: IDS.stop,
                            label: LABELS.stop,
                            hint: "The price at which you would exit to limit the loss."
                        })}

                        ${textField({
                            id: IDS.target,
                            label: LABELS.target,
                            hint: "The price at which you would take the profit."
                        })}

                    </div>

                    <h3 class="rr-more__title" aria-level="2">
                        Size the Position (optional)
                    </h3>

                    <p class="rr-more__text">
                        Fill in both to see how many units keep the loss at
                        the stop near your chosen share of the account.
                    </p>

                    <div class="calculator-form__grid">

                        ${textField({
                            id: IDS.account,
                            label: LABELS.account,
                            hint: "The money you trade with, in the same currency as the prices."
                        })}

                        ${textField({
                            id: IDS.riskPercent,
                            label: LABELS.riskPercent,
                            unit: "%",
                            hint: "The share of the account you accept losing if the stop is hit."
                        })}

                    </div>

                    <div class="calculator-form__actions">

                        <button
                            type="button"
                            id="rr-reset"
                            class="calculator-form__button calculator-form__button--secondary"
                        >
                            Reset
                        </button>

                        <button
                            type="button"
                            id="rr-copy"
                            class="calculator-form__button calculator-form__button--secondary"
                            disabled
                        >
                            Copy summary
                        </button>

                    </div>

                </form>

            </section>


            <section
                id="rr-results"
                class="calculator-results"
            >
                ${resultEmpty(EMPTY_MESSAGE)}
            </section>

            <p
                id="rr-live"
                class="rr-sr-only"
                role="status"
                aria-live="polite"
            ></p>


            <section class="calculator-info">

                <h2>
                    How to Use the ${escapeHTML(TITLE)}
                </h2>

                <ol>
                    <li>Choose Long if you buy first, or Short if you sell first.</li>
                    <li>Enter the entry, stop-loss and target prices. A long trade needs the stop below the entry and the target above it; a short trade needs the reverse.</li>
                    <li>Read the risk and reward per unit, the ratio and the break-even win rate.</li>
                    <li>To size the position, also enter your account size and the percentage of it you accept losing on this trade.</li>
                </ol>

            </section>


            <section class="calculator-info">

                <h2>
                    Reading the Result
                </h2>

                <p>
                    <strong>The ratio</strong> is the reward per unit divided
                    by the risk per unit. A ratio of 3 means the target is
                    three times as far from the entry as the stop.
                </p>

                <p>
                    <strong>The break-even win rate</strong> is the share of
                    trades that must reach the target, with the rest hitting
                    the stop, for the gains and losses to cancel, ignoring
                    costs. It equals risk divided by risk plus reward.
                </p>

                <p>
                    <strong>The quantity</strong> is the account size times
                    the risk percentage, divided by the risk per unit, rounded
                    down to a whole number so the loss at the stop does not
                    exceed the amount you chose.
                </p>

            </section>


            <section class="calculator-info">

                <h2>
                    Assumptions and What Is Not Included
                </h2>

                <ul>
                    <li>The result is arithmetic on the numbers you enter. It is not a signal, a forecast or advice, and no ratio is good or bad in itself.</li>
                    <li>Not included: brokerage and other fees, taxes, slippage, leverage and margin. These change the real loss and gain.</li>
                    <li>A stop is not guaranteed to fill at its price. A gap or a fast market can fill it further away, so the real loss can be larger than shown.</li>
                    <li>The position value is shown as a fact; it is not limited to your account size.</li>
                    <li>Nothing is looked up. No live prices are used, and nothing you enter leaves this page.</li>
                </ul>

            </section>

        </div>
    `;

}

export function render(
    mount = document.querySelector("#app")
) {

    if (!mount) {
        return;
    }

    mount.innerHTML = markup();

    init();

}

/* ---------- the scale drawing (text carries the meaning) ---------- */

function scaleSvg(side, input) {

    const e = Number(String(input.entry).replace(/,/g, ""));
    const s = Number(String(input.stop).replace(/,/g, ""));
    const t = Number(String(input.target).replace(/,/g, ""));
    const lo = Math.min(e, s, t);
    const hi = Math.max(e, s, t);
    const span = hi - lo || 1;
    const x = (v) => 30 + ((v - lo) / span) * 300;
    const marks = [
        { v: s, name: "Stop-loss", cls: "rr-scale__stop" },
        { v: e, name: "Entry", cls: "rr-scale__entry" },
        { v: t, name: "Target", cls: "rr-scale__target" }
    ];

    return `<svg class="rr-scale" viewBox="0 0 360 74" role="img" aria-label="${escapeHTML(`${side === "long" ? "Long" : "Short"} trade on a price scale: stop-loss ${input.stop}, entry ${input.entry}, target ${input.target}.`)}">
        <line x1="30" y1="34" x2="330" y2="34" class="rr-scale__line"/>
        ${marks.map((m, i) => `<line x1="${x(m.v)}" y1="22" x2="${x(m.v)}" y2="46" class="${m.cls}"/>
        <text x="${x(m.v)}" y="${i === 1 ? 16 : 62}" text-anchor="middle" class="rr-scale__text">${escapeHTML(m.name)}</text>`).join("")}
    </svg>`;

}

/* ---------- results ---------- */

function summaryText(r) {

    const lines = [
        `${r.side === "long" ? "Long" : "Short"} trade`,
        `Risk per unit: ${num(r.riskPerUnit)}`,
        `Reward per unit: ${num(r.rewardPerUnit)}`,
        `Risk-reward ratio: 1 : ${r.ratio}`,
        `Break-even win rate: ${r.breakEvenWinRate}% (ignoring costs)`
    ];

    if (r.sizing) {
        lines.push(
            `Amount at risk: ${num(r.sizing.riskAmount)}`,
            `Quantity: ${num(r.sizing.quantity)}`,
            `Position value: ${num(r.sizing.positionValue)}`,
            `Loss at stop: ${num(r.sizing.lossAtStop)}`,
            `Gain at target: ${num(r.sizing.gainAtTarget)}`
        );
    }

    lines.push("Arithmetic on the entered numbers; fees, slippage and leverage not included. ToolZen Hub");

    return lines.join("\n");

}

function resultsHTML(r, input) {

    const sizing = r.sizing;

    const sizingBlock = !sizing ? "" : `
        <h3 class="rr-results__heading">Position size</h3>
        <div class="calculator-results__grid">
            ${resultMetric({ label: "Quantity (whole units)", value: num(sizing.quantity), primary: true })}
            ${resultMetric({ label: "Amount you accept losing", value: num(sizing.riskAmount) })}
            ${resultMetric({ label: "Loss if the stop is hit", value: num(sizing.lossAtStop) })}
            ${resultMetric({ label: "Gain if the target is hit", value: num(sizing.gainAtTarget) })}
            ${resultMetric({ label: "Position value", value: `${num(sizing.positionValue)} (${num(sizing.positionPercentOfAccount)}% of the account)` })}
        </div>
        ${sizing.belowOneUnit ? `<p class="rr-note">The amount you accept losing is smaller than the risk on one unit, so the quantity is 0. Raise the risk percentage or the account size, or move the stop closer to the entry.</p>` : ""}
        ${sizing.exceedsAccount ? `<p class="rr-note">The position value is larger than the account size. This calculator assumes no leverage and does not limit the quantity.</p>` : ""}`;

    return `
        <div class="calculator-results__grid">
            ${resultMetric({ label: "Risk-reward ratio", value: `1 : ${r.ratio}`, primary: true })}
            ${resultMetric({ label: "Break-even win rate (ignoring costs)", value: `${r.breakEvenWinRate}%` })}
            ${resultMetric({ label: "Risk per unit", value: `${num(r.riskPerUnit)} (${r.riskPercentOfEntry}% of entry)` })}
            ${resultMetric({ label: "Reward per unit", value: `${num(r.rewardPerUnit)} (${r.rewardPercentOfEntry}% of entry)` })}
        </div>
        ${scaleSvg(r.side, input)}
        ${sizingBlock}
        <p class="rr-note">Arithmetic on your numbers, not advice. Fees, slippage and leverage are not included, and a stop can fill away from its price.</p>`;

}

/* ---------- behaviour ---------- */

export function init() {

    const form = document.querySelector("#rr-form");
    const results = document.querySelector("#rr-results");
    const live = document.querySelector("#rr-live");
    const resetButton = document.querySelector("#rr-reset");
    const copyButton = document.querySelector("#rr-copy");

    if (!form || !results) {
        return;
    }

    const inputs = Object.fromEntries(
        Object.entries(IDS).map(([name, id]) => [name, document.getElementById(id)])
    );
    const allInputs = Object.values(inputs);
    const sideInputs = [...form.querySelectorAll(`input[name="${SIDE_NAME}"]`)];

    let announceTimer = null;
    let lastSummary = "";
    let lastSpoken = "";

    function announce(text) {

        clearTimeout(announceTimer);

        if (!live) {
            return;
        }

        announceTimer = setTimeout(() => {
            if (text !== lastSpoken) {
                live.textContent = text;
                lastSpoken = text;
            }
        }, 600);

    }

    function side() {

        return sideInputs.find((r) => r.checked)?.value ?? "long";

    }

    function update() {

        clearFieldsInvalid(allInputs, ERROR_ID);

        const raw = {
            ...DEFAULT_INPUTS,
            side: side(),
            ...Object.fromEntries(
                Object.entries(inputs).map(([name, el]) => [name, el.value])
            )
        };

        const solved = solveRiskReward(raw);

        lastSummary = "";
        copyButton.disabled = true;

        if (solved.state === "incomplete") {

            results.innerHTML = resultEmpty(EMPTY_MESSAGE);
            announce("");
            return;

        }

        if (solved.state === "invalid") {

            const entries = Object.entries(solved.errors);
            results.innerHTML = resultError(
                entries.map(([, m]) => m).join(" "),
                { id: ERROR_ID }
            );
            setFieldsInvalid(
                entries.map(([name]) => inputs[name]).filter(Boolean),
                ERROR_ID
            );
            announce(entries[0][1]);
            return;

        }

        const r = solved.result;
        results.innerHTML = resultsHTML(r, raw);
        lastSummary = summaryText(r);
        copyButton.disabled = false;
        announce(
            `Ratio 1 to ${r.ratio}. Risk ${num(r.riskPerUnit)}, reward ${num(r.rewardPerUnit)} per unit.`
            + (r.sizing ? ` Quantity ${num(r.sizing.quantity)}.` : "")
        );

    }

    for (const el of allInputs) {
        el.addEventListener("input", update);
    }

    for (const el of sideInputs) {
        el.addEventListener("change", update);
    }

    resetButton?.addEventListener("click", () => {

        for (const el of allInputs) {
            el.value = "";
        }

        sideInputs.forEach((r) => { r.checked = r.value === "long"; });
        clearTimeout(announceTimer);
        lastSpoken = "";
        if (live) {
            live.textContent = "Cleared.";
        }
        update();
        inputs.entry.focus();

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
