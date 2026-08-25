
/* =========================================================
   ToolZen Hub
   Articles Pagination
========================================================= */

import { articlesState } from "./articles-state.js";

import { renderArticleCards } from "./articles-render.js";


/* =========================================================
   RENDER PAGINATION
========================================================= */

export function updatePagination(totalPages) {

    const pagination =
        document.querySelector(
            ".articles-pagination"
        );


    if (!pagination) {
        return;
    }


    if (totalPages <= 1) {

        pagination.innerHTML = "";

        return;

    }


    let buttons = "";


    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        buttons += `

            <button
                type="button"
                class="pagination-button ${
                    page === articlesState.currentPage
                        ? "active"
                        : ""
                }"
                data-page="${page}"
            >
                ${page}
            </button>

        `;

    }


    pagination.innerHTML = `

        ${buttons}

        <button
            type="button"
            class="pagination-next"
            data-page="next"
            ${
                articlesState.currentPage >= totalPages
                    ? "disabled"
                    : ""
            }
        >

            Next

            <span aria-hidden="true">
                →
            </span>

        </button>

    `;

}


/* =========================================================
   INITIALIZE PAGINATION
========================================================= */

export function initializePagination() {

    const pagination =
        document.querySelector(
            ".articles-pagination"
        );


    if (!pagination) {
        return;
    }


    pagination.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "button"
                );


            if (!button) {
                return;
            }


            if (button.disabled) {
                return;
            }


            const page =
                button.dataset.page;


            if (!page) {
                return;
            }


            if (page === "next") {

                articlesState.currentPage += 1;

            } else {

                articlesState.currentPage =
                    Number(page);

            }


            renderArticleCards();


            const articlesMain =
                document.querySelector(
                    ".articles-main"
                );


            if (articlesMain) {

                articlesMain.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        }
    );

}
