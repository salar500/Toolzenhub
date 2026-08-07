
import { loadJSON } from "../services/dataService.js";

export async function renderHeader() {

    const nav = await loadJSON("data/navigation.json");

    const menu = nav.map(item => `
        <li>
            <a class="navbar__link"
               href="${item.url}">
               ${item.title}
            </a>
        </li>
    `).join("");

    return `

<header class="site-header">

<div class="container">

<nav class="navbar">

<a href="/" class="navbar__brand">

<div class="brand-logo">
🧮
</div>

<div class="brand-text">

<span class="brand-title">

ToolZen Hub

</span>

<span class="brand-subtitle">

Smart Tools • Smarter Decisions

</span>

</div>

</a>

<ul class="navbar__menu">

${menu}

</ul>

<div class="navbar__actions">

<button class="btn btn-outline btn-sm">

Search

</button>

<button class="btn btn-primary btn-sm menu-toggle">

☰

</button>

</div>

</nav>

</div>

</header>

`;

}
