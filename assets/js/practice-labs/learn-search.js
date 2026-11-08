/* =========================================================
   ToolZen Hub
   Practice Labs search (on /practice-labs/)

   Loads the build-time index (/practice-labs/search-index.json) the first time the visitor uses the search, then filters it
   in the browser: every word typed must appear in the title, the place or the description, and the department, type and
   level filters narrow the list. Results are drawn with DOM methods only. Nothing typed is stored or sent anywhere: the
   index is a static file and the filtering happens on this device.
========================================================= */

const KIND = { department: "Department", lab: "Lab", path: "Learning path", lesson: "Lesson" };
const LEVEL = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };
const MAX = 40;

export function initLearnSearch(root = document.querySelector("[data-search-index]")) {

    if (!root) return;

    const input = root.querySelector("input[type=search]");
    const filters = [...root.querySelectorAll("[data-filter]")];
    const status = root.querySelector(".learn-search__status");
    const results = root.querySelector(".learn-search__results");
    let index = null;
    let loading = null;

    root.hidden = false;

    const load = () => (loading ??= fetch(root.dataset.searchIndex)
        .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
        .then((data) => {
            index = data.map((entry) => ({ ...entry, haystack: `${entry.title} ${entry.where ?? ""} ${entry.text}`.toLowerCase() }));
        })
        .catch(() => {
            status.textContent = "Search could not load. Browse the departments below instead.";
        }));

    function render() {

        if (!index) return;

        const words = input.value.toLowerCase().split(/\s+/).filter(Boolean);
        const chosen = Object.fromEntries(filters.map((f) => [f.dataset.filter, f.value]));
        const active = words.length > 0 || Object.values(chosen).some(Boolean);

        results.replaceChildren();

        if (!active) {
            status.textContent = "";
            return;
        }

        const found = index.filter((entry) =>
            words.every((word) => entry.haystack.includes(word)) &&
            Object.entries(chosen).every(([key, value]) => !value || entry[key] === value)
        );

        status.textContent = found.length === 0
            ? "Nothing matches. Try a shorter word, or clear a filter."
            : `${found.length} ${found.length === 1 ? "result" : "results"}${found.length > MAX ? `; the first ${MAX} are shown` : ""}.`;

        for (const entry of found.slice(0, MAX)) {
            const li = document.createElement("li");
            const a = document.createElement("a");
            a.href = entry.url;
            a.textContent = entry.title;
            const meta = document.createElement("span");
            meta.className = "learn-search__meta";
            meta.textContent = [KIND[entry.kind], LEVEL[entry.level], entry.where].filter(Boolean).join(" · ");
            const text = document.createElement("span");
            text.className = "learn-search__text";
            text.textContent = entry.text.length > 160 ? `${entry.text.slice(0, 157)}...` : entry.text;
            li.append(a, meta, text);
            results.append(li);
        }

    }

    const run = () => load().then(render);

    input.addEventListener("input", run);
    input.addEventListener("focus", () => load(), { once: true });
    for (const f of filters) f.addEventListener("change", run);

}
