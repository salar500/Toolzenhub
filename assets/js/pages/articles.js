/* =========================================================
   ToolZen Hub
   Articles Page JavaScript
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const filters = document.querySelectorAll(".article-filter");
    const categoryButtons = document.querySelectorAll(
        ".article-category-list button"
    );

    const articleCards = document.querySelectorAll(".article-card");

    const noResults = document.getElementById(
        "articles-no-results"
    );

    const searchForm = document.getElementById(
        "article-search-form"
    );

    const searchInput = document.getElementById(
        "article-search"
    );


    /* =====================================================
       CATEGORY FILTER
    ===================================================== */

    function filterArticles(category) {

        let visibleArticles = 0;

        articleCards.forEach((article) => {

            const articleCategory =
                article.dataset.category;

            if (
                category === "all" ||
                articleCategory === category
            ) {

                article.classList.remove("hidden");

                visibleArticles++;

            } else {

                article.classList.add("hidden");

            }

        });


        if (noResults) {

            noResults.classList.toggle(
                "show",
                visibleArticles === 0
            );

        }

    }


    /* =====================================================
       TOP FILTER BUTTONS
    ===================================================== */

    filters.forEach((button) => {

        button.addEventListener("click", () => {

            filters.forEach((item) => {
                item.classList.remove("active");
            });

            button.classList.add("active");

            const category =
                button.dataset.category;

            filterArticles(category);

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        });

    });


    /* =====================================================
       SIDEBAR CATEGORY BUTTONS
    ===================================================== */

    categoryButtons.forEach((button) => {

        button.addEventListener("click", () => {

            const category =
                button.dataset.category;

            filters.forEach((filter) => {

                filter.classList.toggle(
                    "active",
                    filter.dataset.category === category
                );

            });

            filterArticles(category);

        });

    });


    /* =====================================================
       ARTICLE SEARCH
    ===================================================== */

    if (searchForm && searchInput) {

        searchForm.addEventListener(
            "submit",
            (event) => {

                event.preventDefault();

                const searchTerm =
                    searchInput.value
                        .trim()
                        .toLowerCase();

                let visibleArticles = 0;


                articleCards.forEach((article) => {

                    const text =
                        article.textContent
                            .toLowerCase();

                    if (
                        searchTerm === "" ||
                        text.includes(searchTerm)
                    ) {

                        article.classList.remove(
                            "hidden"
                        );

                        visibleArticles++;

                    } else {

                        article.classList.add(
                            "hidden"
                        );

                    }

                });


                if (noResults) {

                    noResults.classList.toggle(
                        "show",
                        visibleArticles === 0
                    );

                }

            }
        );

    }


    /* =====================================================
       NEWSLETTER
    ===================================================== */

    const newsletterForms =
        document.querySelectorAll(
            ".articles-newsletter form"
        );


    newsletterForms.forEach((form) => {

        form.addEventListener(
            "submit",
            (event) => {

                event.preventDefault();

                const input =
                    form.querySelector(
                        "input[type='email']"
                    );

                if (!input) {
                    return;
                }

                if (!input.value.trim()) {
                    return;
                }

                alert(
                    "Thanks! You have been subscribed to ToolZen Hub updates."
                );

                input.value = "";

            }
        );

    });

});
