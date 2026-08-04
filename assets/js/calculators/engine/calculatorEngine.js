// assets/js/calculators/engine/calculatorEngine.js

import { renderInputs } from "./inputRenderer.js";
import { validateInputs } from "./validationEngine.js";
import { executeFormula } from "./formulaExecutor.js";
import { renderOutput } from "./outputRenderer.js";

export class CalculatorEngine {

    constructor(schema) {

        this.schema = schema;

        this.values = {};

    }

    init() {

        renderInputs(this.schema.inputs);

        this.bindEvents();

    }

    bindEvents() {

        document.addEventListener("input", (event) => {

            if (!event.target.matches("[data-input]")) return;

            this.values[event.target.name] = Number(event.target.value);

            const validation = validateInputs(
                this.schema.inputs,
                this.values
            );

            if (!validation.valid) return;

            const result = executeFormula(
                this.schema.formula,
                this.values
            );

            renderOutput(result);

        });

    }

}
