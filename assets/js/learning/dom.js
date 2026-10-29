/* =========================================================
   ToolZen Hub
   Learning: safe DOM construction

   Every learning page builds its dynamic content with these helpers.
   Text is always set as text (a text node or textContent), never as
   HTML, so content and visitor input cannot become markup. There is
   deliberately no way here to pass an HTML string.

     el("button", { class: "lx-btn", type: "button", onclick: fn }, "Check")
========================================================= */

export function el(tag, props = {}, ...children) {

    const node = document.createElement(tag);

    for (const [name, value] of Object.entries(props)) {

        if (value === undefined || value === null || value === false) continue;

        if (name === "class") node.className = value;
        else if (name === "text") node.textContent = value;
        else if (name.startsWith("on") && typeof value === "function") node.addEventListener(name.slice(2), value);
        else node.setAttribute(name, value === true ? "" : String(value));

    }

    for (const child of children.flat()) {

        if (child === undefined || child === null || child === false) continue;
        node.append(child instanceof Node ? child : document.createTextNode(String(child)));

    }

    return node;

}

/* Node.append(null) writes the word "null" into the page; this skips empty children (and flattens lists) the way el() does. */
export function put(parent, ...children) {
    for (const child of children.flat()) {
        if (child === undefined || child === null || child === false) continue;
        parent.append(child instanceof Node ? child : document.createTextNode(String(child)));
    }
    return parent;
}

export function clear(node) {
    node.replaceChildren();
    return node;
}

/* A code sample the keyboard can scroll; the text is never interpreted. */
export function codeBlock(text, label = "Code example") {
    return el("pre", { class: "lx-code", tabindex: "0", role: "region", "aria-label": label }, el("code", { text }));
}

/* One polite status line for the outcome of an explicit action. */
export function announce(live, message) {
    if (!live) return;
    live.textContent = "";
    /* a second write in the next task makes a repeated message announce again */
    setTimeout(() => { live.textContent = message; }, 30);
}

export const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
