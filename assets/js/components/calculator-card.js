export function renderCalculatorCard(
    calculator,
    options = {}
) {

    if (!calculator) {
        return "";
    }


    const {
        id,
        icon = "▦",
        title = "Calculator",
        description = "",
        href = "#",
        category = ""
    } = calculator;


    const {
        showCategory = false
    } = options;


    const categoryMarkup =
        showCategory && category
            ? `
                <span class="calculator-card__category">
                    ${category}
                </span>
            `
            : "";


    return `
        <a
            class="calculator-card"
            href="${href}"
            data-calculator-id="${id || ""}"
        >

            ${
                icon
                    ? `
                        <div
                            class="calculator-card__icon"
                            aria-hidden="true"
                        >
                            ${icon}
                        </div>
                    `
                    : ""
            }


            <div class="calculator-card__content">

                ${categoryMarkup}

                <h3 class="calculator-card__title">
                    ${title}
                </h3>

                <p class="calculator-card__description">
                    ${description}
                </p>

            </div>


            <span
                class="calculator-card__arrow"
                aria-hidden="true"
            >
                →
            </span>

        </a>
    `;
}


export function renderCalculatorCards(
    calculators = [],
    options = {}
) {

    if (!Array.isArray(calculators)) {
        return "";
    }


    return calculators
        .map(
            calculator =>
                renderCalculatorCard(
                    calculator,
                    options
                )
        )
        .join("");
}
