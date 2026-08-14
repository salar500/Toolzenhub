export function renderLoan(tool) {

    const root = document.querySelector('#inputs');

    if (!root) return;

    root.innerHTML = `
        <section class="loan-calculator">

            <div class="loan-calculator__intro">

                <span class="loan-calculator__eyebrow">
                    Finance Tool
                </span>

                <h1 class="loan-calculator__title">
                    Loan Comparison Calculator
                </h1>

                <p class="loan-calculator__description">
                    Compare two loans by EMI, interest,
                    repayment and potential savings.
                </p>

            </div>


            <div class="loan-calculator__grid">

                ${loanCard('a', 'Loan A', 'Option 1')}

                ${loanCard('b', 'Loan B', 'Option 2')}

            </div>


            <button
                id="compare_btn"
                class="loan-compare-button">

                Compare Loans

            </button>


            <div
                id="loan-result"
                class="loan-result">

                <h2 class="loan-result__title">
                    Comparison Result
                </h2>

                <p>
                    Enter your loan details and compare.
                </p>

            </div>

        </section>
    `;


    function loanCard(prefix, title, badge) {

        return `

            <div class="loan-card">

                <div class="loan-card__header">

                    <h2 class="loan-card__title">
                        ${title}
                    </h2>

                    <span class="loan-card__badge">
                        ${badge}
                    </span>

                </div>


                <div class="loan-field">

                    <label>
                        Loan Amount
                    </label>

                    <div class="loan-amount-row">

                        <input
                            id="${prefix}_value"
                            type="number"
                            min="1"
                            max="100"
                            value="50">

                        <select id="${prefix}_unit">

                            <option value="1000">
                                Thousands
                            </option>

                            <option
                                value="100000"
                                selected>

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
                        id="${prefix}_amount"
                        type="hidden"
                        value="5000000">

                    <input
                        id="${prefix}_amount_slider"
                        class="loan-range"
                        type="range"
                        min="1"
                        max="100"
                        value="50">

                </div>


                <div class="loan-field">

                    <label>
                        Interest Rate (%)
                    </label>

                    <input
                        id="${prefix}_rate"
                        type="number"
                        min="0"
                        max="25"
                        step=".01"
                        value="${prefix === 'a' ? '8.5' : '9'}">

                    <input
                        id="${prefix}_rate_slider"
                        class="loan-range"
                        type="range"
                        min="0"
                        max="25"
                        step=".01"
                        value="${prefix === 'a' ? '8.5' : '9'}">

                </div>


                <div class="loan-field">

                    <label>
                        Tenure (Years)
                    </label>

                    <input
                        id="${prefix}_years"
                        type="number"
                        min="1"
                        max="100"
                        value="20">

                    <input
                        id="${prefix}_years_slider"
                        class="loan-range"
                        type="range"
                        min="1"
                        max="100"
                        value="20">

                </div>

            </div>
        `;
    }


    const money = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    });


    function calculate(principal, rate, years) {

        const months = years * 12;
        const monthlyRate = rate / 12 / 100;

        if (principal <= 0 || years <= 0) {
            return {
                emi: 0,
                interest: 0,
                total: 0
            };
        }

        const emi = monthlyRate === 0
            ? principal / months
            : principal *
              monthlyRate *
              Math.pow(1 + monthlyRate, months) /
              (Math.pow(1 + monthlyRate, months) - 1);

        const total = emi * months;

        return {
            emi,
            total,
            interest: total - principal
        };
    }


    function updateAmount(prefix) {

        const value =
            document.querySelector(`#${prefix}_value`);

        const unit =
            document.querySelector(`#${prefix}_unit`);

        const amount =
            document.querySelector(`#${prefix}_amount`);

        const slider =
            document.querySelector(`#${prefix}_amount_slider`);

        amount.value =
            Number(value.value) *
            Number(unit.value);

        slider.value = value.value;
    }


    function getLoan(prefix) {

        return calculate(
            Number(
                document.querySelector(
                    `#${prefix}_amount`
                ).value
            ),

            Number(
                document.querySelector(
                    `#${prefix}_rate`
                ).value
            ),

            Number(
                document.querySelector(
                    `#${prefix}_years`
                ).value
            )
        );
    }


    function compareLoans() {

        updateAmount('a');
        updateAmount('b');

        const a = getLoan('a');
        const b = getLoan('b');

        const winner =
            a.interest < b.interest
                ? 'Loan A'
                : b.interest < a.interest
                    ? 'Loan B'
                    : 'Both Loans';

        const savings =
            Math.abs(a.interest - b.interest);


        document.querySelector('#loan-result').innerHTML = `

            <h2 class="loan-result__title">
                Comparison Result
            </h2>

            <div class="loan-result__table-wrap">

                <table>

                    <thead>

                        <tr>
                            <th>Metric</th>
                            <th>Loan A</th>
                            <th>Loan B</th>
                        </tr>

                    </thead>

                    <tbody>

                        <tr>
                            <td>Monthly EMI</td>

                            <td class="${
                                a.emi < b.emi
                                    ? 'loan-winner'
                                    : ''
                            }">
                                ${money.format(a.emi)}
                            </td>

                            <td class="${
                                b.emi < a.emi
                                    ? 'loan-winner'
                                    : ''
                            }">
                                ${money.format(b.emi)}
                            </td>
                        </tr>


                        <tr>

                            <td>Total Interest</td>

                            <td class="${
                                a.interest < b.interest
                                    ? 'loan-winner'
                                    : ''
                            }">
                                ${money.format(a.interest)}
                            </td>

                            <td class="${
                                b.interest < a.interest
                                    ? 'loan-winner'
                                    : ''
                            }">
                                ${money.format(b.interest)}
                            </td>

                        </tr>


                        <tr>

                            <td>Total Repayment</td>

                            <td>
                                ${money.format(a.total)}
                            </td>

                            <td>
                                ${money.format(b.total)}
                            </td>

                        </tr>

                    </tbody>

                </table>

            </div>


            <div class="loan-winner-box">

                🏆 <strong>Best Overall:</strong>
                ${winner}

                <br>

                Interest Difference:
                <strong>
                    ${money.format(savings)}
                </strong>

            </div>

        `;
    }


    ['a', 'b'].forEach(prefix => {

        const amountSlider =
            document.querySelector(
                `#${prefix}_amount_slider`
            );

        const value =
            document.querySelector(
                `#${prefix}_value`
            );

        const rate =
            document.querySelector(
                `#${prefix}_rate`
            );

        const rateSlider =
            document.querySelector(
                `#${prefix}_rate_slider`
            );

        const years =
            document.querySelector(
                `#${prefix}_years`
            );

        const yearsSlider =
            document.querySelector(
                `#${prefix}_years_slider`
            );


        amountSlider.addEventListener('input', () => {

            value.value = amountSlider.value;

            compareLoans();

        });


        value.addEventListener('input', compareLoans);


        rate.addEventListener('input', () => {

            rateSlider.value = rate.value;

            compareLoans();

        });


        rateSlider.addEventListener('input', () => {

            rate.value = rateSlider.value;

            compareLoans();

        });


        years.addEventListener('input', () => {

            yearsSlider.value = years.value;

            compareLoans();

        });


        yearsSlider.addEventListener('input', () => {

            years.value = yearsSlider.value;

            compareLoans();

        });


        document.querySelector(
            `#${prefix}_unit`
        ).addEventListener(
            'change',
            compareLoans
        );

    });


    document.querySelector(
        '#compare_btn'
    ).addEventListener(
        'click',
        compareLoans
    );


    compareLoans();
                              }
