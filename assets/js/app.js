/* =========================================================
   ToolZen Hub
   Application Entry
========================================================= */

import { renderHeader } from "./components/header.js";
import { renderHero } from "./components/hero.js";
import { renderCategories } from "./components/categories.js";


/* =========================================================
   Application Initialization
========================================================= */

function initializeApp() {

    /* Header */
    renderHeader();


    /* Hero */
    renderHero();


    /* Categories + Popular Calculators */
    renderCategories();

}


/* =========================================================
   DOM Ready
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);
