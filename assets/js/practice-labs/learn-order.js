/* =========================================================
   ToolZen Hub
   Practice Labs ordering tasks: give each shown step its position, then check. data-order holds, for each shown item,
   its right position (0-based). The right order and the explanation are already in the page. Nothing is stored.
========================================================= */

export function initLearnOrder(root = document) {

    for (const block of root.querySelectorAll(".learn-order")) {

        const answer = JSON.parse(block.dataset.order);
        const selects = [...block.querySelectorAll("select")];
        const button = block.querySelector("[data-order-check]");
        const result = block.querySelector(".learn-quiz__result");
        for (const s of selects) s.hidden = false;
        button.hidden = false;

        button.addEventListener("click", () => {
            const chosen = selects.map((s) => s.value);
            if (chosen.some((v) => v === "")) { result.textContent = "Give every step a position first."; delete block.dataset.verdict; return; }
            if (new Set(chosen).size !== chosen.length) { result.textContent = "Each position can be used once."; delete block.dataset.verdict; return; }
            const wrong = chosen.filter((v, i) => Number(v) !== answer[i]).length;
            block.dataset.verdict = wrong === 0 ? "correct" : "not-yet";
            result.textContent = wrong === 0 ? "Correct order." : `Not quite: ${wrong} ${wrong === 1 ? "step is" : "steps are"} in the wrong place. Try again, or open the right order below.`;
        });

    }

}
