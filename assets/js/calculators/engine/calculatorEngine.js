/* =========================================================
   ToolZen Hub
   Calculator Engine
========================================================= */

export function createCalculator(config = {}) {

    const {
        calculate,
        renderInput,
        renderOutput,
        validate
    } = config;


    function run(input) {

        if (typeof validate === "function") {

            const validation =
                validate(input);

            if (!validation.valid) {
                return {
                    success: false,
                    error: validation.error
                };
            }
        }


        if (typeof calculate !== "function") {

            return {
                success: false,
                error: "Calculator formula is not configured."
            };

        }


        const result =
            calculate(input);


        return {
            success: true,
            result
        };

    }


    function render(container, input) {

        if (
            typeof renderInput === "function"
        ) {
            renderInput(
                container,
                input
            );
        }

    }


    function output(container, result) {

        if (
            typeof renderOutput === "function"
        ) {
            renderOutput(
                container,
                result
            );
        }

    }


    return {
        run,
        render,
        output
    };

}
