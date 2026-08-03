function renderHeader() {
    document.getElementById("header").innerHTML = Components.header;
}

function renderFooter() {
    document.getElementById("footer").innerHTML = Components.footer;
}

function renderCategories(categories) {

    const html = `
        <h2 class="section-title">Browse Categories</h2>

        <div class="grid categories-grid">

            ${categories.map(category => `

                <div class="card">

                    <h3>${category.icon} ${category.title}</h3>

                    <p>${category.description}</p>

                </div>

            `).join("")}

        </div>
    `;

    document.getElementById("categories").innerHTML = html;
}

function renderCalculators(calculators){

    const html=`

        <h2 class="section-title">

            Popular Calculators

        </h2>

        <div class="grid calculator-grid">

            ${calculators.map(calculator=>`

                <div class="card">

                    <h3>

                        ${calculator.title}

                    </h3>

                </div>

            `).join("")}

        </div>

    `;

    document.getElementById("popular-calculators").innerHTML=html;

}

function renderArticles(articles){

    const html=`

        <h2 class="section-title">

            Latest Articles

        </h2>

        <div class="grid article-grid">

            ${articles.map(article=>`

                <div class="card">

                    <h3>${article.title}</h3>

                    <p>${article.date}</p>

                </div>

            `).join("")}

        </div>

    `;

    document.getElementById("latest-articles").innerHTML=html;

}
