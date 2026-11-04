/* =========================================================
   Line numbers for a plain textarea (JSON Formatter, JSON Compare)

   attachLineNumbers(textarea) puts a numbered gutter inside the box. The box must not wrap (wrap="off"), so one
   number is one line of the document. The numbers are drawn, not typed: they are not part of the value, cannot be
   selected or copied, and are hidden from assistive technology (the box keeps its own label and the error messages
   name the line and column in words).

   It follows scrolling and resizing, and it notices the value being set by code (a formatted result) as well as typing.
   markLine(n) highlights one line's number (the line of an error); markLine(null) clears it. Nothing runs at import.
========================================================= */

const GUTTER_PAD = 10; /* px each side of the digits */

export function attachLineNumbers(textarea) {

    const doc = textarea.ownerDocument;

    if (textarea.dataset.lineNumbers) {
        return textarea.__lineGutter;
    }

    const wrap = doc.createElement("div");
    const gutter = doc.createElement("div");
    const inner = doc.createElement("div");
    const numbers = doc.createElement("pre");
    const mark = doc.createElement("div");

    wrap.className = "line-field";
    gutter.className = "line-field__gutter";
    inner.className = "line-field__inner";
    numbers.className = "line-field__numbers";
    mark.className = "line-field__mark";
    mark.hidden = true;

    gutter.setAttribute("aria-hidden", "true");

    inner.append(mark, numbers);
    gutter.append(inner);

    textarea.before(wrap);
    wrap.append(textarea, gutter);

    textarea.classList.add("has-line-numbers");
    textarea.dataset.lineNumbers = "true";

    let shownLines = 0;
    let markedLine = null;

    const lineCount = () => {

        const value = textarea.value;
        let count = 1;

        for (let at = value.indexOf("\n"); at !== -1; at = value.indexOf("\n", at + 1)) {
            count++;
        }

        return count;

    };

    const measure = () => {

        const style = doc.defaultView.getComputedStyle(textarea);

        wrap.style.setProperty("--lg-font", style.fontFamily);
        wrap.style.setProperty("--lg-size", style.fontSize);
        wrap.style.setProperty("--lg-line", style.lineHeight === "normal" ? `${parseFloat(style.fontSize) * 1.2}px` : style.lineHeight);
        wrap.style.setProperty("--lg-top", `${parseFloat(style.paddingTop) + parseFloat(style.borderTopWidth)}px`);

    };

    const placeMark = () => {

        mark.hidden = markedLine === null || markedLine > shownLines;

        if (!mark.hidden) {
            mark.style.top = `calc(var(--lg-top) - 1px + ${markedLine - 1} * var(--lg-line))`;
        }

    };

    const refresh = () => {

        const count = lineCount();

        if (count !== shownLines) {

            shownLines = count;

            numbers.textContent = Array.from({ length: count }, (_, i) => i + 1).join("\n");

            /* wide enough for the biggest number, so the text never moves as the count grows */
            const digits = String(count).length;

            wrap.style.setProperty("--lg-width", `calc(${digits}ch + ${GUTTER_PAD * 2}px)`);

        }

        placeMark();

        inner.style.transform = `translateY(${-textarea.scrollTop}px)`;

    };

    measure();
    refresh();

    textarea.addEventListener("input", refresh);
    textarea.addEventListener("scroll", () => {
        inner.style.transform = `translateY(${-textarea.scrollTop}px)`;
    });

    /* a value set by code does not fire "input": watch the property on this one box */
    const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(textarea), "value");

    if (descriptor?.set) {

        Object.defineProperty(textarea, "value", {
            configurable: true,
            get() {
                return descriptor.get.call(this);
            },
            set(next) {
                descriptor.set.call(this, next);
                refresh();
            }
        });

    }

    if (typeof ResizeObserver === "function") {
        new ResizeObserver(() => {
            measure();
            refresh();
        }).observe(textarea);
    }

    textarea.form?.addEventListener("reset", () => setTimeout(refresh, 0));

    const api = {
        refresh,
        markLine(line) {
            markedLine = Number.isInteger(line) && line > 0 ? line : null;
            placeMark();
        }
    };

    textarea.__lineGutter = api;

    return api;

}
