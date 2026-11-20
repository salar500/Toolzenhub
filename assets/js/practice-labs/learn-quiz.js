/* =========================================================
   ToolZen Hub
   Practice Labs concept questions (the quiz blocks of interview and lesson pages)

   Each question is a fieldset of radio buttons with the index of the right option in data-answer. Check compares the
   choice, says whether it is right and opens the explanation, which is already in the page (readable without script).
   Nothing is stored or sent; the page keeps no score.
========================================================= */

export function initLearnQuiz(root = document) {

    for (const question of root.querySelectorAll(".learn-quiz__q")) {

        const button = question.querySelector("[data-quiz-check]");
        const result = question.querySelector(".learn-quiz__result");
        const reveal = question.querySelector("details");
        if (!button || !result) continue;

        button.hidden = false;

        button.addEventListener("click", () => {
            const chosen = question.querySelector("input[type=radio]:checked");
            if (!chosen) {
                result.textContent = "Choose an answer first.";
                delete question.dataset.verdict;
                return;
            }
            const right = chosen.value === question.dataset.answer;
            question.dataset.verdict = right ? "correct" : "not-yet";
            result.textContent = right ? "Correct." : "Not quite. Read the explanation below, then try another question.";
            if (reveal) reveal.open = true;
        });

    }

}
