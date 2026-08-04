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

}                                Smart Tools, Smarter You
                            </small>

                        </div>

                    </a>

                    <ul class="navbar__menu">

                        ${menu}

                    </ul>

                    <div class="navbar__actions">

                        <button id="searchButton">🔍</button>

                        <button id="menuButton">☰</button>

                    </div>

                </nav>

            </div>

        </header>
    `;
}    <a href="/" class="navbar__brand">

      <div class="brand-icon">
        🧮
      </div>

      <div class="brand-text">

        <h1>ToolZen Hub</h1>

        <span>Smart Tools, Smarter You</span>

      </div>

    </a>
  `;
}

// -------------- Desktop Nav ------------

function DesktopNavigation() {

  return `

    <ul class="navbar__menu" id="desktopMenu"></ul>

  `;

}

// -------------- Actions ------------

function HeaderActions() {

  return `

    <div class="navbar__actions">

      <button
          class="icon-button"
          id="searchButton"
          aria-label="Search">

          🔍

      </button>

      <button
          class="icon-button"
          id="menuButton"
          aria-label="Open Menu">

          ☰

      </button>

    </div>

  `;

}

// ------------ Mobile Drawer ------------

function MobileDrawer() {

  return `

    <aside class="mobile-menu" id="mobileMenu">

        <div class="mobile-menu__content">

            <ul id="mobileNavigation"></ul>

        </div>

    </aside>

  `;

}
