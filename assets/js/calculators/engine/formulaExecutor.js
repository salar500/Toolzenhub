// assets/js/calculators/engine/formulaExecutor.js

import * as EMI from "../formulas/emi.js";

const formulas = {

    emi: EMI.calculate

};

export function executeFormula(name, values) {

    if (!formulas[name]) {

        throw new Error(`Formula "${name}" not found`);

    }

    return formulas[name](values);

}
