import { renderHeader } from "./components/header.js";
import { renderHero } from "./components/hero.js";
import { renderCategories } from "./components/categories.js";
import { renderArticles } from "./components/articles.js";


function initializeApp() {

    renderHeader();

    renderHero();

    renderCategories();

    renderArticles();

}


document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);
