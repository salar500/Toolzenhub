/* =========================================================
   ToolZen Hub
   Calculator Search Utility

   Used by:
   - Home Hero Search
   - Categories Page Search

   Purpose:
   Search calculators and tools only.

   This is completely separate from article search.
========================================================= */


/* =========================================================
   CALCULATOR DATA
========================================================= */

const calculators = [

    {
        title: "Loan Comparison",
        description:
            "Compare loans side by side",
        category: "Loans",
        keywords:
            "loan comparison loans interest emi repayment",
        url: "loan-comparison.html"
    },

    {
        title: "EMI Calculator",
        description:
            "Calculate your EMI instantly",
        category: "Loans",
        keywords:
            "emi loan monthly payment interest",
        url: "emi-calculator.html"
    },

    {
        title: "Home Loan Calculator",
        description:
            "Calculate your home loan eligibility",
        category: "Loans",
        keywords:
            "home loan emi housing loan interest",
        url: "home-loan.html"
    },

    {
        title: "Personal Loan Calculator",
        description:
            "Calculate personal loan payments",
        category: "Loans",
        keywords:
            "personal loan emi interest repayment",
        url: "personal-loan.html"
    },

    {
        title: "SIP Calculator",
        description:
            "Plan your SIP investments",
        category: "Investment",
        keywords:
            "sip investment mutual fund returns",
        url: "sip-calculator.html"
    },

    {
        title: "PPF Calculator",
        description:
            "Calculate PPF investment returns",
        category: "Investment",
        keywords:
            "ppf investment returns savings",
        url: "ppf-calculator.html"
    },

    {
        title: "FD Calculator",
        description:
            "Calculate fixed deposit returns",
        category: "Investment",
        keywords:
            "fd fixed deposit investment interest",
        url: "fd-calculator.html"
    },

    {
        title: "CAGR Calculator",
        description:
            "Calculate compound annual growth rate",
        category: "Investment",
        keywords:
            "cagr growth investment return",
        url: "cagr-calculator.html"
    },

    {
        title: "GST Calculator",
        description:
            "Calculate GST easily and accurately",
        category: "Tax",
        keywords:
            "gst tax goods services tax",
        url: "gst-calculator.html"
    },

    {
        title: "Income Tax Calculator",
        description:
            "Estimate your income tax",
        category: "Tax",
        keywords:
            "income tax tax calculation salary",
        url: "income-tax.html"
    },

    {
        title: "BMI Calculator",
        description:
            "Check your body mass index",
        category: "Health",
        keywords:
            "bmi body mass index health weight",
        url: "bmi-calculator.html"
    },

    {
        title: "Calorie Calculator",
        description:
            "Estimate your daily calorie needs",
        category: "Health",
        keywords:
            "calorie calories health diet daily",
        url: "calorie-calculator.html"
    },

    {
        title: "BMR Calculator",
        description:
            "Calculate your basal metabolic rate",
        category: "Health",
        keywords:
            "bmr basal metabolic rate calories",
        url: "bmr-calculator.html"
    },

    {
        title: "Profit Calculator",
        description:
            "Calculate business profit",
        category: "Business",
        keywords:
            "profit business revenue cost",
        url: "profit-calculator.html"
    },

    {
        title: "Margin Calculator",
        description:
            "Calculate profit margin",
        category: "Business",
        keywords:
            "margin profit business percentage",
        url: "margin-calculator.html"
    },

    {
        title: "ROI Calculator",
        description:
            "Calculate return on investment",
        category: "Business",
        keywords:
            "roi return investment business",
        url: "roi-calculator.html"
    },

    {
        title: "Percentage Calculator",
        description:
            "Calculate percentages easily",
        category: "Math",
        keywords:
            "percentage percent maths calculation",
        url: "percentage-calculator.html"
    },

    {
        title: "Ratio Calculator",
        description:
            "Calculate and simplify ratios",
        category: "Math",
        keywords:
            "ratio maths proportion calculation",
        url: "ratio-calculator.html"
    },

    {
        title: "Age Calculator",
        description:
            "Calculate age accurately",
        category: "Math",
        keywords:
            "age date birth calculation",
        url: "age-calculator.html"
    },

    {
        title: "Unit Converter",
        description:
            "Convert common units quickly",
        category: "Converter",
        keywords:
            "unit conversion length weight temperature",
        url: "unit-converter.html"
    },

    {
        title: "Currency Converter",
        description:
            "Convert currencies easily",
        category: "Converter",
        keywords:
            "currency exchange money conversion",
        url: "currency-converter.html"
    },

    {
        title: "Date Calculator",
        description:
            "Calculate dates and date differences",
        category: "Converter",
        keywords:
            "date days calendar difference",
        url: "date-calculator.html"
    }

];


/* =========================================================
   SEARCH CALCULATORS
========================================================= */

export function searchCalculators(query) {

    const search =
        String(query || "")
            .trim()
            .toLowerCase();


    if (!search) {
        return [];
    }


    return calculators.filter(
        (calculator) => {

            const searchableText = [

                calculator.title,

                calculator.description,

                calculator.category,

                calculator.keywords

            ]
                .join(" ")
                .toLowerCase();


            return searchableText.includes(search);

        }
    );

}


/* =========================================================
   GET ALL CALCULATORS
========================================================= */

export function getCalculators() {

    return [...calculators];

}


/* =========================================================
   RENDER SEARCH RESULTS
========================================================= */

export function renderCalculatorSearchResults(
    results,
    container
) {

    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (!results.length) {

        container.innerHTML = `

            <div class="calculator-search-empty">

                No calculators found.

            </div>

        `;

        return;
    }


    const fragment =
        document.createDocumentFragment();


    results.forEach(
        (calculator) => {

            const link =
                document.createElement("a");


            link.href =
                calculator.url;


            link.className =
                "calculator-search-result";


            link.innerHTML = `

                <div class="calculator-search-result__content">

                    <strong>
                        ${calculator.title}
                    </strong>

                    <span>
                        ${calculator.description}
                    </span>

                    <small>
                        ${calculator.category}
                    </small>

                </div>


                <span
                    class="calculator-search-result__arrow"
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
   CLEAR SEARCH RESULTS
========================================================= */

export function clearCalculatorSearchResults(
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

    searchCalculators,

    getCalculators,

    renderCalculatorSearchResults,

    clearCalculatorSearchResults

};
