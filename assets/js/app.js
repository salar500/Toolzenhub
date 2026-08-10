/* =========================================================
   ToolZen Hub
   Application Entry
========================================================= */

import { renderHeader } from "./components/header.js";
import { renderHero } from "./components/hero.js";
import { renderCategories } from "./components/categories.js";



function initializeApp() {

    renderHeader();

    renderHero();

}


document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);
