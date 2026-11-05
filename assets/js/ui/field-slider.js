/* =========================================================
   ToolZen Hub
   Shared UI: slider beside a number field

   A range input that mirrors a number input. The number input
   is always the source of truth: it keeps its own validation,
   its own errors and its own typed value, and every tool keeps
   reading it. The slider only helps a visitor try values
   quickly, which is why it is offered for bounded fields such
   as an interest rate or a number of years, and not for
   amounts.

   OPT-IN (markup, ui/field.js numberField({ slider: {...} })):
       data-slider-min / data-slider-max / data-slider-step
   on the number input. The slider range is a practical range
   and is clamped to the field's own min and max, so it never
   offers a value the field would refuse.

   BEHAVIOUR
       slider moves  -> the number input takes the value and
                        fires its own `input` event, so the
                        tool recalculates exactly as if the
                        value had been typed
       number typed  -> the slider follows (a value outside the
                        slider range pins the thumb to its end
                        and leaves the number untouched)
       number disabled / hidden -> the slider follows
       form reset, a Reset or preset button, a mode switch
                     -> the slider follows (a tool that sets the number
                        in code fires no event, so the sliders are
                        re-read after any click or change in the tool)

   ACCESSIBILITY
       a native range input that a pointer or finger can drag. It
       is out of the tab order and aria-hidden: the number input
       beside it is the accessible control (label, keyboard,
       errors), so nothing is announced twice and tab order is
       unchanged. Arrow keys still work if it is focused by a click.

   Needs the DOM. Call enhanceSliders(root) once after a tool
   has rendered (entries/tool.js does).
========================================================= */

const MARK = "data-slider-ready";

function finite(value) {

    const text = String(value ?? "").trim();

    if (text === "") return null;

    const number = Number(text);

    return Number.isFinite(number) ? number : null;

}

function clamp(value, min, max) {

    return Math.min(max, Math.max(min, value));

}

/* the slider range: the practical range asked for, inside the field's own limits */
export function sliderRange(input) {

    const fieldMin = finite(input.getAttribute("min"));
    const fieldMax = finite(input.getAttribute("max"));
    let min = finite(input.dataset.sliderMin);
    let max = finite(input.dataset.sliderMax);
    const step = finite(input.dataset.sliderStep) ?? 1;

    if (min === null || max === null) return null;

    if (fieldMin !== null) min = Math.max(min, fieldMin);
    if (fieldMax !== null) max = Math.min(max, fieldMax);

    if (!(max > min) || !(step > 0)) return null;

    return { min, max, step };

}

function decimalsOf(step) {

    const text = String(step);
    const dot = text.indexOf(".");

    return dot === -1 ? 0 : text.length - dot - 1;

}

const SINGULAR = { years: "year", Years: "Year", months: "month", Months: "Month", days: "day", Days: "Day" };

/** A slider end as a person would say it: "₹1 Lakh", "1%", "30 Years". `unit` is the field's own unit text. Pure. */
export function formatEndpoint(value, unit = "", step = 1) {

    const unitText = String(unit ?? "").trim();
    const decimals = Math.min(decimalsOf(step), 2);
    const plain = (n, locale = "en-IN") => n.toLocaleString(locale, { maximumFractionDigits: decimals });
    const trimmed = (n) => String(Math.round(n * 100) / 100);

    if (unitText.startsWith("₹")) {

        const rest = unitText.slice(1).trim();
        const tail = rest === "" ? "" : ` ${rest}`;
        let body;

        if (value >= 1e7) body = `${trimmed(value / 1e7)} Crore`;
        else if (value >= 1e5) body = `${trimmed(value / 1e5)} Lakh`;
        else body = plain(value);

        return `₹${body}${tail}`;

    }

    if (unitText.startsWith("%")) return `${plain(value)}${unitText}`;

    if (unitText === "") return plain(value);

    const word = value === 1 && SINGULAR[unitText] ? SINGULAR[unitText] : unitText;

    return `${plain(value)} ${word}`;

}

const followers = [];

function enhanceOne(input) {

    if (input.hasAttribute(MARK)) return null;

    const range = sliderRange(input);

    if (!range) return null;

    const doc = input.ownerDocument;
    const decimals = decimalsOf(range.step);
    const slider = doc.createElement("input");

    slider.type = "range";
    slider.className = "calculator-form__slider";
    slider.min = String(range.min);
    slider.max = String(range.max);
    slider.step = String(range.step);
    /* a pointer and touch aid: the number input is the accessible control (label, keyboard, errors), so the
       slider is out of the tab order and hidden from assistive technology rather than announced twice */
    slider.tabIndex = -1;
    slider.setAttribute("aria-hidden", "true");
    slider.setAttribute("data-slider-for", input.id);

    const progress = () => {

        const fraction = (Number(slider.value) - range.min) / (range.max - range.min);

        slider.style.setProperty("--slider-progress", `${Math.round(clamp(fraction, 0, 1) * 1000) / 10}%`);

    };

    /* number -> slider */
    const follow = () => {

        const number = finite(input.value);

        slider.value = String(clamp(number ?? range.min, range.min, range.max));
        slider.disabled = input.disabled;
        progress();

    };

    /* slider -> number */
    const lead = () => {

        const number = Number(slider.value);
        const text = number.toFixed(decimals);

        input.value = decimals === 0 ? String(Math.round(number)) : text.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
        input.dispatchEvent(new Event("input", { bubbles: true }));
        progress();

    };

    slider.addEventListener("input", lead);
    input.addEventListener("input", follow);
    input.addEventListener("change", follow);
    slider.addEventListener("focus", follow);
    slider.addEventListener("pointerdown", follow);
    followers.push(follow);

    const form = input.form || input.closest("form");

    if (form) form.addEventListener("reset", () => setTimeout(follow, 0));

    /* a tool that disables the field (a solver leaves one blank) disables the slider with it */
    new MutationObserver(follow).observe(input, { attributes: true, attributeFilter: ["disabled", "min", "max"] });

    const group = input.closest(".calculator-form__group") || input.parentElement;
    const field = input.closest(".calculator-form__field");

    (field && field.parentElement === group ? field : input).insertAdjacentElement("afterend", slider);

    /* both ends of the range, so the visitor knows how far the slider goes; the number input already says the current value */
    const unit = (group && group.querySelector(".calculator-form__unit")?.textContent) || "";
    const ends = doc.createElement("div");

    ends.className = "calculator-form__slider-ends";
    ends.setAttribute("aria-hidden", "true");
    ends.setAttribute("data-slider-ends-for", input.id);

    for (const value of [range.min, range.max]) {

        const end = doc.createElement("span");

        end.textContent = formatEndpoint(value, unit, range.step);
        ends.append(end);

    }

    slider.insertAdjacentElement("afterend", ends);

    input.setAttribute(MARK, "true");
    follow();

    return slider;

}

export function enhanceSliders(root = document) {

    const made = [];
    const resync = () => setTimeout(() => followers.forEach((follow) => follow()), 0);

    for (const input of root.querySelectorAll("input[data-slider-max][data-slider-min]")) {

        const slider = enhanceOne(input);

        if (slider) made.push(slider);

    }

    if (made.length && !root.hasAttribute("data-slider-sync")) {

        root.setAttribute("data-slider-sync", "true");
        root.addEventListener("click", resync);
        root.addEventListener("change", resync);

    }

    return made;

}
