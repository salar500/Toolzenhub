/* =========================================================
   ToolZen Hub
   Loan Formulas
========================================================= */


/* =========================================================
   EMI
========================================================= */

export function calculateEMI(
    principal,
    annualRate,
    years
) {

    principal = Number(principal);
    annualRate = Number(annualRate);
    years = Number(years);

    if (
        !Number.isFinite(principal) ||
        !Number.isFinite(annualRate) ||
        !Number.isFinite(years) ||
        principal <= 0 ||
        years <= 0 ||
        annualRate < 0
    ) {
        return 0;
    }

    const months = Math.round(years * 12);
    const monthlyRate = annualRate / 12 / 100;

    if (monthlyRate === 0) {
        return principal / months;
    }

    const factor =
        Math.pow(1 + monthlyRate, months);

    return (
        principal *
        monthlyRate *
        factor /
        (factor - 1)
    );
}


/* =========================================================
   Total Repayment
========================================================= */

export function calculateTotalRepayment(
    principal,
    annualRate,
    years
) {

    const emi =
        calculateEMI(
            principal,
            annualRate,
            years
        );

    const months =
        Math.round(Number(years) * 12);

    return emi * months;
}


/* =========================================================
   Total Interest
========================================================= */

export function calculateTotalInterest(
    principal,
    annualRate,
    years
) {

    const repayment =
        calculateTotalRepayment(
            principal,
            annualRate,
            years
        );

    return Math.max(
        0,
        repayment - Number(principal)
    );
}


/* =========================================================
   Amortization Schedule
========================================================= */

export function calculateAmortization(
    principal,
    annualRate,
    years
) {

    principal = Number(principal);
    annualRate = Number(annualRate);
    years = Number(years);

    if (
        !Number.isFinite(principal) ||
        !Number.isFinite(annualRate) ||
        !Number.isFinite(years) ||
        principal <= 0 ||
        years <= 0 ||
        annualRate < 0
    ) {
        return [];
    }


    const months =
        Math.round(years * 12);


    const monthlyRate =
        annualRate / 12 / 100;


    const emi =
        calculateEMI(
            principal,
            annualRate,
            years
        );


    const schedule = [];


    let balance =
        principal;


    for (
        let month = 1;
        month <= months;
        month++
    ) {

        const interest =
            monthlyRate === 0
                ? 0
                : balance * monthlyRate;


        let principalPaid =
            emi - interest;


        /*
         * Final payment correction.
         *
         * Prevents a tiny floating-point
         * balance from remaining.
         */

        if (month === months) {

            principalPaid =
                balance;

        }


        balance =
            balance - principalPaid;


        schedule.push({

            month,

            emi:
                principalPaid + interest,

            principal:
                principalPaid,

            interest,

            balance:
                Math.max(
                    0,
                    balance
                )

        });

    }


    return schedule;

}
