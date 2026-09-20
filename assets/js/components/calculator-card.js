export function renderCalculatorCard(calculator) {
    if (!calculator) {
        return "";
    }

    const {
        id,
        icon = "▦",
        title = "Calculator",
        description = "",
        href = "#"
    } = calculator;

    return `
        <a
            class="calculator-card"
            href="${href}"
            data-calculator-id="${id}"
        >
            <div class="calculator-card__icon" aria-hidden="true">
                ${icon}
            </div>

            <div class="calculator-card__content">
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
    calculators = []
) {
    if (!Array.isArray(calculators)) {
        return "";
    }

    return calculators
        .map(renderCalculatorCard)
        .join("");
}
