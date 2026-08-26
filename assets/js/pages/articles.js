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
        date: "Aug 25, 2026",
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
        date: "Aug 25, 2026",
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
        date: "Aug 25, 2026",
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
        date: "Aug 25, 2026",
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
        date: "Aug 25, 2026",
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
        date: "Aug 25, 2026",
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
        date: "Aug 25, 2026",
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
        date: "Aug 25, 2026",
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
        date: "Aug 25, 2026",
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
        date: "Aug 25, 2026",
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
        date: "Aug 25, 2026",
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
        date: "Aug 25, 2026",
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
   STATE
========================================================= */

let selectedCategory = "All";

let currentPage = 1;

const articlesPerPage = 5;


/* =========================================================
   RENDER ARTICLES PAGE
========================================================= */

export function renderArticlesPage() {

    const app = document.getElementById("app");

    if (!app) {
        return;
    }


    app.innerHTML = `

        <!-- =================================================
             ARTICLES PAGE
        ================================================== -->

        <div id="articles-page">


            <!-- =============================================
                 HERO
            ============================================== -->

            <section class="articles-hero">

                <div class="articles-container">

                    <div class="articles-hero-inner">


                        <!-- =================================
                             HERO TEXT
                        ================================== -->

                        <div class="articles-hero-content">

                            <h1>
                                Articles & Guides
                            </h1>

                            <p>
                                Helpful guides, tips and insights to help you
                                make smarter financial and everyday decisions.
                            </p>

                        </div>

<!-- HERO IMAGE -->

<div class="articles-hero-visual">

    <div class="articles-hero-illustration">

        <img
            class="articles-hero-image"
            src="assets/images/articles-hero.png"
            alt=""
            aria-hidden="true"
        >

    </div>


                            <!-- =================================
                                 ALL ARTICLES BUTTON
                            ================================== -->

                            <div class="articles-hero-action">

                                <button
                                    type="button"
                                    class="article-filter active"
                                    data-category="All"
                                >
                                    All Articles
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            <!-- =============================================
                 MAIN ARTICLES
            ============================================== -->

            <main class="articles-container articles-main">


                <!-- =========================================
                     FILTER BAR
                ========================================== -->

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
                        data-category="Math"
                    >
                        Math
                    </button>


                    <button
                        type="button"
                        class="article-filter"
                        data-category="Converter"
                    >
                        Converter
                    </button>

                </div>


                <!-- =========================================
                     CONTENT LAYOUT
                ========================================== -->

                <div class="articles-layout">


                    <!-- =====================================
                         ARTICLES FEED
                    ====================================== -->

                    <section class="articles-feed">

                        <div
                            id="articles-list"
                            class="articles-list"
                        ></div>


                        <!-- =================================
                             PAGINATION
                        ================================== -->

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


                    <!-- =====================================
                         SIDEBAR
                    ====================================== -->

                    <aside class="articles-sidebar">


                        <!-- =================================
                             SEARCH
                        ================================== -->

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


                        <!-- =================================
                             CATEGORIES
                        ================================== -->

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


                        <!-- =================================
                             POPULAR ARTICLES
                        ================================== -->

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


                        <!-- =================================
                             NEWSLETTER
                        ================================== -->

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

        </div>

    `;


    initializeArticlesPage();

}


/* =========================================================
   RENDER ARTICLE CARDS
========================================================= */

function renderArticleCards(
    category = selectedCategory,
    searchTerm = ""
) {

    const list =
        document.getElementById("articles-list");


    if (!list) {
        return;
    }


    selectedCategory = category;


    const normalizedSearch =
        searchTerm.trim().toLowerCase();


    let filteredArticles =
        articles.filter(article => {

            const matchesCategory =
                category === "All" ||
                article.category === category;


            const matchesSearch =
                !normalizedSearch ||
                article.title.toLowerCase().includes(normalizedSearch) ||
                article.description.toLowerCase().includes(normalizedSearch) ||
                article.category.toLowerCase().includes(normalizedSearch);


            return (
                matchesCategory &&
                matchesSearch
            );

        });


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                filteredArticles.length /
                articlesPerPage
            )
        );


    if (currentPage > totalPages) {
        currentPage = totalPages;
    }


    const startIndex =
        (currentPage - 1) *
        articlesPerPage;


    const visibleArticles =
        filteredArticles.slice(
            startIndex,
            startIndex + articlesPerPage
        );


    if (!visibleArticles.length) {

        list.innerHTML = `

            <div class="articles-empty">

                <div>

                    <div class="articles-empty-icon">
                        🔎
                    </div>

                    <h2>
                        No articles found
                    </h2>

                    <p>
                        Try another category or search term.
                    </p>

                </div>

            </div>

        `;

    } else {

        list.innerHTML =
            visibleArticles.map(article => `

                <article class="article-card">

                    <a
                        href="#"
                        class="article-card-image-link"
                        aria-label="${article.title}"
                    >

                        <img
                            class="article-card-image"
                            src="${article.image}"
                            alt="${article.alt}"
                            loading="lazy"
                        >

                    </a>


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


                        <div class="article-card-meta">

                            <div class="article-meta-items">

                                <span>
                                    📅
                                    ${article.date}
                                </span>

                                <span>
                                    ◷
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


    updatePagination(totalPages);

}


/* =========================================================
   PAGINATION
========================================================= */

function updatePagination(totalPages) {

    const pagination =
        document.querySelector(
            ".articles-pagination"
        );


    if (!pagination) {
        return;
    }


    const pageButtons =
        pagination.querySelectorAll(
            ".pagination-button"
        );


    pageButtons.forEach(button => {

        const page =
            Number(button.dataset.page);


        button.classList.toggle(
            "active",
            page === currentPage
        );


        button.disabled =
            page > totalPages;

    });

}


/* =========================================================
   INITIALIZE PAGE
========================================================= */

function initializeArticlesPage() {

    currentPage = 1;

    selectedCategory = "All";


    const filterButtons =
        document.querySelectorAll(
            ".article-filter"
        );


    const searchInput =
        document.getElementById(
            "article-search"
        );


    const searchForm =
        document.getElementById(
            "article-search-form"
        );


    renderArticleCards(
        "All",
        ""
    );


    /* =====================================================
       FILTER BUTTONS
    ===================================================== */

    filterButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const category =
                    button.dataset.category;


                if (!category) {
                    return;
                }


                selectedCategory =
                    category;


                currentPage = 1;


                filterButtons.forEach(
                    filterButton => {

                        filterButton.classList.toggle(
                            "active",
                            filterButton.dataset.category ===
                            selectedCategory
                        );

                    }
                );


                renderArticleCards(
                    selectedCategory,
                    searchInput?.value || ""
                );


                const articlesMain =
                    document.querySelector(
                        ".articles-main"
                    );


                if (
                    button.closest(
                        ".articles-hero-action"
                    ) &&
                    articlesMain
                ) {

                    articlesMain.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }

            }
        );

    });


    /* =====================================================
       SEARCH
    ===================================================== */

    if (searchForm) {

        searchForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                currentPage = 1;

                renderArticleCards(
                    selectedCategory,
                    searchInput?.value || ""
                );

            }
        );

    }


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            () => {

                currentPage = 1;

                renderArticleCards(
                    selectedCategory,
                    searchInput.value
                );

            }
        );

    }


    /* =====================================================
       PAGINATION
    ===================================================== */

    const pagination =
        document.querySelector(
            ".articles-pagination"
        );


    if (pagination) {

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


                const page =
                    button.dataset.page;


                if (!page) {
                    return;
                }


                if (page === "next") {

                    currentPage += 1;

                } else {

                    currentPage =
                        Number(page);

                }


                const totalFiltered =
                    articles.filter(article => {

                        const matchesCategory =
                            selectedCategory === "All" ||
                            article.category === selectedCategory;


                        const searchTerm =
                            searchInput?.value
                                .trim()
                                .toLowerCase() || "";


                        const matchesSearch =
                            !searchTerm ||
                            article.title
                                .toLowerCase()
                                .includes(searchTerm) ||
                            article.description
                                .toLowerCase()
                                .includes(searchTerm) ||
                            article.category
                                .toLowerCase()
                                .includes(searchTerm);


                        return (
                            matchesCategory &&
                            matchesSearch
                        );

                    }).length;


                const totalPages =
                    Math.max(
                        1,
                        Math.ceil(
                            totalFiltered /
                            articlesPerPage
                        )
                    );


                if (currentPage > totalPages) {
                    currentPage = 1;
                }


                if (currentPage < 1) {
                    currentPage = 1;
                }


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

           }

    /* =====================================================
       SIDEBAR CATEGORY LINKS
    ===================================================== */

    const sidebarCategoryItems =
        document.querySelectorAll(
            "[data-sidebar-category]"
        );


    sidebarCategoryItems.forEach(item => {

        item.addEventListener(
            "click",
            event => {

                event.preventDefault();


                const category =
                    item.dataset.sidebarCategory;


                if (!category) {
                    return;
                }


                selectedCategory =
                    category;


                currentPage = 1;


                filterButtons.forEach(button => {

                    button.classList.toggle(
                        "active",
                        button.dataset.category ===
                        selectedCategory
                    );

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

        let categoriesExpanded = false;


        moreCategoriesButton.addEventListener(
            "click",
            () => {

                const list =
                    document.querySelector(
                        ".article-category-list"
                    );


                if (!list) {
                    return;
                }


                const hiddenCategories =
                    categories.filter(category => {

                        return ![
                            "Loans",
                            "Investment",
                            "Tax",
                            "Business",
                            "Health"
                        ].includes(
                            category.name
                        );

                    });


                if (!hiddenCategories.length) {
                    return;
                }


                if (!categoriesExpanded) {

                    hiddenCategories.forEach(
                        category => {

                            const alreadyExists =
                                document.querySelector(
                                    `[data-sidebar-category="${category.name}"]`
                                );


                            if (alreadyExists) {
                                return;
                            }


                            const item =
                                document.createElement(
                                    "a"
                                );


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


                                    currentPage = 1;


                                    filterButtons.forEach(
                                        button => {

                                            button.classList.toggle(
                                                "active",
                                                button.dataset.category ===
                                                selectedCategory
                                            );

                                        }
                                    );


                                    renderArticleCards(
                                        selectedCategory,
                                        searchInput?.value || ""
                                    );

                                }
                            );

                        }
                    );


                    categoriesExpanded = true;


                    moreCategoriesButton.innerHTML = `
                        Fewer Categories
                        <span aria-hidden="true">
                            ⌃
                        </span>
                    `;

                } else {

                    hiddenCategories.forEach(
                        category => {

                            const item =
                                document.querySelector(
                                    `[data-sidebar-category="${category.name}"]`
                                );


                            if (item) {
                                item.remove();
                            }

                        }
                    );


                    categoriesExpanded = false;


                    moreCategoriesButton.innerHTML = `
                        More Categories
                        <span aria-hidden="true">
                            ⌄
                        </span>
                    `;

                }

            }
        );

    }


    /* =====================================================
       POPULAR ARTICLE LINKS
    ===================================================== */

    const popularLinks =
        document.querySelectorAll(
            ".popular-article"
        );


    popularLinks.forEach(link => {

        link.addEventListener(
            "click",
            event => {

                event.preventDefault();

                /*
                 * Article detail routing can be
                 * connected here later.
                 */

            }
        );

    });


    /* =====================================================
       ARTICLE LINKS
    ===================================================== */

    const articleLinks =
        document.querySelectorAll(
            ".article-card a"
        );


    articleLinks.forEach(link => {

        link.addEventListener(
            "click",
            event => {

                event.preventDefault();

                /*
                 * Article detail routing can be
                 * connected here later.
                 */

            }
        );

    });

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
