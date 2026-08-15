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

    if (
        principal <= 0 ||
        years <= 0 ||
        annualRate < 0
    ) {
        return 0;
    }


    const monthlyRate =
        annualRate / 12 / 100;

    const months =
        years * 12;


    /* Zero-interest loan */

    if (monthlyRate === 0) {

        return principal / months;

    }


    const factor =
        Math.pow(
            1 + monthlyRate,
            months
        );


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


    return emi * years * 12;

}


/* =========================================================
   Total Interest
========================================================= */

export function calculateTotalInterest(
    principal,
    annualRate,
    years
) {

    const total =
        calculateTotalRepayment(
            principal,
            annualRate,
            years
        );


    return total - principal;

}


/* =========================================================
   Amortization Schedule
========================================================= */

export function calculateAmortization(
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
        years * 12;

    const monthlyRate =
        annualRate / 12 / 100;


    const schedule = [];

    let balance =
        principal;


    for (
        let month = 1;
        month <= months;
        month++
    ) {

        let interest;

        let principalPaid;


        if (monthlyRate === 0) {

            interest = 0;

            principalPaid =
                principal / months;

        } else {

            interest =
                balance * monthlyRate;

            principalPaid =
                emi - interest;

        }


        balance -= principalPaid;


        schedule.push({

            month,

            emi,

            principal:
                principalPaid,

            interest,

            balance:
                Math.max(
                    balance,
                    0
                )

        });

    }


    return schedule;

}
