# Shared tool UX

How the pieces every tool repeats are shared, and (just as important) what is deliberately **not**
shared. Read this before building a tool. The code is in `assets/js/ui/`.

## Principles

- **Small and framework-free.** Plain JavaScript functions. No dependency, no component framework.
- **Share only real duplication.** A pattern is shared when a tool already repeats it *and* a future
  tool of another kind would use it unchanged. Two things that merely look alike are not a reason.
- **The tool owns the domain.** Formulas, validation rules, message wording, which results exist and
  how they are laid out belong to the tool. The shared layer only wires presentation and accessibility.
- **Metadata is not UI.** A capability flag (`data/tool-capabilities.js`) *describes* what a tool
  does. It never renders anything. A tool decides when and how an action appears.
- **Pure where it can be.** Markup helpers return strings, so they work while the site is built
  (`markup()`) and in the browser (`init()`).

## What is shared (`assets/js/ui/`)

| Module | Use it for | Notes |
| --- | --- | --- |
| `field.js` `numberField()` | A labelled number input with an optional unit and hint | Label is tied to the input; the hint gets the id `{id}-hint` and is linked with `aria-describedby`. Currency, percentage and duration are just different `unit` text. |
| `field.js` `fieldShell()` | The same label/unit/hint wrapper around **any** control | Pass your own control markup (select, date, textarea). You add `aria-describedby="{id}-hint"` to it yourself (`hintIdOf(id)`). |
| `field.js` `setFieldsInvalid()` / `clearFieldsInvalid()` | Connect an error to the fields it is about | Sets `aria-invalid` and adds/removes the error's id in `aria-describedby`, keeping the hint. You render the error element (with an id) and decide the wording and placement. |
| `result.js` `resultMetric()` | One labelled value | The value is display text you format (money, %, a duration, a converted unit, a word). `primary` marks the headline figure. |
| `result.js` `resultEmpty()` / `resultError()` | The "nothing yet" state and an error | Give the error an `id` when fields should point at it. |
| `dialog-focus.js` `activateDialog()` | The focus mechanics of a modal | Focus moves in, Tab stays inside, Escape calls your `onEscape`, the page behind is inert, focus returns to the opener on `release()`. You own the markup and how it opens and closes. |
| `escape.js` `escapeHTML()` | Text from a visitor | Every primitive already escapes its text. |

Shared **formatting** already exists and should be reused, not copied: `assets/js/calculators/common/formatter.js`
(`formatINR`, `formatNumber`, `formatPercent`). Current INR behaviour is unchanged.

Shared **CSS** vocabulary already exists and is not specific to calculators: `calculator-form__*`
(`assets/css/calculators/calculator-form.css`) and `calculator-results__*` (`calculator-results.css`).
An invalid field (`aria-invalid="true"`) gets the danger border. Tool-specific CSS stays in its own
files (listed per tool in `src/_data/toolStyles.json`).

## What stays tool-specific

- Calculation and domain rules (`formulas/`, comparison and amortization logic, PDF building).
- Validation **rules** and their messages.
- The composition of a result: how many metrics, their order, summaries, winners, tables.
- Loan Comparison's two-column cards, sliders and select+unit rows, its comparison result and its
  amortization tables and modal **markup**.
- Per-tool explanation, FAQ and example sections (their markup differs between tools).
- Which actions a tool offers, and when (calculate, reset, copy, download, print).

## Pattern audit (EMI and Loan Comparison)

| Pattern | Decision |
| --- | --- |
| Labelled number input, with currency / % / duration unit | **Shared now** (`numberField`); EMI repeated it three times |
| Hint text linked to its input | **Shared now** (it was not linked before) |
| Error linked to its fields (`aria-invalid`, `aria-describedby`) | **Shared now** (`setFieldsInvalid`) |
| Result metric, empty state, error | **Shared now** (EMI repeated them) |
| Modal focus management | **Shared now** (`activateDialog`), taken from Loan Comparison |
| Select / unit control | Later: only Loan Comparison has one. Use `fieldShell` with your own control until a second tool needs a `selectField` |
| Results card scaffold (eyebrow, title, grid, summary) | Later: only EMI uses it. Compose it from `resultMetric` yourself |
| Responsive table wrapper | Later: two different wrappers today. The accessible pattern is `role="region"`, `tabindex="0"` and an `aria-label` on the scrolling container (see Loan Comparison's full schedule) |
| Action row (calculate + reset) | Keep duplicated: two buttons, and the markup differs between tools |
| Comparison result, winner, amortization | Tool-specific |
| Explanation / example / FAQ sections | Tool-specific content and markup |
| Field grouping (`calculator-form__grid`) | Already shared as CSS; no JavaScript needed |
| Copy / download actions | Tool-specific until two tools need the same one |

## Usage

```js
import { numberField, setFieldsInvalid, clearFieldsInvalid } from "../../ui/field.js";
import { resultMetric, resultEmpty, resultError } from "../../ui/result.js";

export function markup() {
    return `<form>${numberField({ id: "x-amount", label: "Amount", unit: "₹", hint: "Enter the amount.", min: 1, value: 100 })}</form>
            <section id="x-results" aria-live="polite">${resultEmpty("Enter a value.")}</section>`;
}

export function init() {
    const inputs = ["x-amount"].map(id => document.getElementById(id));
    // your own rules decide validity; the shared code only wires it
    if (!valid) {
        setFieldsInvalid(inputs, "x-error");
        results.innerHTML = resultError("Please enter a valid amount.", { id: "x-error" });
        return;
    }
    clearFieldsInvalid(inputs, "x-error");
    results.innerHTML = resultMetric({ label: "Result", value: formatINR(value), primary: true });
}
```

A modal: build your own markup, then `const focus = activateDialog({ dialog, onEscape: close })`
after it is in the page and `focus.release()` when you remove it.

## Layout zones (conceptual)

A tool page is made of: introduction, input area, actions, primary results, secondary results,
visualization or table, explanation, examples, related content. **No tool must use every zone, and an
empty zone is never rendered.** The shared tool page owns only the breadcrumb (first) and the related
sections (last); everything between is the tool's own markup.

## Accessibility requirements

Every shared primitive, and every tool built on them, keeps these:

- Each control has a real `<label for>`; hints and errors are linked with `aria-describedby`.
- An invalid control has `aria-invalid="true"`; the error is reachable by a screen reader (a live
  region or the described-by link).
- Keyboard focus is always visible (`assets/css/base/accessibility.css`) and never trapped except inside
  an open dialog, where Tab stays inside and Escape closes.
- Motion respects `prefers-reduced-motion`.
- A scrolling table sits in a focusable, labelled region.
- A dialog restores focus to the control that opened it.

## Fitting other kinds of tool

| Tool | What it would use |
| --- | --- |
| Loan-style calculator (e.g. Home Loan) | `numberField` for currency, % and duration; `resultMetric` for each figure; tool-owned table |
| Converter (temperature) | `numberField` plus `fieldShell` around its own unit `<select>`; `resultMetric` with the converted text; a copy action it owns |
| Date / time tool | `fieldShell` around `<input type="date">`; several `resultMetric` with text values |
| Developer utility (JSON formatter) | `fieldShell` around a `<textarea>`; `resultError` + `setFieldsInvalid` for parse errors; escaped output |
| Timer | a duration field; a `resultMetric` that updates; start/pause/reset buttons it owns |

The tests (`tests/unit/shared-ui.test.mjs`) exercise each of these shapes with synthetic markup;
no such tool exists.

## Over-abstraction to avoid

- A generic `renderTool(config)` that builds a whole tool from a JSON description. Tools differ too
  much; the result is a configuration language that is harder than the HTML it replaces.
- Deriving the interface from capabilities (`if (capabilities.chart) renderChart()`): there is no
  shared chart, and a flag must not decide what a tool shows.
- A validation rules engine. Validity is domain logic; share only how an error is presented.
- Moving amortization, comparison or PDF code into "generic" components.
- Extracting a helper used once (a table wrapper, a card scaffold) "for later".
- Renaming or restyling existing classes just to reduce the number of files.

Before adding a primitive ask: does it remove real duplication, is the API obvious, does a tool of
another kind benefit, is it independent of Loans, is it accessible by default, and can it be removed
without touching domain logic? If any answer is no, do not add it.
