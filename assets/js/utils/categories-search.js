/* =========================================================
   ToolZen Hub
   Calculator Search Utility

   Used by:
   - Home Hero Search
   - Categories Page Search

   Purpose:
   Search calculators only.
========================================================= */


/* =========================================================
   CALCULATOR DATA
========================================================= */

const calculators = [

    {
        name: "Loan Comparison",
        description: "Compare loans side by side",
        category: "Loans",
        keywords: "loan comparison loans interest emi",
        url: "#"
    },

    {
        name: "EMI Calculator",
        description: "Calculate your EMI instantly",
        category: "Loans",
        keywords: "emi loan monthly payment interest",
        url: "#"
    },

    {
        name: "Home Loan Calculator",
        description: "Calculate your home loan eligibility",
        category: "Loans",
        keywords: "home loan housing loan mortgage emi",
        url: "#"
    },

    {
        name: "Personal Loan Calculator",
        description: "Calculate personal loan EMI",
        category: "Loans",
        keywords: "personal loan emi repayment interest",
        url: "#"
    },

    {
        name: "SIP Calculator",
        description: "Plan your SIP investments",
        category: "Investment",
        keywords: "sip investment mutual fund returns",
        url: "#"
    },

    {
        name: "PPF Calculator",
        description: "Calculate PPF investment and maturity",
        category: "Investment",
        keywords: "ppf investment savings maturity",
        url: "#"
    },

    {
        name: "FD Calculator",
        description: "Calculate fixed deposit returns",
        category: "Investment",
        keywords: "fd fixed deposit interest investment",
        url: "#"
    },

    {
        name: "CAGR Calculator",
        description: "Calculate compound annual growth rate",
        category: "Investment",
        keywords: "cagr growth investment return",
        url: "#"
    },

    {
        name: "GST Calculator",
        description: "Calculate GST easily and accurately",
        category: "Tax",
        keywords: "gst tax goods services tax",
        url: "#"
    },

    {
        name: "Income Tax Calculator",
        description: "Estimate your income tax",
        category: "Tax",
        keywords: "income tax salary tax calculation",
        url: "#"
    },

    {
        name: "BMI Calculator",
        description: "Check your body mass index",
        category: "Health",
        keywords: "bmi body mass index weight health",
        url: "#"
    },

    {
        name: "Calorie Calculator",
        description: "Estimate your daily calorie needs",
        category: "Health",
        keywords: "calorie calories diet nutrition health",
        url: "#"
    },

    {
        name: "BMR Calculator",
        description: "Calculate your basal metabolic rate",
        category: "Health",
        keywords: "bmr metabolism calories health",
        url: "#"
    },

    {
        name: "Percentage Calculator",
        description: "Calculate percentages quickly",
        category: "Math",
        keywords: "percentage percent maths calculation",
        url: "#"
    },

    {
        name: "Ratio Calculator",
        description: "Calculate and simplify ratios",
        category: "Math",
        keywords: "ratio maths calculation",
        url: "#"
    },

    {
        name: "Age Calculator",
        description: "Calculate your exact age",
        category: "Math",
        keywords: "age date birth calculation",
        url: "#"
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

                calculator.name,

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
   RENDER CALCULATOR RESULTS
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
                        ${calculator.name}
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
