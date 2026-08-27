/* =========================================================
   ToolZen Hub
   Article Search Utility

   Used by:
   - Articles Page

   Purpose:
   Search articles only.

   This is completely separate from calculator search.
========================================================= */


/* =========================================================
   ARTICLE DATA
========================================================= */

const articles = [

    {
        title: "How EMI Calculators Work",
        description:
            "Understand EMI, interest and loan repayment.",
        category: "Loans",
        keywords:
            "emi loan interest repayment monthly payment",
        url: "#"
    },

    {
        title: "How SIP Investment Works",
        description:
            "Learn how SIP investments and returns work.",
        category: "Investment",
        keywords:
            "sip investment mutual fund returns savings",
        url: "#"
    },

    {
        title: "Understanding GST",
        description:
            "A simple guide to GST and how it works.",
        category: "Tax",
        keywords:
            "gst tax goods services tax calculation",
        url: "#"
    },

    {
        title: "What Is BMI?",
        description:
            "Understand BMI and how it is calculated.",
        category: "Health",
        keywords:
            "bmi health weight body mass index",
        url: "#"
    },

    {
        title: "How to Calculate Percentage",
        description:
            "Learn simple ways to calculate percentages.",
        category: "Math",
        keywords:
            "percentage percent maths calculation",
        url: "#"
    }

];


/* =========================================================
   SEARCH ARTICLES
========================================================= */

export function searchArticles(query) {

    const search =
        String(query || "")
            .trim()
            .toLowerCase();


    if (!search) {
        return [];
    }


    return articles.filter(
        article => {

            const searchableText = [

                article.title,

                article.description,

                article.category,

                article.keywords

            ]
                .join(" ")
                .toLowerCase();


            return searchableText.includes(search);

        }
    );

}


/* =========================================================
   GET ALL ARTICLES
========================================================= */

export function getArticles() {

    return [...articles];

}


/* =========================================================
   ARTICLE SEARCH URL
========================================================= */

export function getArticleSearchUrl(query) {

    const search =
        String(query || "").trim();


    if (!search) {
        return "/Toolzenhub/articles.html";
    }


    return `/Toolzenhub/articles.html?q=${encodeURIComponent(search)}`;

}


/* =========================================================
   RENDER ARTICLE RESULTS
========================================================= */

export function renderArticleSearchResults(
    results,
    container
) {

    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (!results.length) {

        container.innerHTML = `

            <div class="article-search-empty">

                No articles found.

            </div>

        `;

        return;
    }


    const fragment =
        document.createDocumentFragment();


    results.forEach(
        article => {

            const link =
                document.createElement("a");


            link.href =
                article.url;


            link.className =
                "article-search-result";


            link.innerHTML = `

                <div class="article-search-result__content">

                    <strong>
                        ${article.title}
                    </strong>

                    <span>
                        ${article.description}
                    </span>

                    <small>
                        ${article.category}
                    </small>

                </div>


                <span
                    class="article-search-result__arrow"
                    aria-hidden="true"
                >
                    →
                </span>

            `;


            fragment.appendChild(link);

        }
    );


    container.appendChild(fragment);

}


/* =========================================================
   CLEAR ARTICLE SEARCH RESULTS
========================================================= */

export function clearArticleSearchResults(
    container
) {

    if (!container) {
        return;
    }


    container.innerHTML = "";

}


/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default {

    searchArticles,

    getArticles,

    getArticleSearchUrl,

    renderArticleSearchResults,

    clearArticleSearchResults

};
