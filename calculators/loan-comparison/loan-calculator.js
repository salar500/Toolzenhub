/* =========================================================
   ToolZen Hub
   Loan Comparison Calculator
========================================================= */

export function render() {

    const app = document.querySelector("#app");

    if (!app) return;


    /* =====================================================
       CALCULATOR HTML
    ===================================================== */

    app.innerHTML = `

        <section class="loan-calculator">

            <div class="loan-calculator__intro">

                <span class="loan-calculator__eyebrow">
                    Finance Tool
                </span>

                <h1 class="loan-calculator__title">
                    Loan Comparison Calculator
                </h1>

                <p class="loan-calculator__description">
                    Compare two loans by EMI, interest rate,
                    total interest and total repayment.
                </p>

            </div>


            <div class="loan-calculator__grid">


                <!-- ================= LOAN A ================= -->

                <div class="loan-card">

                    <div class="loan-card__header">

                        <h2 class="loan-card__title">
                            Loan A
                        </h2>

                        <span class="loan-card__badge">
                            Option A
                        </span>

                    </div>


                    <div class="loan-field">

                        <label>
                            Loan Amount
                        </label>

                        <div class="loan-amount-row">

                            <select id="a_value">
                                ${createAmountOptions()}
                            </select>

                            <select id="a_unit">

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

                        <input
                            id="a_amount"
                            type="hidden"
                            value="5000000"
                        >

                        <input
                            id="a_amount_slider"
                            class="loan-range"
                            type="range"
                            min="1"
                            max="100"
                            step="1"
                            value="50"
                        >

                    </div>


                    <div class="loan-field">

                        <label for="a_rate">
                            Interest Rate (%)
                        </label>

                        <input
                            id="a_rate"
                            type="number"
                            min="0"
                            max="25"
                            step="0.01"
                            value="8.5"
                        >

                        <input
                            id="a_rate_slider"
                            class="loan-range"
                            type="range"
                            min="0"
                            max="25"
                            step="0.01"
                            value="8.5"
                        >

                    </div>


                    <div class="loan-field">

                        <label for="a_years">
                            Tenure (Years)
                        </label>

                        <input
                            id="a_years"
                            type="number"
                            min="1"
                            max="100"
                            step="1"
                            value="20"
                        >

                        <input
                            id="a_years_slider"
                            class="loan-range"
                            type="range"
                            min="1"
                            max="100"
                            step="1"
                            value="20"
                        >

                    </div>

                </div>



                <!-- ================= LOAN B ================= -->

                <div class="loan-card">

                    <div class="loan-card__header">

                        <h2 class="loan-card__title">
                            Loan B
                        </h2>

                        <span class="loan-card__badge">
                            Option B
                        </span>

                    </div>


                    <div class="loan-field">

                        <label>
                            Loan Amount
                        </label>

                        <div class="loan-amount-row">

                            <select id="b_value">
                                ${createAmountOptions()}
                            </select>

                            <select id="b_unit">

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

                        <input
                            id="b_amount"
                            type="hidden"
                            value="5000000"
                        >

                        <input
                            id="b_amount_slider"
                            class="loan-range"
                            type="range"
                            min="1"
                            max="100"
                            step="1"
                            value="50"
                        >

                    </div>


                    <div class="loan-field">

                        <label for="b_rate">
                            Interest Rate (%)
                        </label>

                        <input
                            id="b_rate"
                            type="number"
                            min="0"
                            max="25"
                            step="0.01"
                            value="9"
                        >

                        <input
                            id="b_rate_slider"
                            class="loan-range"
                            type="range"
                            min="0"
                            max="25"
                            step="0.01"
                            value="9"
                        >

                    </div>


                    <div class="loan-field">

                        <label for="b_years">
                            Tenure (Years)
                        </label>

                        <input
                            id="b_years"
                            type="number"
                            min="1"
                            max="100"
                            step="1"
                            value="20"
                        >

                        <input
                            id="b_years_slider"
                            class="loan-range"
                            type="range"
                            min="1"
                            max="100"
                            step="1"
                            value="20"
                        >

                    </div>

                </div>

            </div>


            <button
                id="compare_btn"
                class="loan-compare-button"
                type="button"
            >
                Compare Loans
            </button>


            <div
                id="loan-result"
                class="loan-result"
            >

                <h2 class="loan-result__title">
                    Loan Comparison
                </h2>

                <div id="comparison-result">
                    Enter your loan details and compare.
                </div>

            </div>

        </section>

    `;


    /* =====================================================
       HELPERS
    ===================================================== */

    const money = new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }
    );


    function createAmountOptions() {

        return Array.from(
            { length: 100 },
            (_, index) => {

                const value = index + 1;

                return `
                    <option value="${value}">
                        ${value}
                    </option>
                `;

            }
        ).join("");

    }


    /* =====================================================
       LOAN CALCULATION
    ===================================================== */

    function calculateLoan(
        principal,
        annualRate,
        years
    ) {

        if (
            principal <= 0 ||
            years <= 0 ||
            annualRate < 0
        ) {

            return {
                emi: 0,
                total: 0,
                interest: 0,
                monthlyInterest: 0,
                schedule: []
            };

        }


        const monthlyRate =
            annualRate / 12 / 100;

        const months =
            years * 12;


        let emi;


        if (monthlyRate === 0) {

            emi =
                principal / months;

        } else {

            const factor =
                Math.pow(
                    1 + monthlyRate,
                    months
                );

            emi =
                principal *
                monthlyRate *
                factor /
                (factor - 1);

        }


        const total =
            emi * months;

        const interest =
            total - principal;


        const schedule = [];

        let balance =
            principal;


        for (
            let month = 1;
            month <= months;
            month++
        ) {

            let interestPaid;
            let principalPaid;


            if (monthlyRate === 0) {

                interestPaid = 0;

                principalPaid =
                    principal / months;

            } else {

                interestPaid =
                    balance * monthlyRate;

                principalPaid =
                    emi - interestPaid;

            }


            balance -= principalPaid;


            schedule.push({

                month,

                emi,

                principal:
                    principalPaid,

                interest:
                    interestPaid,

                balance:
                    Math.max(balance, 0)

            });

        }


        return {

            emi,

            total,

            interest,

            monthlyInterest:
                schedule[0]?.interest || 0,

            schedule

        };

    }


    /* =====================================================
       AMOUNT HELPERS
    ===================================================== */

    function updatePrincipal(prefix) {

        const value =
            document.querySelector(
                `#${prefix}_value`
            );

        const unit =
            document.querySelector(
                `#${prefix}_unit`
            );

        const amount =
            document.querySelector(
                `#${prefix}_amount`
            );

        const slider =
            document.querySelector(
                `#${prefix}_amount_slider`
            );


        const principal =
            Number(value.value) *
            Number(unit.value);


        amount.value =
            principal;


        slider.value =
            value.value;

    }


    function updateDropdown(prefix) {

        const value =
            document.querySelector(
                `#${prefix}_value`
            );

        const unit =
            document.querySelector(
                `#${prefix}_unit`
            );

        const amount =
            document.querySelector(
                `#${prefix}_amount`
            );


        const principal =
            Number(amount.value);


        let selectedUnit =
            100000;


        if (principal >= 10000000) {

            selectedUnit =
                10000000;

        } else if (principal < 100000) {

            selectedUnit =
                1000;

        }


        unit.value =
            selectedUnit;


        let number =
            Math.round(
                principal /
                selectedUnit
            );


        number =
            Math.max(
                1,
                Math.min(100, number)
            );


        value.value =
            number;

    }


    /* =====================================================
       YEAR ANALYSIS
    ===================================================== */

    function renderYearAnalysis(
        principal,
        rate,
        currentYears
    ) {

        const years =
            [
                ...new Set([
                    10,
                    15,
                    20,
                    25,
                    30,
                    currentYears
                ])
            ]
            .sort(
                (a, b) => a - b
            );


        return `

            <div class="loan-result__table-wrap">

                <table>

                    <tr>
                        <th>Years</th>
                        <th>EMI</th>
                        <th>Interest</th>
                        <th>Repayment</th>
                    </tr>

                    ${years.map(year => {

                        const loan =
                            calculateLoan(
                                principal,
                                rate,
                                year
                            );


                        return `

                            <tr>

                                <td>
                                    ${year}
                                </td>

                                <td>
                                    ${money.format(
                                        loan.emi
                                    )}
                                </td>

                                <td>
                                    ${money.format(
                                        loan.interest
                                    )}
                                </td>

                                <td>
                                    ${money.format(
                                        loan.total
                                    )}
                                </td>

                            </tr>

                        `;

                    }).join("")}

                </table>

            </div>

        `;

    }


    /* =====================================================
       AMORTIZATION
    ===================================================== */

    function renderAmortization(
        schedule
    ) {

        return `

            <div class="loan-result__table-wrap">

                <table>

                    <tr>

                        <th>
                            Month
                        </th>

                        <th>
                            Principal
                        </th>

                        <th>
                            Interest
                        </th>

                        <th>
                            Balance
                        </th>

                    </tr>

                    ${schedule
                        .slice(0, 12)
                        .map(row => `

                            <tr>

                                <td>
                                    ${row.month}
                                </td>

                                <td>
                                    ${money.format(
                                        row.principal
                                    )}
                                </td>

                                <td>
                                    ${money.format(
                                        row.interest
                                    )}
                                </td>

                                <td>
                                    ${money.format(
                                        row.balance
                                    )}
                                </td>

                            </tr>

                        `)
                        .join("")}

                </table>

            </div>

        `;

    }


    /* =====================================================
       COMPARISON
    ===================================================== */

    function compareLoans() {

        const aAmount =
            Number(
                document.querySelector(
                    "#a_amount"
                ).value
            );

        const aRate =
            Number(
                document.querySelector(
                    "#a_rate"
                ).value
            );

        const aYears =
            Number(
                document.querySelector(
                    "#a_years"
                ).value
            );


        const bAmount =
            Number(
                document.querySelector(
                    "#b_amount"
                ).value
            );

        const bRate =
            Number(
                document.querySelector(
                    "#b_rate"
                ).value
            );

        const bYears =
            Number(
                document.querySelector(
                    "#b_years"
                ).value
            );


        const output =
            document.querySelector(
                "#comparison-result"
            );


        if (
            aAmount <= 0 ||
            bAmount <= 0 ||
            aRate < 0 ||
            bRate < 0 ||
            aYears <= 0 ||
            bYears <= 0
        ) {

            output.innerHTML = `

                <div class="loan-winner-box">
                    Please enter valid loan details.
                </div>

            `;

            return;

        }


        const loanA =
            calculateLoan(
                aAmount,
                aRate,
                aYears
            );


        const loanB =
            calculateLoan(
                bAmount,
                bRate,
                bYears
            );


        const lowestE
