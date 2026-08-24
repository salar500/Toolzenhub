/* =========================================================
   ToolZen Hub
   Articles Page
========================================================= */


/* =========================================================
   ARTICLE DATA
========================================================= */

const articles = [

    {
        id: 1,
        category: "Loans",
        title: "How EMI is Calculated? A Complete Guide",
        description:
            "Understand the EMI calculation formula, factors involved and examples with easy explanations.",
        date: "May 12, 2024",
        readTime: "6 min read",
        image:
            "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
        alt: "House model on desk"
    },

    {
        id: 2,
        category: "Investment",
        title: "Best SIP Strategies for Beginners",
        description:
            "Learn practical SIP investment strategies to build wealth consistently and work towards your financial goals.",
        date: "May 10, 2024",
        readTime: "5 min read",
        image:
            "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80",
        alt: "Coins with plant growing"
    },

    {
        id: 3,
        category: "Tax",
        title: "Tax Saving Guide: Save More, Legally",
        description:
            "Explore smart tax-saving options and understand ways to reduce taxable income legally.",
        date: "May 8, 2024",
        readTime: "7 min read",
        image:
            "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80",
        alt: "Tax planning documents"
    },

    {
        id: 4,
        category: "Loans",
        title: "Home Loan Tips to Get the Best Deal",
        description:
            "Understand important factors that can help you compare home loans and choose a suitable option.",
        date: "May 5, 2024",
        readTime: "6 min read",
        image:
            "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
        alt: "House model with keys"
    },

    {
        id: 5,
        category: "Business",
        title: "ROI vs Profit: What's the Difference?",
        description:
            "Understand the difference between ROI and profit and when each metric is useful for business decisions.",
        date: "May 2, 2024",
        readTime: "4 min read",
        image:
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
        alt: "Business analytics on laptop"
    },

    {
        id: 6,
        category: "Math",
        title: "How to Calculate Percentage Easily",
        description:
            "Learn simple percentage formulas with practical examples for everyday use.",
        date: "April 30, 2024",
        readTime: "4 min read",
        image:
            "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80",
        alt: "Mathematics calculation"
    },

    {
        id: 7,
        category: "Health",
        title: "How to Calculate Your Daily Calorie Needs",
        description:
            "Understand the basics of calorie requirements and how simple calculations can help with everyday planning.",
        date: "April 28, 2024",
        readTime: "5 min read",
        image:
            "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80",
        alt: "Healthy food and nutrition"
    },

    {
        id: 8,
        category: "Converter",
        title: "Easy Unit Conversion Guide",
        description:
            "Learn how to quickly convert common units used in everyday calculations, shopping and measurements.",
        date: "April 25, 2024",
        readTime: "4 min read",
        image:
            "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
        alt: "Measurements and calculations"
    },

    {
        id: 9,
        category: "Investment",
        title: "SIP vs Lump Sum: Which Is Better?",
        description:
            "Understand the key differences between SIP and lump-sum investing and when each approach may be useful.",
        date: "April 22, 2024",
        readTime: "6 min read",
        image:
            "https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&q=80",
        alt: "Investment growth chart"
    },

    {
        id: 10,
        category: "Business",
        title: "How to Calculate Business Profit",
        description:
            "Learn how revenue, expenses and profit work together with a simple business profit calculation.",
        date: "April 20, 2024",
        readTime: "5 min read",
        image:
            "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80",
        alt: "Business meeting and planning"
    },

    {
        id: 11,
        category: "Loans",
        title: "How to Reduce Your Loan Interest",
        description:
            "Learn practical ways to compare loans, improve repayment strategies and reduce total interest costs.",
        date: "April 18, 2024",
        readTime: "6 min read",
        image:
            "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&q=80",
        alt: "Loan and financial planning"
    },

    {
        id: 12,
        category: "Tax",
        title: "Simple Tax Planning Tips for Beginners",
        description:
            "Understand basic tax planning concepts and practical ways to organize your finances throughout the year.",
        date: "April 15, 2024",
        readTime: "5 min read",
        image:
            "https://images.unsplash.com/photo-1554224155-a1487473ffd9?w=800&q=80",
        alt: "Tax planning paperwork"
    }

];


/* =========================================================
   CATEGORIES
========================================================= */

const categories = [

    {
        name: "Loans",
        icon: "🏠",
        count: 24
    },

    {
        name: "Investment",
        icon: "📈",
        count: 18
    },

    {
        name: "Tax",
        icon: "📄",
        count: 16
    },

    {
        name: "Business",
        icon: "💼",
        count: 14
    },

    {
        name: "Health",
        icon: "❤️",
        count: 12
    },

    {
        name: "Math",
        icon: "🧮",
        count: 10
    },

    {
        name: "Converter",
        icon: "🔄",
        count: 8
    }

];


/* =========================================================
   RENDER ARTICLES PAGE
========================================================= */

export function renderArticlesPage() {

    const app = document.getElementById("app");

    if (!app) {
        return;
    }


    app.innerHTML = `

        <!-- ==========================================
             ARTICLES HERO
        =========================================== -->

        <section class="articles-hero">

            <div class="articles-container articles-hero-inner">

                <div class="articles-hero-content">

                    <span class="articles-eyebrow">
                        TOOLZEN HUB
                    </span>

                    <h1>
                        Articles & Guides
                    </h1>

                    <p>
                        Helpful guides, tips and insights to help you
                        make smarter financial and everyday decisions.
                    </p>

                </div>


                <div
                    class="articles-hero-illustration"
                    aria-hidden="true"
                >

                    <div class="articles-books">

                        <div class="book book-one"></div>

                        <div class="book book-two"></div>

                        <div class="book book-three"></div>

                        <div class="plant-pot"></div>

                        <div class="plant">

                            <span></span>
                            <span></span>
                            <span></span>

                        </div>

                    </div>

                </div>

            </div>

        </section>


        <!-- ==========================================
             ARTICLES MAIN
        =========================================== -->

        <main class="articles-container articles-main">


            <!-- ======================================
                 FILTER BAR
            ======================================= -->

            <div class="articles-filter-bar">

                <button
                    type="button"
                    class="article-filter active"
                    data-category="All"
                >
                    All Articles
                </button>


                <button
                    type="button"
                    class="article-filter"
                    data-category="Loans"
                >
                    Loans
                </button>


                <button
                    type="button"
                    class="article-filter"
                    data-category="Investment"
                >
                    Investment
                </button>


                <button
                    type="button"
                    class="article-filter"
                    data-category="Tax"
                >
                    Tax
                </button>


                <button
                    type="button"
                    class="article-filter"
                    data-category="Business"
                >
                    Business
                </button>


                <button
                    type="button"
                    class="article-filter"
                    data-category="Health"
                >
                    Health
                </button>


                <button
                    type="button"
                    class="article-filter"
                    data-category="More"
                >
                    More
                    <span aria-hidden="true">⌄</span>
                </button>

            </div>


            <!-- ======================================
                 CONTENT LAYOUT
            ======================================= -->

            <div class="articles-layout">


                <!-- ==================================
                     MAIN FEED
                =================================== -->

                <section class="articles-feed">

                    <div
                        id="articles-list"
                        class="articles-list"
                    ></div>


                    <!-- ==================================
                         PAGINATION
                    =================================== -->

                    <nav
                        class="articles-pagination"
                        aria-label="Articles pagination"
                    >

                        <button
                            type="button"
                            class="pagination-button active"
                            data-page="1"
                        >
                            1
                        </button>


                        <button
                            type="button"
                            class="pagination-button"
                            data-page="2"
                        >
                            2
                        </button>


                        <button
                            type="button"
                            class="pagination-button"
                            data-page="3"
                        >
                            3
                        </button>


                        <span class="pagination-dots">
                            ...
                        </span>


                        <button
                            type="button"
                            class="pagination-button"
                            data-page="12"
                        >
                            12
                        </button>


                        <button
                            type="button"
                            class="pagination-next"
                            data-page="next"
                        >
                            Next
                            <span aria-hidden="true">
                                →
                            </span>
                        </button>

                    </nav>

                </section>


                <!-- ==================================
                     SIDEBAR
                =================================== -->

                <aside class="articles-sidebar">


                    <!-- ==================================
                         SEARCH
                    =================================== -->

                    <div class="article-sidebar-search">

                        <form id="article-search-form">

                            <label
                                for="article-search"
                                class="sr-only"
                            >
                                Search articles
                            </label>


                            <input
                                id="article-search"
                                type="search"
                                placeholder="Search articles..."
                                autocomplete="off"
                            >


                            <button
                                type="submit"
                                aria-label="Search articles"
                            >

                                <svg
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >

                                    <path
                                        d="M21 21l-4.35-4.35m1.35-5.15a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
                                    />

                                </svg>

                            </button>

                        </form>

                    </div>


                    <!-- ==================================
                         CATEGORIES
                    =================================== -->

                    <div class="article-sidebar-card">

                        <div class="article-sidebar-heading">

                            <h2>
                                Categories
                            </h2>

                        </div>


                        <div class="article-category-list">

                            ${categories.map(category => `

                                <a
                                    href="#"
                                    class="article-category-item"
                                    data-sidebar-category="${category.name}"
                                >

                                    <span class="article-category-name">

                                        <span class="article-category-icon">
                                            ${category.icon}
                                        </span>

                                        ${category.name}

                                    </span>


                                    <span class="article-category-count">

                                        ${category.count}

                                        <span aria-hidden="true">
                                            →
                                        </span>

                                    </span>

                                </a>

                            `).join("")}

                        </div>


                        <button
                            type="button"
                            class="article-more-categories"
                        >
                            More Categories
                            <span aria-hidden="true">
                                ⌄
                            </span>
                        </button>

                    </div>


                    <!-- ==================================
                         POPULAR ARTICLES
                    =================================== -->

                    <div class="article-sidebar-card">

                        <div class="article-sidebar-heading">

                            <h2>
                                Popular Articles
                            </h2>

                        </div>


                        <div class="popular-articles">

                            ${articles.slice(0, 4).map(article => `

                                <a
                                    href="#"
                                    class="popular-article"
                                >

                                    <img
                                        src="${article.image}"
                                        alt="${article.alt}"
                                        loading="lazy"
                                    >


                                    <div>

                                        <h3>
                                            ${article.title}
                                        </h3>

                                        <span>
                                            ${article.date}
                                        </span>

                                    </div>

                                </a>

                            `).join("")}

                        </div>

                    </div>


                    <!-- ==================================
                         NEWSLETTER
                    =================================== -->

                    <div class="article-newsletter">

                        <div class="newsletter-icon">

                            <svg
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >

                                <path
                                    d="M3 6.5A2.5 2.5 0 015.5 4h13A2.5 2.5 0 0121 6.5v11a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 17.5v-11zm2 .5l7 5 7-5"
                                />

                            </svg>

                        </div>


                        <div class="newsletter-content">

                            <h2>
                                Stay Updated
                            </h2>

                            <p>
                                Get the latest articles and updates
                                in your inbox.
                            </p>

                        </div>


                        <form class="newsletter-form">

                            <label
                                for="newsletter-email"
                                class="sr-only"
                            >
                                Email address
                            </label>


                            <input
                                id="newsletter-email"
                                type="email"
                                placeholder="Enter your email"
                                required
                            >


                            <button type="submit">
                                Subscribe
                            </button>

                        </form>

                    </div>

                </aside>

            </div>

        </main>

    `;


    renderArticleCards();

    initializeArticleInteractions();

}


/* =========================================================
   ARTICLE CARDS
========================================================= */

function renderArticleCards(
    selectedCategory = "All",
    searchTerm = ""
) {

    const container =
        document.getElementById("articles-list");

    if (!container) {
        return;
    }


    const normalizedSearch =
        searchTerm.trim().toLowerCase();


    const filteredArticles =
        articles.filter(article => {

            const categoryMatch =
                selectedCategory === "All" ||
                article.category === selectedCategory;


            const searchMatch =
                !normalizedSearch ||
                article.title
                    .toLowerCase()
                    .includes(normalizedSearch) ||

                article.description
                    .toLowerCase()
                    .includes(normalizedSearch) ||

                article.category
                    .toLowerCase()
                    .includes(normalizedSearch);


            return categoryMatch && searchMatch;

        });


    /* =====================================================
       EMPTY STATE
    ===================================================== */

    if (!filteredArticles.length) {

        container.innerHTML = `

            <div class="articles-empty">

                <div class="articles-empty-icon">
                    🔎
                </div>


                <h2>
                    No articles found
                </h2>


                <p>
                    Try another search term or choose
                    a different category.
                </p>

            </div>

        `;

        return;
    }


    /* =====================================================
       ARTICLE CARDS
    ===================================================== */

    container.innerHTML =

        filteredArticles.map(article => `

            <article
                class="article-card"
                data-category="${article.category}"
            >


                <!-- ======================================
                     ARTICLE IMAGE
                ======================================= -->

                <a
                    href="#"
                    class="article-card-image-link"
                    aria-label="Read ${article.title}"
                >

                    <img
                        src="${article.image}"
                        alt="${article.alt}"
                        class="article-card-image"
                        loading="lazy"
                    >

                </a>


                <!-- ======================================
                     ARTICLE CONTENT
                ======================================= -->

                <div class="article-card-content">


                    <div>

                        <span class="article-card-category">
                            ${article.category}
                        </span>


                        <h2>

                            <a href="#">
                                ${article.title}
                            </a>

                        </h2>


                        <p>
                            ${article.description}
                        </p>

                    </div>


                    <!-- ==================================
                         ARTICLE META
                    =================================== -->

                    <div class="article-card-meta">


                        <div class="article-meta-items">

                            <span>

                                <span aria-hidden="true">
                                    📅
                                </span>

                                ${article.date}

                            </span>


                            <span>

                                <span aria-hidden="true">
                                    ◷
                                </span>

                                ${article.readTime}

                            </span>

                        </div>


                        <span
                            class="article-arrow"
                            aria-hidden="true"
                        >
                            →
                        </span>

                    </div>

                </div>

            </article>

        `).join("");

}


/* =========================================================
   ARTICLE INTERACTIONS
========================================================= */

function initializeArticleInteractions() {

    let selectedCategory = "All";


    /* =====================================================
       CATEGORY FILTERS
    ===================================================== */

    const filterButtons =
        document.querySelectorAll(".article-filter");


    filterButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const category =
                    button.dataset.category;


                /*
                 * "More" is reserved for
                 * additional categories.
                 */

                if (category === "More") {
                    return;
                }


                selectedCategory = category;


                filterButtons.forEach(item => {

                    item.classList.remove("active");

                });


                button.classList.add("active");


                const searchInput =
                    document.getElementById(
                        "article-search"
                    );


                renderArticleCards(
                    selectedCategory,
                    searchInput?.value || ""
                );

            }
        );

    });


    /* =====================================================
       SEARCH
    ===================================================== */

    const searchForm =
        document.getElementById(
            "article-search-form"
        );


    const searchInput =
        document.getElementById(
            "article-search"
        );


    if (searchForm) {

        searchForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                renderArticleCards(
                    selectedCategory,
                    searchInput?.value || ""
                );

            }
        );

    }


    /* =====================================================
       LIVE SEARCH
    ===================================================== */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            () => {

                renderArticleCards(
                    selectedCategory,
                    searchInput.value
                );

            }
        );

    }


    /* =====================================================
       SIDEBAR CATEGORY FILTERS
    ===================================================== */

    const sidebarCategories =
        document.querySelectorAll(
            "[data-sidebar-category]"
        );


    sidebarCategories.forEach(item => {

        item.addEventListener(
            "click",
            event => {

                event.preventDefault();


                const category =
                    item.dataset.sidebarCategory;


                selectedCategory = category;


                filterButtons.forEach(button => {

                    button.classList.remove("active");


                    if (
                        button.dataset.category ===
                        category
                    ) {

                        button.classList.add("active");

                    }

                });


                renderArticleCards(
                    selectedCategory,
                    searchInput?.value || ""
                );


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

    });


    /* =====================================================
       PAGINATION
    ===================================================== */

    const paginationButtons =
        document.querySelectorAll(
            ".pagination-button"
        );


    const nextButton =
        document.querySelector(
            ".pagination-next"
        );


    paginationButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                paginationButtons.forEach(item => {

                    item.classList.remove("active");

                });


                button.classList.add("active");


                /*
                 * Pagination is prepared for
                 * future article pages.
                 *
                 * Current article dataset is
                 * displayed as the available feed.
                 */

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );

    });


    if (nextButton) {

        nextButton.addEventListener(
            "click",
            () => {

                const activeButton =
                    document.querySelector(
                        ".pagination-button.active"
                    );


                const currentPage =
                    Number(
                        activeButton?.dataset.page || 1
                    );


                const nextPage =
                    currentPage + 1;


                const targetButton =
                    document.querySelector(
                        `.pagination-button[data-page="${nextPage}"]`
                    );


                if (targetButton) {

                    targetButton.click();

                    return;

                }


                /*
                 * If the visible pagination jumps
                 * from page 3 to page 12, move to
                 * page 12 rather than breaking.
                 */

                const lastButton =
                    paginationButtons[
                        paginationButtons.length - 1
                    ];


                if (lastButton) {

                    lastButton.click();

                }

            }
        );

    }


    /* =====================================================
       NEWSLETTER
    ===================================================== */

    const newsletterForm =
        document.querySelector(
            ".newsletter-form"
        );


    if (newsletterForm) {

        newsletterForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const emailInput =
                    newsletterForm.querySelector(
                        "input[type='email']"
                    );


                if (!emailInput) {
                    return;
                }


                if (!emailInput.value.trim()) {
                    return;
                }


                /*
                 * Newsletter backend can be
                 * connected here later.
                 */

                emailInput.value = "";


                alert(
                    "Thank you for subscribing!"
                );

            }
        );

    }


    /* =====================================================
       MORE CATEGORIES
    ===================================================== */

    const moreCategoriesButton =
        document.querySelector(
            ".article-more-categories"
        );


    if (moreCategoriesButton) {

        moreCategoriesButton.addEventListener(
            "click",
            () => {

                const hiddenCategories =
                    categories.filter(category => {

                        return ![
                            "Loans",
                            "Investment",
                            "Tax",
                            "Business",
                            "Health"
                        ].includes(category.name);

                    });


                if (!hiddenCategories.length) {
                    return;
                }


                hiddenCategories.forEach(category => {

                    const alreadyExists =
                        document.querySelector(
                            `[data-sidebar-category="${category.name}"]`
                        );


                    if (alreadyExists) {
                        return;
                    }


                    const list =
                        document.querySelector(
                            ".article-category-list"
                        );


                    if (!list) {
                        return;
                    }


                    const item =
                        document.createElement("a");


                    item.href = "#";

                    item.className =
                        "article-category-item";

                    item.dataset.sidebarCategory =
                        category.name;


                    item.innerHTML = `

                        <span class="article-category-name">

                            <span class="article-category-icon">
                                ${category.icon}
                            </span>

                            ${category.name}

                        </span>


                        <span class="article-category-count">

                            ${category.count}

                            <span aria-hidden="true">
                                →
                            </span>

                        </span>

                    `;


                    list.appendChild(item);


                    item.addEventListener(
                        "click",
                        event => {

                            event.preventDefault();


                            selectedCategory =
                                category.name;


                            filterButtons.forEach(button => {

                                button.classList.remove(
                                    "active"
                                );

                            });


                            renderArticleCards(
                                selectedCategory,
                                searchInput?.value || ""
                            );

                        }
                    );

                });


                moreCategoriesButton.innerHTML = `
                    Fewer Categories
                    <span aria-hidden="true">⌃</span>
                `;

            }
        );

    }

}


/* =========================================================
   AUTO INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const articlesPage =
            document.getElementById(
                "articles-page"
            );


        const app =
            document.getElementById(
                "app"
            );


        /*
         * If the page already contains
         * the articles page wrapper,
         * don't render it again.
         */

        if (articlesPage) {
            return;
        }


        /*
         * Only render automatically when
         * an #app container exists and
         * this module is being used as
         * the articles-page renderer.
         */

        if (
            app &&
            window.location.pathname
                .toLowerCase()
                .includes("articles")
        ) {

            renderArticlesPage();

        }

    }
);

