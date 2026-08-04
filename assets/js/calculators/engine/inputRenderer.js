// assets/js/calculators/engine/inputRenderer.js

export function renderInputs(inputs) {

    const container = document.getElementById("calculator-inputs");

    container.innerHTML = inputs.map(input => `

        <div class="form-group">

            <label>${input.label}</label>

            <input
                type="number"
                name="${input.id}"
                data-input
                min="${input.min ?? ""}"
                max="${input.max ?? ""}"
            >

        </div>

    `).join("");

}
