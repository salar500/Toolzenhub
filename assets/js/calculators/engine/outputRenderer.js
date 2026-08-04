// assets/js/calculators/engine/outputRenderer.js

export function renderOutput(result) {

    const container = document.getElementById("calculator-output");

    container.innerHTML = `

        <div class="result-card">

            ${Object.entries(result).map(([key, value]) => `

                <div class="result-item">

                    <strong>${key}</strong>

                    <span>${value}</span>

                </div>

            `).join("")}

        </div>

    `;

}
