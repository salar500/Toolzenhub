// assets/js/calculators/engine/validationEngine.js

export function validateInputs(schema, values) {

    for (const input of schema) {

        const value = values[input.id];

        if (value === undefined) {

            return { valid: false };

        }

        if (input.min !== undefined && value < input.min) {

            return { valid: false };

        }

        if (input.max !== undefined && value > input.max) {

            return { valid: false };

        }

    }

    return { valid: true };

}
