import { renderHeader } from "./components/header.js";
import { renderHero } from "./components/hero.js";
import { renderCategories } from "./components/categories.js";
import { renderArticles } from "./components/articles.js";
import { renderFooter } from "./components/footer.js";


function initializeApp() {

    renderHeader();

    renderHero();

    renderCategories();

    renderArticles();
    renderFooter();

}


document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);
