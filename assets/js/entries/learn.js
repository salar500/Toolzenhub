/* =========================================================
   ToolZen Hub
   Practice Labs learning-path entry (path, level, module and lesson pages)
   These pages are generated complete: breadcrumb, roadmap, lesson text, examples, exercises, hints and solutions. The
   script binds the header menu and the footer, starts the roadmap (sidebar or drawer), starts the search on the Practice Labs
   home, and, on a page with SQL to run, loads the browser SQL engine (practice-labs/learn-practice.js) only then.
========================================================= */
import { renderHeader } from "../components/header.js";
import { renderFooter } from "../components/footer.js";
import { initSectionRail } from "../ui/section-rail.js";

document.addEventListener(
    "DOMContentLoaded",
    () => {
        renderHeader();
        renderFooter();
        initSectionRail();

        if (document.querySelector("[data-writing]")) {
            import("../practice-labs/learn-writing.js").then((module) => module.initLearnWriting());
        }

        if (document.querySelector("[data-webplay]")) {
            import("../practice-labs/learn-webplay.js").then((module) => module.initWebPlay());
        }

        if (document.querySelector("[data-apitask]")) {
            import("../practice-labs/learn-api.js").then((module) => module.initApiTasks());
        }

        if (document.querySelector("[data-jsrun]")) {
            import("../practice-labs/learn-jsrun.js").then((module) => module.initJsRun());
        }

        if (document.querySelector("[data-numeric]")) {
            import("../practice-labs/learn-numeric.js").then((module) => module.initNumeric());
        }

        if (document.querySelector("[data-aiviz]")) {
            import("../practice-labs/learn-aiviz.js").then((module) => module.initAiViz());
        }

        if (document.querySelector("[data-codecheck]")) {
            import("../practice-labs/learn-codecheck.js").then((module) => module.initCodeChecks());
        }

        if (document.querySelector("[data-locator]")) {
            import("../practice-labs/learn-locator.js").then((module) => module.initLocatorPractice());
        }

        if (document.querySelector("[data-labset]")) {
            import("../practice-labs/learn-labset.js").then((module) => module.initLabsets());
        }

        if (document.querySelector("[data-bughunt]")) {
            import("../practice-labs/learn-bughunt.js").then((module) => module.initBugHunt());
        }

        if (document.querySelector(".learn-order")) {
            import("../practice-labs/learn-order.js").then((module) => module.initLearnOrder());
        }

        if (document.querySelector(".learn-quiz")) {
            import("../practice-labs/learn-quiz.js").then((module) => module.initLearnQuiz());
        }

        if (document.querySelector("[data-search-index]")) {
            import("../practice-labs/learn-search.js").then((module) => module.initLearnSearch());
        }

        if (document.querySelector("[data-sql-run], .learn-exercise, [data-join-viz]")) {
            import("../practice-labs/learn-practice.js")
                .then((module) => module.initLearnPractice())
                .catch(() => {
                    /* the lesson stays readable: its examples, hints and solutions are in the page */
                });
        }
    }
);
