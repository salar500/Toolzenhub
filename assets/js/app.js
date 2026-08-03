document.addEventListener("DOMContentLoaded", async () => {

    renderHeader();

    renderFooter();

    const categories = await loadJSON("data/categories.json");

    const calculators = await loadJSON("data/calculators.json");

    const articles = await loadJSON("data/articles.json");

    renderCategories(categories);

    renderCalculators(calculators);

    renderArticles(articles);

});
