import {
    aboutFeatures,
    aboutOfferings
} from "./about-data.js";


function renderBreadcrumb() {

    return `

        <nav
            class="about-breadcrumb"
            aria-label="Breadcrumb"
        >

            <a href="/">
                Home
            </a>

            <span aria-hidden="true">
                &gt;
            </span>

            <span>
                About
            </span>

        </nav>

    `;
}


function renderHero() {

    return `

        <section class="about-intro">

            <div class="about-container">

                ${renderBreadcrumb()}

                <div class="about-intro-content">

                    <h1>
                        About ToolZen Hub
                    </h1>

                    <p>
                        ToolZen Hub is your one-stop destination for
                        100+ free online calculators and useful tools.
                        Our mission is to make calculations simple,
                        fast and accurate for everyone.
                    </p>

                </div>

            </div>

        </section>

    `;
}


function renderFeatures() {

    return `

        <section class="about-features-section">

            <div class="about-container">

                <div class="about-features">

                    ${aboutFeatures.map(feature => `

                        <article class="about-feature-card">

                            <div class="about-feature-icon">

                                ${feature.icon}

                            </div>

                            <h2>
                                ${feature.title}
                            </h2>

                            <p>
                                ${feature.description}
                            </p>

                        </article>

                    `).join("")}

                </div>

            </div>

        </section>

    `;
}


function renderOfferSection() {

    return `

        <section class="about-offer-section">

            <div class="about-container">

                <div class="about-offer-card">

                    <div class="about-section-heading">

                        <h2>
                            What We Offer
                        </h2>

                        <p>
                            Explore a growing collection of practical
                            tools designed to make everyday calculations
                            easier.
                        </p>

                    </div>


                    <ul class="about-offer-list">

                        ${aboutOfferings.map(item => `

                            <li>
                                <span
                                    class="about-offer-bullet"
                                    aria-hidden="true"
                                >
                                    ✓
                                </span>

                                <span>
                                    ${item}
                                </span>
                            </li>

                        `).join("")}

                    </ul>


                    <div class="about-offer-action">

                        <a
                            href="/"
                            class="about-primary-button"
                        >
                            Explore Calculators
                        </a>

                    </div>

                </div>

            </div>

        </section>

    `;
}


export function renderAboutTemplate() {

    return `

        <div id="about-page">

            ${renderHero()}

            ${renderFeatures()}

            ${renderOfferSection()}

        </div>

    `;
}
