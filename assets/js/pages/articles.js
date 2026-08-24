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
        title: "Best SIP Strategies for 2024",
        description:
            "Top SIP investment strategies to build wealth consistently and achieve your financial goals.",
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
            "Smart tax saving tips and investment options to reduce your taxable income.",
        date: "May 8, 2024",
        readTime: "7 min read",
        image:
            "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80",
        alt: "Tax blocks with coins"
    },

    {
        id: 4,
        category: "Loans",
        title: "Home Loan Tips to Get the Best Deal",
        description:
            "Expert tips to get the lowest interest rate and best home loan offers.",
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
            "Understand the key difference between ROI and Profit and when to use which.",
        date: "May 2, 2024",
        readTime: "4 min read",
        image:
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
        alt: "Laptop analytics screen"
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
             Articles Hero
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


                <div class="articles-hero-illustration"
                     aria-hidden="true">

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
             Articles Main
        =========================================== -->

        <main class="articles-container articles-main">

            <!-- ======================================
                 Category Filters
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
                 Content Layout
            ======================================= -->

            <div class="articles-layout">

                <!-- ==================================
                     Main Feed
                =================================== -->

                <section class="articles-feed">

                    <div
                        id="articles-list"
                        class="articles-list"
                    ></div>


                    <!-- Pagination -->

                    <div
                        class="articles-pagination"
                        aria-label="Articles pagination"
                    >

                        <button
                            type="button"
                            class="pagination-button active"
                        >
                            1
                        </button>

                        <button
                            type="button"
                            class="pagination-button"
                        >
                            2
                        </button>

                        <button
                            type="button"
                            class="pagination-button"
                        >
                            3
                        </button>

                        <span class="pagination-dots">
                            ...
                        </span>

                        <button
                            type="button"
                            class="pagination-button"
                        >
                            12
                        </button>

                        <button
                            type="button"
                            class="pagination-next"
                        >
                            Next
                            <span aria-hidden="true">→</span>
                        </button>

                    </div>

                </section>


                <!-- ==================================
                     Sidebar
                =================================== -->

                <aside class="articles-sidebar">


                    <!-- Search -->

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


                    <!-- Categories -->

                    <div class="article-sidebar-card">

                        <div class="article-sidebar-heading">
                            <h2>Categories</h2>
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
                            <span aria-hidden="true">⌄</span>
                        </button>

                    </div>


                    <!-- Popular Articles -->

                    <div class="article-sidebar-card">

                        <div class="article-sidebar-heading">
                            <h2>Popular Articles</h2>
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


                    <!-- Newsletter -->

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
                article.title.toLowerCase().includes(normalizedSearch) ||
                article.description.toLowerCase().includes(normalizedSearch) ||
                article.category.toLowerCase().includes(normalizedSearch);

            return categoryMatch && searchMatch;

        });


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
                    Try another search term or choose a different category.
                </p>

            </div>

        `;

        return;
    }


    container.innerHTML =
        filteredArticles.map(article => `

            <article class="article-card">

                <a
                    href="#"
                    class="article-card-image-link"
                    aria-label="${article.title}"
                >

                    <img
                        src="${article.image}"
                        alt="${article.alt}"
                        class="article-card-image"
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
                                <span aria-hidden="true">📅</span>
                                ${article.date}
                            </span>

                            <span>
                                <span aria-hidden="true">◷</span>
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
   INTERACTIONS
========================================================= */

function initializeArticleInteractions() {

    let selectedCategory = "All";


    /* ==============================================
       Category Filters
    =============================================== */

    const filterButtons =
        document.querySelectorAll(".article-filter");


    filterButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const category =
                    button.dataset.category;


                if (category === "More") {
                    return;
                }


                selectedCategory = category;


                filterButtons.forEach(item => {
                    item.classList.remove("active");
                });


                button.classList.add("active");


                const searchInput =
                    document.getElementById("article-search");


                renderArticleCards(
                    selectedCategory,
                    searchInput?.value
