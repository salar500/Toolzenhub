/* =========================================================
   ToolZen Hub
   Article Search Page

   Purpose:
   Search ARTICLES only.

   IMPORTANT:
   This file does NOT use calculator-search.js.
   It does NOT dispatch calculator search events.
   It does NOT modify the Home Hero search.
========================================================= */


/* =========================================================
   ARTICLE DATA
========================================================= */

const articles = [

    {
        title: "How EMI Is Calculated",
        description:
            "Understand how loan EMI is calculated and how interest and principal affect your monthly payment.",
        category: "Loans",
        date: "Aug 2026",
        readTime: "5 min read",
        image:
            "/Toolzenhub/assets/Images/articles/emi-calculator.jpg",
        url:
            "/Toolzenhub/articles/how-emi-is-calculated.html"
    },


    {
        title: "How to Calculate Home Loan EMI",
        description:
            "Learn how home loan EMI works and how changing the loan amount, interest rate and tenure affects repayment.",
        category: "Loans",
        date: "Aug 2026",
        readTime: "6 min read",
        image:
            "/Toolzenhub/assets/Images/articles/home-loan-emi.jpg",
        url:
            "/Toolzenhub/articles/home-loan-emi.html"
    },


    {
        title: "SIP Calculator Guide",
        description:
            "Learn how SIP investments grow over time and how monthly contributions can build long-term wealth.",
        category: "Investment",
        date: "Aug 2026",
        readTime: "5 min read",
        image:
            "/Toolzenhub/assets/Images/articles/sip-calculator.jpg",
        url:
            "/Toolzenhub/articles/sip-calculator-guide.html"
    },


    {
        title: "How GST Is Calculated",
        description:
            "Understand GST calculation, GST rates and how to calculate the tax amount on a product or service.",
        category: "Tax",
        date: "Aug 2026",
        readTime: "4 min read",
        image:
            "/Toolzenhub/assets/Images/articles/gst-calculator.jpg",
        url:
            "/Toolzenhub/articles/how-gst-is-calculated.html"
    },


    {
        title: "Understanding BMI",
        description:
            "Learn what BMI means, how it is calculated and how to interpret the result.",
        category: "Health",
        date: "Aug 2026",
        readTime: "4 min read",
        image:
            "/Toolzenhub/assets/Images/articles/bmi-calculator.jpg",
        url:
            "/Toolzenhub/articles/understanding-bmi.html"
    },


    {
        title: "How to Calculate Profit Margin",
        description:
            "Learn the difference between profit and profit margin and how businesses calculate their margins.",
        category: "Business",
        date: "Aug 2026",
        readTime: "4 min read",
        image:
            "/Toolzenhub/assets/Images/articles/profit-margin.jpg",
        url:
            "/Toolzenhub/articles/how-to-calculate-profit-margin.html"
    },


    {
        title: "Percentage Calculation Made Easy",
        description:
            "A simple guide to calculating percentages, percentage increase, decrease and differences.",
        category: "Math",
        date: "Aug 2026",
        readTime: "4 min read",
        image:
            "/Toolzenhub/assets/Images/articles/percentage.jpg",
        url:
            "/Toolzenhub/articles/percentage-calculation.html"
    },


    {
        title: "How Compound Interest Works",
        description:
            "Understand compound interest and how your money can grow when interest is reinvested over time.",
        category: "Investment",
        date: "Aug 2026",
        readTime: "6 min read",
        image:
            "/Toolzenhub/assets/Images/articles/compound-interest.jpg",
        url:
            "/Toolzenhub/articles/compound-interest.html"
    }

];


/* =========================================================
   SEARCH ARTICLES
========================================================= */

function searchArticles(query) {

    const search =
        String(query || "")
            .trim()
            .toLowerCase();


    if (!search) {

        return [];

    }


    return articles.filter(article => {

        const searchableText = [

            article.title,

            article.description,

            article.category

        ]
            .join(" ")
            .toLowerCase();


        return searchableText.includes(search);

    });

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   RENDER EMPTY STATE
========================================================= */

function renderEmptyState(message) {

    const results =
        document.getElementById("article-search-results");


    if (!results) {
        return;
    }


    results.innerHTML = `

        <div class="search-empty">

            <div>

                <div
                    class="search-empty-icon"
                    aria-hidden="true"
                >
                    🔎
                </div>

                <h2>
                    No articles found
                </h2>

                <p>
                    ${escapeHtml(message)}
                </p>

            </div>

        </div>

    `;

}


/* =========================================================
   RENDER RESULTS
========================================================= */

function renderResults(results, query) {

    const resultsContainer =
        document.getElementById("article-search-results");


    const heading =
        document.getElementById("search-results-heading");


    if (!resultsContainer || !heading) {
        return;
    }


    /* =====================================================
       EMPTY QUERY
    ====================================================== */

    if (!query) {

        heading.innerHTML = `

            <h2>
                Search our articles
            </h2>

            <p>
                Enter a topic above to find relevant articles.
            </p>

        `;


        renderEmptyState(
            "Try searching for topics such as EMI, loans, SIP, GST, BMI or investment."
        );

        return;

    }


    /* =====================================================
       NO RESULTS
    ====================================================== */

    if (!results.length) {

        heading.innerHTML = `

            <h2>
                No results for "${escapeHtml(query)}"
            </h2>

            <p>
                Try a different keyword or search topic.
            </p>

        `;


        renderEmptyState(
            `We couldn't find any articles matching "${query}".`
        );

        return;

    }


    /* =====================================================
       RESULTS HEADING
    ====================================================== */

    heading.innerHTML = `

        <h2>
            Search results for "${escapeHtml(query)}"
        </h2>

        <p>
            ${results.length}
            ${results.length === 1 ? "article" : "articles"}
            found
        </p>

    `;


    /* =====================================================
       RESULT CARDS
    ====================================================== */

    resultsContainer.innerHTML =
        results.map(article => `

            <a
                class="search-result-card"
                href="${escapeHtml(article.url)}"
            >

                <div class="search-result-image">

                    <img
                        src="${escapeHtml(article.image)}"
                        alt="${escapeHtml(article.title)}"
                        loading="lazy"
                    >

                </div>


                <div class="search-result-content">

                    <span class="search-result-category">
                        ${escapeHtml(article.category)}
                    </span>


                    <h2>
                        ${escapeHtml(article.title)}
                    </h2>


                    <p class="search-result-description">
                        ${escapeHtml(article.description)}
                    </p>


                    <div class="search-result-meta">

                        <span>
                            ${escapeHtml(article.date)}
                        </span>

                        <span>
                            ${escapeHtml(article.readTime)}
                        </span>

                        <span
                            class="search-result-arrow"
                            aria-hidden="true"
                        >
                            →
                        </span>

                    </div>

                </div>

            </a>

        `).join("");

}


/* =========================================================
   GET QUERY FROM URL
========================================================= */

function getSearchQuery() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    return (
        params.get("q") || ""
    ).trim();

}


/* =========================================================
   UPDATE URL
========================================================= */

function updateSearchUrl(query) {

    const url =
        new URL(
            window.location.href
        );


    if (query) {

        url.searchParams.set(
            "q",
            query
        );

    } else {

        url.searchParams.delete("q");

    }


    window.history.pushState(
        {},
        "",
        url
    );

}


/* =========================================================
   INITIALIZE
========================================================= */

function initArticleSearch() {

    const form =
        document.getElementById(
            "article-search-form"
        );


    const input =
        document.getElementById(
            "article-search-input"
        );


    if (!form || !input) {
        return;
    }


    const initialQuery =
        getSearchQuery();


    input.value =
        initialQuery;


    renderResults(
        searchArticles(initialQuery),
        initialQuery
    );


    /* =====================================================
       SUBMIT
    ====================================================== */

    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const query =
                input.value.trim();


            updateSearchUrl(query);


            renderResults(
                searchArticles(query),
                query
            );

        }
    );


    /* =====================================================
       BROWSER BACK / FORWARD
    ====================================================== */

    window.addEventListener(
        "popstate",
        () => {

            const query =
                getSearchQuery();


            input.value =
                query;


            renderResults(
                searchArticles(query),
                query
            );

        }
    );

}


/* =========================================================
   START
========================================================= */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initArticleSearch
    );

} else {

    initArticleSearch();

}
