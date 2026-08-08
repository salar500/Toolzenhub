/* =========================================================
   ToolZen Hub
   Application Entry
========================================================= */

import { renderHeader } from "./components/header.js";
import { renderHero } from "./components/hero.js";


function initializeApp() {

    renderHeader();

    renderHero();

}


document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);
