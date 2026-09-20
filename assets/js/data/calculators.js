import {
    ROUTES
} from "../routes.js";


export const calculators = [

    {
        id: "loan-comparison",
        category: "loans",
        type: "advanced",
        icon: "⚖",
        title: "Loan Comparison Calculator",
        description:
            "Compare two loans by EMI, interest rate, total interest and repayment.",
        href: ROUTES.calculator("loan-comparison")
    },

    {
        id: "emi",
        category: "loans",
        type: "simple",
        icon: "▦",
        title: "EMI Calculator",
        description:
            "Calculate your monthly EMI for any loan amount, interest rate and tenure.",
        href: "emi-calculator.html"
    },

    {
        id: "home-loan",
        category: "loans",
        type: "simple",
        icon: "⌂",
        title: "Home Loan Calculator",
        description:
            "Calculate home loan EMI, interest and total repayment.",
        href: "home-loan-calculator.html"
    },

    {
        id: "personal-loan",
        category: "loans",
        type: "simple",
        icon: "♙",
        title: "Personal Loan Calculator",
        description:
            "Calculate EMI and total repayment for a personal loan.",
        href: "personal-loan-calculator.html"
    },

    {
        id: "loan-eligibility",
        category: "loans",
        type: "simple",
        icon: "▤",
        title: "Loan Eligibility Calculator",
        description:
            "Estimate your eligibility for different types of loans.",
        href: "loan-eligibility-calculator.html"
    },

    {
        id: "balance-transfer",
        category: "loans",
        type: "simple",
        icon: "⟳",
        title: "Balance Transfer Calculator",
        description:
            "Estimate potential savings from transferring your existing loan.",
        href: "balance-transfer-calculator.html"
    },

    {
        id: "interest",
        category: "loans",
        type: "simple",
        icon: "%",
        title: "Interest Calculator",
        description:
            "Calculate simple and compound interest on your investment or loan.",
        href: "interest-calculator.html"
    },

    {
        id: "prepayment",
        category: "loans",
        type: "simple",
        icon: "₹",
        title: "Prepayment Calculator",
        description:
            "Estimate interest savings from making a partial loan prepayment.",
        href: "prepayment-calculator.html"
    }

];


export function getCalculatorsByCategory(
    categoryId
) {
    return calculators.filter(
        calculator =>
            calculator.category === categoryId
    );
}


export function getCalculatorById(
    calculatorId
) {
    return calculators.find(
        calculator =>
            calculator.id === calculatorId
    );
}
