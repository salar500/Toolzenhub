/* =========================================================
   ToolZen Hub
   AI products directory: search and filters

   The page lists every product as plain HTML; this script
   only hides cards that do not match the search, the
   audience and the category, and keeps the choice in the
   address (?audience=qa&category=testing) so a view can be
   shared or linked. Nothing is stored.
========================================================= */

const form = document.querySelector("[data-ai-filters]");

if (form) {

    const search = form.querySelector("#ai-search");
    const count = form.querySelector("[data-ai-count]");
    const cards = [...document.querySelectorAll(".ai-card")];
    const groups = [...document.querySelectorAll("[data-ai-group]")];
    const empty = document.querySelector("[data-ai-empty]");
    const resets = [...document.querySelectorAll("[data-ai-reset]")];
    const total = cards.length;

    const chosen = (name) => form.querySelector(`input[name="${name}"]:checked`)?.value ?? "";

    function choose(name, value) {
        const input = form.querySelector(`input[name="${name}"][value="${CSS.escape(value)}"]`);
        if (input) input.checked = true;
    }

    function apply({ remember = true } = {}) {

        const words = search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
        const audience = chosen("audience");
        const category = chosen("category");
        let shown = 0;

        for (const card of cards) {
            const match =
                (!audience || card.dataset.audiences.split(" ").includes(audience)) &&
                (!category || card.dataset.categories.split(" ").includes(category)) &&
                words.every((w) => card.dataset.search.includes(w));
            card.hidden = !match;
            if (match) shown += 1;
        }

        /* a card sits under its first category; a group with no visible card is hidden, so a product found through a second category shows under its first */
        for (const group of groups) group.hidden = !group.querySelector(".ai-card:not([hidden])");

        const narrowed = words.length > 0 || audience !== "" || category !== "";
        count.textContent = narrowed ? `${shown} of ${total} products shown.` : `${total} products.`;
        empty.hidden = shown !== 0;
        resets.forEach((r) => { r.hidden = r.closest("[data-ai-empty]") ? false : !narrowed; });

        if (remember) {
            const url = new URL(location.href);
            for (const [key, value] of [["audience", audience], ["category", category]]) {
                if (value) url.searchParams.set(key, value); else url.searchParams.delete(key);
            }
            history.replaceState(history.state, "", url);
        }

    }

    function reset() {
        search.value = "";
        choose("audience", "");
        choose("category", "");
        apply();
        search.focus();
    }

    const params = new URLSearchParams(location.search);
    choose("audience", params.get("audience") ?? "");
    choose("category", params.get("category") ?? "");

    form.hidden = false;
    form.addEventListener("submit", (event) => event.preventDefault());
    form.addEventListener("change", () => apply());
    search.addEventListener("input", () => apply());
    resets.forEach((r) => r.addEventListener("click", reset));

    apply({ remember: false });

}
