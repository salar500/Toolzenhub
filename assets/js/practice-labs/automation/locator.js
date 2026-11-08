/* =========================================================
   ToolZen Hub
   Automation: a teaching locator evaluator (a documented subset of Playwright's locator rules)

   parseLocator(text) reads expressions such as
     page.getByRole('button', { name: 'Add to cart', exact: true }).first()
     page.getByLabel('Email')   page.getByText('Your cart')   page.getByPlaceholder('Search products')
     page.getByTestId('add-7')  page.locator('#sl-search')    .filter({ hasText: 'Lamp' })   .nth(2)   .last()
   resolve(doc, chain) finds the matching elements in a real document. It is NOT Playwright: roles cover common HTML
   elements, accessible names come from aria-label, aria-labelledby, <label>, alt, title, placeholder and text content,
   and hidden elements are skipped. The page that uses it says so. Pure apart from reading the given document.
========================================================= */

const IMPLICIT = [
    ["button", (el) => el.tagName === "BUTTON" || (el.tagName === "INPUT" && ["button", "submit", "reset"].includes(el.type))],
    ["link", (el) => el.tagName === "A" && el.hasAttribute("href")],
    ["heading", (el) => /^H[1-6]$/.test(el.tagName)],
    ["textbox", (el) => el.tagName === "TEXTAREA" || (el.tagName === "INPUT" && ["text", "email", "password", "tel", "url", ""].includes(el.type ?? ""))],
    ["searchbox", (el) => el.tagName === "INPUT" && el.type === "search"],
    ["spinbutton", (el) => el.tagName === "INPUT" && el.type === "number"],
    ["checkbox", (el) => el.tagName === "INPUT" && el.type === "checkbox"],
    ["radio", (el) => el.tagName === "INPUT" && el.type === "radio"],
    ["combobox", (el) => el.tagName === "SELECT"],
    ["listitem", (el) => el.tagName === "LI"],
    ["list", (el) => el.tagName === "UL" || el.tagName === "OL"],
    ["navigation", (el) => el.tagName === "NAV"],
    ["main", (el) => el.tagName === "MAIN"],
    ["table", (el) => el.tagName === "TABLE"],
    ["row", (el) => el.tagName === "TR"],
    ["cell", (el) => el.tagName === "TD"],
    ["columnheader", (el) => el.tagName === "TH"],
    ["img", (el) => el.tagName === "IMG"],
    ["form", (el) => el.tagName === "FORM"],
    ["status", (el) => el.getAttribute("role") === "status"]
];

export const ROLES = Object.freeze(IMPLICIT.map(([r]) => r));

const roleOf = (el) => el.getAttribute("role") ?? IMPLICIT.find(([, test]) => test(el))?.[0] ?? null;
const clean = (t) => String(t ?? "").replace(/\s+/g, " ").trim();

function visible(el) {
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
        if (n.hidden || n.getAttribute("aria-hidden") === "true") return false;
        const style = n.ownerDocument.defaultView?.getComputedStyle?.(n);
        if (style && (style.display === "none" || style.visibility === "hidden")) return false;
    }
    return true;
}

export function accessibleName(el) {
    const doc = el.ownerDocument;
    if (el.getAttribute("aria-labelledby")) return clean(el.getAttribute("aria-labelledby").split(/\s+/).map((id) => doc.getElementById(id)?.textContent ?? "").join(" "));
    if (el.getAttribute("aria-label")) return clean(el.getAttribute("aria-label"));
    if (el.id && ["INPUT", "SELECT", "TEXTAREA"].includes(el.tagName)) {
        const label = doc.querySelector(`label[for="${CSS.escape(el.id)}"]`);
        if (label) return clean(label.textContent);
    }
    const wrapping = el.closest("label");
    if (wrapping && wrapping !== el) return clean(wrapping.textContent);
    if (el.tagName === "IMG") return clean(el.getAttribute("alt"));
    if (["INPUT", "TEXTAREA"].includes(el.tagName)) return clean(el.getAttribute("title") ?? el.getAttribute("placeholder"));
    return clean(el.textContent || el.getAttribute("title"));
}

const nameMatches = (actual, wanted, exact) => (exact ? actual === wanted : actual.toLowerCase().includes(String(wanted).toLowerCase()));

/* ---------- parsing ---------- */

const STR = String.raw`'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"`;
const unq = (m) => (m[1] ?? m[2] ?? "").replace(/\\(.)/g, "$1");

function parseOptions(text) {
    const opts = {};
    if (!text) return opts;
    const name = new RegExp(String.raw`name\s*:\s*(?:${STR})`).exec(text);
    if (name) opts.name = unq([null, name[1], name[2]]);
    if (/exact\s*:\s*true/.test(text)) opts.exact = true;
    const hasText = new RegExp(String.raw`hasText\s*:\s*(?:${STR})`).exec(text);
    if (hasText) opts.hasText = unq([null, hasText[1], hasText[2]]);
    return opts;
}

/** [{ method, arg, options }] or throws Error with a learner-facing message */
export function parseLocator(text) {
    let rest = clean(text).replace(/;$/, "").replace(/^await\s+/, "");
    if (!rest.startsWith("page.")) throw new Error("Start with page. as in Playwright, for example page.getByRole('button', { name: 'Apply' }).");
    rest = rest.slice(4);
    const chain = [];
    const step = new RegExp(String.raw`^\.(getByRole|getByLabel|getByText|getByPlaceholder|getByTestId|locator|filter|first|last|nth)\(\s*(?:(?:${STR})|(\d+))?\s*(?:,\s*(\{[^}]*\}))?\s*(\{[^}]*\})?\s*\)`);
    while (rest.length) {
        const m = step.exec(rest);
        if (!m) throw new Error(`This part is not understood here: ${rest.slice(0, 40)}. Supported: getByRole, getByLabel, getByText, getByPlaceholder, getByTestId, locator, filter, first, last, nth.`);
        const [, method] = m;
        const arg = m[2] !== undefined || m[3] !== undefined ? unq([null, m[2], m[3]]) : m[4] !== undefined ? Number(m[4]) : undefined;
        chain.push({ method, arg, options: parseOptions(m[5] ?? m[6]) });
        rest = rest.slice(m[0].length);
    }
    if (!chain.length) throw new Error("Add a locator after page., for example page.getByText('Shop').");
    if (chain[0].method === "getByRole" && !ROLES.includes(chain[0].arg)) throw new Error(`The role '${chain[0].arg}' is not in this teaching subset. Try one of: ${ROLES.join(", ")}.`);
    return chain;
}

/* ---------- resolving ---------- */

export function resolve(doc, chain) {
    let set = null;
    for (const { method, arg, options } of chain) {
        const scope = set ?? [doc.body];
        const all = () => scope.flatMap((root) => [...root.querySelectorAll("*")]).filter(visible);
        switch (method) {
        case "getByRole": set = all().filter((el) => roleOf(el) === arg && (options.name === undefined || nameMatches(accessibleName(el), options.name, options.exact))); break;
        case "getByLabel": set = all().filter((el) => ["INPUT", "SELECT", "TEXTAREA"].includes(el.tagName) && nameMatches(accessibleName(el), arg, options.exact)); break;
        case "getByPlaceholder": set = all().filter((el) => el.getAttribute("placeholder") && nameMatches(clean(el.getAttribute("placeholder")), arg, options.exact)); break;
        case "getByTestId": set = all().filter((el) => el.getAttribute("data-testid") === arg); break;
        case "getByText": {
            const hits = all().filter((el) => nameMatches(clean(el.textContent), arg, options.exact));
            set = hits.filter((el) => !hits.some((other) => other !== el && el.contains(other)));
            break;
        }
        case "locator": try { set = scope.flatMap((root) => [...root.querySelectorAll(arg)]).filter(visible); } catch { throw new Error(`'${arg}' is not a valid CSS selector.`); } break;
        case "filter": set = (set ?? []).filter((el) => options.hasText === undefined || clean(el.textContent).toLowerCase().includes(options.hasText.toLowerCase())); break;
        case "first": set = (set ?? []).slice(0, 1); break;
        case "last": set = (set ?? []).slice(-1); break;
        case "nth": set = (set ?? []).slice(arg, arg + 1); break;
        }
    }
    return set ?? [];
}
