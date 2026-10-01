/**
 * Structural DOM outline used for the DOM baselines.
 *
 * Produces a stable, human-diffable text tree: tag + #id + .classes + a whitelist of meaningful
 * attributes + (truncated) own text. Volatile or irrelevant detail is normalised away:
 *   - style attributes, script/style/noscript, comments, SVG internals
 *   - absolute origins and the deployment prefix in URLs  (…/Toolzenhub/x  ->  {ROOT}x)
 *   - <select> option lists are summarised (count / first / last / selected)
 *   - whitespace is collapsed, long text is truncated
 */
export async function domOutline(page, selector, { siteRoot, maxDepth = 40, textLimit = 90 } = {}) {
  return page.evaluate(
    ({ selector, siteRoot, maxDepth, textLimit }) => {
      const KEEP = new Set(["href", "src", "type", "name", "for", "role", "alt", "loading", "placeholder", "min", "max", "step", "value", "required", "disabled", "colspan", "rel", "target", "action", "method", "lang"]);
      const norm = (u) => {
        try {
          const url = new URL(u, location.href);
          if (url.origin !== location.origin) return u;
          let p = url.pathname.startsWith(siteRoot) ? "{ROOT}" + url.pathname.slice(siteRoot.length) : url.pathname;
          return p + url.search + url.hash;
        } catch {
          return u;
        }
      };
      const lines = [];
      const walk = (el, depth) => {
        if (depth > maxDepth) return;
        const tag = el.tagName.toLowerCase();
        if (["script", "style", "noscript", "template"].includes(tag)) return;
        let line = "  ".repeat(depth) + tag;
        if (el.id) line += "#" + el.id;
        if (typeof el.className === "string" && el.className.trim()) line += "." + el.className.trim().split(/\s+/).sort().join(".");
        const attrs = [];
        for (const a of [...el.attributes].sort((x, y) => x.name.localeCompare(y.name))) {
          const n = a.name;
          if (n === "class" || n === "id" || n === "style") continue;
          if (KEEP.has(n) || n.startsWith("aria-") || n.startsWith("data-")) {
            let v = a.value;
            if (n === "href" || n === "src" || n === "action") v = norm(v);
            attrs.push(v === "" ? n : `${n}="${v}"`);
          }
        }
        if (attrs.length) line += " [" + attrs.join(" ") + "]";
        if (tag === "svg") {
          lines.push(line);
          return;
        }
        if (tag === "select") {
          const opts = [...el.options];
          const sel = el.selectedOptions[0];
          line += ` {${opts.length} options: "${opts[0]?.text.trim()}"…"${opts.at(-1)?.text.trim()}", selected="${sel?.text.trim()}"}`;
          lines.push(line);
          return;
        }
        const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(" ").replace(/\s+/g, " ").trim();
        if (own) line += ` "${own.length > textLimit ? own.slice(0, textLimit) + "…" : own}"`;
        lines.push(line);
        for (const child of el.children) walk(child, depth + 1);
      };
      const roots = [...document.querySelectorAll(selector)];
      if (!roots.length) return `(selector not found: ${selector})`;
      roots.forEach((r, i) => {
        if (roots.length > 1) lines.push(`--- match ${i + 1} of ${roots.length} ---`);
        walk(r, 0);
      });
      return lines.join("\n") + "\n";
    },
    { selector, siteRoot, maxDepth, textLimit },
  );
}
