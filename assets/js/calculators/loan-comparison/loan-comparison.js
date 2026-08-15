/* =========================================================
   ToolZen Hub
   Loan Comparison Calculator
========================================================= */

import {
    calculateEMI,
    calculateTotalRepayment,
    calculateTotalInterest,
    calculateAmortization
} from "../formulas/loan.js";

import {
    formatINR,
    formatPercent
} from "../common/formatter.js";


/* =========================================================
   MAIN RENDER
========================================================= */

export function render() {

    const app = document.querySelector("#app");

    if (!app) {
        return;
    }

    app.innerHTML = `

        <div class="calculator-page">

            <!-- =========================================
                 BREADCRUMB
            ========================================== -->

            <div class="calculator-breadcrumb">

                <a href="/Toolzenhub/">
                    Home
                </a>

                <span>›</span>

                <a href="/Toolzenhub/loans/">
                    Loans
                </a>

                <span>›</span>

                <strong>
                    Loan Comparison Calculator
                </strong>

            </div>


            <!-- =========================================
                 PAGE INTRO
            ========================================== -->

            <section class="calculator-intro">

                <div>

                    <span class="calculator-eyebrow">
                        Finance Tool
                    </span>

                    <h1>
                        Loan Comparison Calculator
                    </h1>

                    <p>
                        Compare two loans by EMI, interest rate,
                        total interest and total repayment.
                    </p>

                </div>

                <div class="calculator-trust-card">

                    <div class="calculator-trust-icon">
                        ✓
                    </div>

                    <div>

                        <strong>
                            100% Free to Use
                        </strong>

                        <span>
                            No sign-up required • Instant results
                        </span>

                    </div>

                </div>

            </section>


            <!-- =========================================
                 CALCULATOR
            ========================================== -->

            <section class="loan-comparison-tool">

                <div class="loan-comparison-grid">

                    ${createLoanCard(
                        "a",
                        "Loan A",
                        "Option A",
                        8.5
                    )}

                    <div class="loan-vs">
                        VS
                    </div>

                    ${createLoanCard(
                        "b",
                        "Loan B",
                        "Option B",
                        9
                    )}

                </div>


                <div class="loan-actions">

                    <button
                        id="compare-loans"
                        class="loan-primary-button"
                        type="button"
                    >
                        Compare Loans
                    </button>

                    <button
                        id="reset-loans"
                        class="loan-reset-button"
                        type="button"
                    >
                        ↻ Reset
                    </button>

                </div>

            </section>


            <!-- =========================================
                 RESULTS
            ========================================== -->

            <section
                id="comparison-result"
                class="loan-results"
            ></section>


            <!-- =========================================
                 HOW TO USE
            ========================================== -->

            ${renderHowToUse()}


            <!-- =========================================
                 WHY COMPARE
            ========================================== -->

            ${renderWhyCompare()}


            <!-- =========================================
                 HOW IT WORKS
            ========================================== -->

            ${renderHowItWorks()}


            <!-- =========================================
                 EXAMPLE
            ========================================== -->

            ${renderExample()}


            <!-- =========================================
                 CONSIDERATIONS + FAQ
            ========================================== -->

            <div class="loan-info-grid">

                ${renderThingsToConsider()}

                ${renderFAQ()}

            </div>


            <!-- =========================================
                 RELATED CALCULATORS
            ========================================== -->

            ${renderRelatedCalculators()}


            <!-- =========================================
                 RELATED ARTICLES
            ========================================== -->

            ${renderRelatedArticles()}

        </div>

    `;


    initializeLoanInputs();

    document
        .querySelector("#compare-loans")
        ?.addEventListener(
            "click",
            compareLoans
        );


    document
        .querySelector("#reset-loans")
        ?.addEventListener(
            "click",
            resetLoans
        );


    compareLoans();

}


/* =========================================================
   LOAN CARD
========================================================= */

function createLoanCard(
    prefix,
    title,
    badge,
    rate
) {

    return `

        <article class="loan-card">

            <div class="loan-card-header">

                <div>

                    <h2>
                        ${title}
                    </h2>

                    <span class="loan-badge">
                        ${badge}
                    </span>

                </div>

            </div>


            <!-- Loan Amount -->

            <div class="loan-field">

                <label>
                    Loan Amount
                </label>

                <div class="loan-input-row">

                    <select
                        id="${prefix}-amount"
                    >

                        ${createAmountOptions()}

                    </select>

                    <select
                        id="${prefix}-unit"
                    >

                        <option value="1000">
                            Thousands
                        </option>

                        <option
                            value="100000"
                            selected
                        >
                            Lakhs
                        </option>

                        <option value="10000000">
                            Crores
                        </option>

                        <option value="1000000">
                            Millions
                        </option>

                    </select>

                </div>

                <div class="loan-slider-row">

                    <input
                        id="${prefix}-amount-slider"
                        type="range"
                        min="1"
                        max="100"
                        value="50"
                    >

                </div>

                <small id="${prefix}-amount-display">
                    ₹50,00,000
                </small>

            </div>


            <!-- Interest Rate -->

            <div class="loan-field">

                <label>
                    Interest Rate (% p.a.)
                </label>

                <div class="loan-number-input">

                    <input
                        id="${prefix}-rate"
                        type="number"
                        min="0"
                        max="25"
                        step="0.01"
                        value="${rate}"
                    >

                    <span>%</span>

                </div>

                <input
                    id="${prefix}-rate-slider"
                    class="loan-slider"
                    type="range"
                    min="0"
                    max="25"
                    step="0.01"
                    value="${rate}"
                >

                <div class="loan-range-labels">

                    <span>0</span>
                    <span>25</span>

                </div>

            </div>


            <!-- Tenure -->

            <div class="loan-field">

                <label>
                    Tenure (Years)
                </label>

                <input
                    id="${prefix}-years"
                    class="loan-years-input"
                    type="number"
                    min="1"
                    max="100"
                    value="20"
                >

                <input
                    id="${prefix}-years-slider"
                    class="loan-slider"
                    type="range"
                    min="1"
                    max="100"
                    value="20"
                >

                <div class="loan-range-labels">

                    <span>1</span>
                    <span>100</span>

                </div>

            </div>

        </article>

    `;

}


/* =========================================================
   AMOUNT OPTIONS
========================================================= */

function createAmountOptions() {

    return Array.from(
        { length: 100 },
        (_, index) => {

            const value = index + 1;

            return `
                <option
                    value="${value}"
                    ${value === 50 ? "selected" : ""}
                >
                    ${value}
                </option>
            `;

        }
    ).join("");

}


/* =========================================================
   INPUT INITIALIZATION
========================================================= */

function initializeLoanInputs() {

    ["a", "b"].forEach(prefix => {

        const amount =
            document.querySelector(
                `#${prefix}-amount`
            );

        const unit =
            document.querySelector(
                `#${prefix}-unit`
            );

        const amountSlider =
            document.querySelector(
                `#${prefix}-amount-slider`
            );

        const rate =
            document.querySelector(
                `#${prefix}-rate`
            );

        const rateSlider =
            document.querySelector(
                `#${prefix}-rate-slider`
            );

        const years =
            document.querySelector(
                `#${prefix}-years`
            );

        const yearsSlider =
            document.querySelector(
                `#${prefix}-years-slider`
            );


        /* Amount */

        amountSlider.addEventListener(
            "input",
            () => {

                amount.value =
                    amountSlider.value;

                updateAmountDisplay(prefix);

                compareLoans();

            }
        );


        amount.addEventListener(
            "change",
            () => {

                amountSlider.value =
                    amount.value;

                updateAmountDisplay(prefix);

                compareLoans();

            }
        );


        unit.addEventListener(
            "change",
            () => {

                updateAmountDisplay(prefix);

                compareLoans();

            }
        );


        /* Interest */

        rateSlider.addEventListener(
            "input",
            () => {

                rate.value =
                    rateSlider.value;

                compareLoans();

            }
        );


        rate.addEventListener(
            "input",
            () => {

                rateSlider.value =
                    rate.value;

                compareLoans();

            }
        );


        /* Tenure */

        yearsSlider.addEventListener(
            "input",
            () => {

                years.value =
                    yearsSlider.value;

                compareLoans();

            }
        );


        years.addEventListener(
            "input",
            () => {

                yearsSlider.value =
                    years.value;

                compareLoans();

            }
        );


        updateAmountDisplay(prefix);

    });

}


/* =========================================================
   AMOUNT DISPLAY
========================================================= */

function updateAmountDisplay(prefix) {

    const amount =
        Number(
            document.querySelector(
                `#${prefix}-amount`
            ).value
        );

    const unit =
        Number(
            document.querySelector(
                `#${prefix}-unit`
            ).value
        );

    const display =
        document.querySelector(
            `#${prefix}-amount-display`
        );

    if (!display) {
        return;
    }

    display.textContent =
        formatINR(amount * unit);

}


/* =========================================================
   GET LOAN DATA
========================================================= */

function getLoanData(prefix) {

    const amount =
        Number(
            document.querySelector(
                `#${prefix}-amount`
            ).value
        );

    const unit =
        Number(
            document.querySelector(
                `#${prefix}-unit`
            ).value
        );

    const rate =
        Number(
            document.querySelector(
                `#${prefix}-rate`
            ).value
        );

    const years =
        Number(
            document.querySelector(
                `#${prefix}-years`
            ).value
        );


    return {

        principal: amount * unit,

        rate,

        years

    };

}


/* =========================================================
   COMPARE
========================================================= */

function compareLoans() {

    const loanA =
        getLoanData("a");

    const loanB =
        getLoanData("b");


    const emiA =
        calculateEMI(
            loanA.principal,
            loanA.rate,
            loanA.years
        );

    const emiB =
        calculateEMI(
            loanB.principal,
            loanB.rate,
            loanB.years
        );


    const interestA =
        calculateTotalInterest(
            loanA.principal,
            loanA.rate,
            loanA.years
        );

    const interestB =
        calculateTotalInterest(
            loanB.principal,
            loanB.rate,
            loanB.years
        );


    const repaymentA =
        calculateTotalRepayment(
            loanA.principal,
            loanA.rate,
            loanA.years
        );

    const repaymentB =
        calculateTotalRepayment(
            loanB.principal,
            loanB.rate,
            loanB.years
        );


    const winner =
        interestA < interestB
            ? "Loan A"
            : interestB < interestA
                ? "Loan B"
                : "Both Loans";


    const savings =
        Math.abs(
            interestA - interestB
        );


    const result =
        document.querySelector(
            "#comparison-result"
        );


    result.innerHTML = `

        <div class="loan-summary-grid">


            <!-- Winner -->

            <div class="loan-summary-card loan-summary-winner">

                <div class="loan-summary-icon">
                    🏆
                </div>

                <span>
                    Lower Interest Cost
                </span>

                <strong>
                    ${winner}
                </strong>

                <small>
                    Saves ${formatINR(savings)} in interest
                </small>

            </div>


            <!-- EMI -->

            <div class="loan-summary-card">

                <span>
                    EMI (Monthly)
                </span>

                <div class="loan-summary-values">

                    <div>

                        <small>
                            Loan A
                        </small>

                        <strong>
                            ${formatINR(emiA)}
                        </strong>

                    </div>

                    <div>

                        <small>
                            Loan B
                        </small>

                        <strong>
                            ${formatINR(emiB)}
                        </strong>

                    </div>

                </div>

            </div>


            <!-- Interest -->

            <div class="loan-summary-card">

                <span>
                    Total Interest
                </span>

                <div class="loan-summary-values">

                    <div>

                        <small>
                            Loan A
                        </small>

                        <strong>
                            ${formatINR(interestA)}
                        </strong>

                    </div>

                    <div>

                        <small>
                            Loan B
                        </small>

                        <strong>
                            ${formatINR(interestB)}
                        </strong>

                    </div>

                </div>

            </div>


            <!-- Repayment -->

            <div class="loan-summary-card">

                <span>
                    Total Repayment
                </span>

                <div class="loan-summary-values">

                    <div>

                        <small>
                            Loan A
                        </small>

                        <strong>
                            ${formatINR(repaymentA)}
                        </strong>

                    </div>

                    <div>

                        <small>
                            Loan B
                        </small>

                        <strong>
                            ${formatINR(repaymentB)}
                        </strong>

                    </div>

                </div>

            </div>


            <!-- Difference -->

            <div class="loan-summary-card">

                <span>
                    Interest Difference
                </span>

                <strong class="loan-saving-value">
                    ${formatINR(savings)}
                </strong>

                <small>
                    Potential interest saving
                </small>

            </div>

        </div>


        <!-- =========================================
             AMORTIZATION
        ========================================== -->

        <div class="loan-amortization-grid">

            <div class="loan-content-card">

                <h3>
                    First 12 Months — Loan A
                </h3>

                ${renderAmortization(
                    calculateAmortization(
                        loanA.principal,
                        loanA.rate,
                        loanA.years
                    )
                )}

            </div>


            <div class="loan-content-card">

                <h3>
                    First 12 Months — Loan B
                </h3>

                ${renderAmortization(

                   calculateAmortization(
                        loanB.principal,
                        loanB.rate,
                        loanB.years
                    )
                )}

            </div>

        </div>

        <p class="loan-disclaimer">
            Figures are approximate and for illustration purposes.
            Actual loan costs may vary depending on lender terms,
            fees, taxes and other charges.
        </p>

    `;

}


/* =========================================================
   RESET
========================================================= */

function resetLoans() {

    document.querySelector("#a-amount").value = 50;
    document.querySelector("#a-unit").value = 100000;
    document.querySelector("#a-rate").value = 8.5;
    document.querySelector("#a-rate-slider").value = 8.5;
    document.querySelector("#a-years").value = 20;
    document.querySelector("#a-years-slider").value = 20;
    document.querySelector("#a-amount-slider").value = 50;


    document.querySelector("#b-amount").value = 50;
    document.querySelector("#b-unit").value = 100000;
    document.querySelector("#b-rate").value = 9;
    document.querySelector("#b-rate-slider").value = 9;
    document.querySelector("#b-years").value = 20;
    document.querySelector("#b-years-slider").value = 20;
    document.querySelector("#b-amount-slider").value = 50;


    updateAmountDisplay("a");
    updateAmountDisplay("b");

    compareLoans();

}


/* =========================================================
   AMORTIZATION TABLE
========================================================= */

function renderAmortization(schedule) {

    return `

        <div class="loan-table-scroll">

            <table class="loan-amortization-table">

                <thead>

                    <tr>

                        <th>Month</th>
                        <th>Principal</th>
                        <th>Interest</th>
                        <th>Balance</th>

                    </tr>

                </thead>

                <tbody>

                    ${schedule
                        .slice(0, 12)
                        .map(row => `

                            <tr>

                                <td>
                                    ${row.month}
                                </td>

                                <td>
                                    ${formatINR(row.principal)}
                                </td>

                                <td>
                                    ${formatINR(row.interest)}
                                </td>

                                <td>
                                    ${formatINR(row.balance)}
                                </td>

                            </tr>

                        `)
                        .join("")}

                </tbody>

            </table>

        </div>

        <button
            type="button"
            class="loan-view-link"
        >
            View Full Amortization Schedule →
        </button>

    `;

}


/* =========================================================
   HOW TO USE
========================================================= */

function renderHowToUse() {

    return `

        <section class="loan-info-card">

            <div class="loan-info-icon">
                🧮
            </div>

            <div>

                <h2>
                    How to Use This Calculator
                </h2>

                <ol>

                    <li>
                        Enter the loan details for Loan A.
                    </li>

                    <li>
                        Enter the loan details for Loan B.
                    </li>

                    <li>
                        Click <strong>Compare Loans</strong>.
                    </li>

                    <li>
                        Review EMI, interest and repayment
                        before choosing an option.
                    </li>

                </ol>

            </div>

        </section>

    `;

}


/* =========================================================
   WHY COMPARE
========================================================= */

function renderWhyCompare() {

    return `

        <section class="loan-info-card">

            <div class="loan-info-icon">
                ⚖️
            </div>

            <div>

                <h2>
                    Why Compare Loans?
                </h2>

                <p>
                    Two loans can have similar EMIs but very
                    different total costs. This calculator helps
                    you compare the important numbers side by side.
                </p>

                <div class="loan-check-list">

                    <span>✓ Monthly EMI</span>
                    <span>✓ Interest Rate</span>
                    <span>✓ Total Interest</span>
                    <span>✓ Total Repayment</span>
                    <span>✓ Loan Tenure</span>

                </div>

            </div>

        </section>

    `;

}


/* =========================================================
   HOW IT WORKS
========================================================= */

function renderHowItWorks() {

    return `

        <section class="loan-info-card">

            <div class="loan-info-icon">
                🧮
            </div>

            <div>

                <h2>
                    How Does Loan Comparison Work?
                </h2>

                <p>
                    We calculate the EMI for each loan using the
                    loan amount, annual interest rate and tenure.
                </p>

                <ul>

                    <li>
                        Total Repayment = EMI × Number of Payments
                    </li>

                    <li>
                        Total Interest = Total Repayment − Principal
                    </li>

                </ul>

            </div>

        </section>

    `;

}


/* =========================================================
   EXAMPLE
========================================================= */

function renderExample() {

    return `

        <section class="loan-info-card loan-example-card">

            <div class="loan-info-icon">
                ₹
            </div>

            <div>

                <h2>
                    Example
                </h2>

                <p>
                    Suppose you compare two ₹50 lakh loans
                    for 20 years.
                </p>

                <div class="loan-example-grid">

                    <div>
                        <strong>Loan A</strong>
                        <span>8.5%</span>
                    </div>

                    <div>
                        <strong>Loan B</strong>
                        <span>9%</span>
                    </div>

                </div>

                <p>
                    If Loan A has the lower total interest,
                    it may be the cheaper option overall.
                </p>

            </div>

        </section>

    `;

}


/* =========================================================
   THINGS TO CONSIDER
========================================================= */

function renderThingsToConsider() {

    return `

        <section class="loan-content-card">

            <h2>
                💡 Things to Consider
            </h2>

            <ul class="loan-consider-list">

                <li>
                    Don't compare using EMI alone.
                </li>

                <li>
                    Check total interest and repayment.
                </li>

                <li>
                    Consider processing fees and other charges.
                </li>

                <li>
                    Check prepayment and foreclosure charges.
                </li>

                <li>
                    Understand fixed vs floating interest rates.
                </li>

                <li>
                    Choose a tenure that fits your financial goals.
                </li>

            </ul>

        </section>

    `;

}


/* =========================================================
   FAQ
========================================================= */

function renderFAQ() {

    return `

        <section class="loan-content-card">

            <h2>
                ❓ FAQs
            </h2>

            <details>
                <summary>
                    What is a loan comparison calculator?
                </summary>

                <p>
                    It compares two loans using EMI, interest,
                    repayment and tenure.
                </p>

            </details>


            <details>
                <summary>
                    Is a lower EMI always better?
                </summary>

                <p>
                    No. A lower EMI can result from a longer
                    tenure and may lead to higher total interest.
                </p>

            </details>


            <details>
                <summary>
                    Should I compare interest rate or EMI?
                </summary>

                <p>
                    Compare both, along with total interest,
                    repayment and fees.
                </p>

            </details>


            <details>
                <summary>
                    Can I compare loans with different tenures?
                </summary>

                <p>
                    Yes. The calculator can compare different
                    interest rates and loan periods.
                </p>

            </details>

        </section>

    `;

}


/* =========================================================
   RELATED CALCULATORS
========================================================= */

function renderRelatedCalculators() {

    const calculators = [

        {
            icon: "▦",
            title: "EMI Calculator",
            description: "Calculate your monthly loan EMI.",
            href: "/Toolzenhub/calculators/emi/"
        },

        {
            icon: "⌂",
            title: "Home Loan Calculator",
            description: "Calculate home loan EMI and interest.",
            href: "/Toolzenhub/calculators/home-loan/"
        },

        {
            icon: "♙",
            title: "Personal Loan Calculator",
            description: "Calculate personal loan payments.",
            href: "/Toolzenhub/calculators/personal-loan/"
        },

        {
            icon: "▤",
            title: "Loan Eligibility Calculator",
            description: "Check how much loan you may qualify for.",
            href: "/Toolzenhub/calculators/loan-eligibility/"
        },

        {
            icon: "₹",
            title: "Prepayment Calculator",
            description: "Estimate savings from prepayment.",
            href: "/Toolzenhub/calculators/prepayment/"
        },

        {
            icon: "%",
            title: "Interest Calculator",
            description: "Calculate simple and compound interest.",
            href: "/Toolzenhub/calculators/interest/"
        }

    ];


    return `

        <section class="loan-related-section">

            <div class="loan-section-heading">

                <h2>
                    Related Calculators
                </h2>

                <a href="/Toolzenhub/calculators/">
                    View all →
                </a>

            </div>


            <div class="loan-related-grid">

                ${calculators.map(item => `

                    <a
                        href="${item.href}"
                        class="loan-related-card"
                    >

                        <div class="loan-related-icon">
                            ${item.icon}
                        </div>

                        <div>

                            <strong>
                                ${item.title}
                            </strong>

                            <span>
                                ${item.description}
                            </span>

                        </div>

                    </a>

                `).join("")}

            </div>

        </section>

    `;

}


/* =========================================================
   RELATED ARTICLES
========================================================= */

function renderRelatedArticles() {

    const articles = [

        {
            title:
                "How to Reduce Your Home Loan Interest",

            description:
                "Practical ways to reduce your overall borrowing cost."
        },

        {
            title:
                "EMI vs Total Interest: What Should You Compare?",

            description:
                "Why EMI alone doesn't tell the complete story."
        },

        {
            title:
                "Fixed vs Floating Interest Rates",

            description:
                "Understand the difference before choosing a loan."
        },

        {
            title:
                "How Loan Tenure Affects Total Interest",

            description:
                "See why a longer tenure can increase borrowing cost."
        },

        {
            title:
                "What Is Loan Prepayment?",

            description:
                "Understand how prepayment can reduce interest."
        },

        {
            title:
                "How to Choose the Right Loan Tenure",

            description:
                "Balance monthly affordability with total cost."
        }

    ];


    return `

        <section class="loan-related-section">

            <div class="loan-section-heading">

                <h2>
                    Related Articles
                </h2>

                <a href="/Toolzenhub/articles/">
                    View all →
                </a>

            </div>


            <div class="loan-articles-grid">

                ${articles.map(article => `

                    <article class="loan-article-card">

                        <div class="loan-article-image">
                            Finance
                        </div>

                        <div class="loan-article-content">

                            <h3>
                                ${article.title}
                            </h3>

                            <p>
                                ${article.description}
                            </p>

                        </div>

                    </article>

                `).join("")}

            </div>

        </section>

    `;

       }
         
