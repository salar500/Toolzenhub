// ==========================================
// ToolZen Hub - Global Header Component
// ==========================================

export function Header() {
  return `
    <header class="site-header" id="siteHeader">

      <div class="container">

        <nav class="navbar">

          ${Logo()}

          <div class="navbar-right">

            ${DesktopNavigation()}

            ${HeaderActions()}

          </div>

        </nav>

      </div>

      ${MobileDrawer()}

    </header>
  `;
}

// ---------------- Logo ----------------

function Logo() {
  return `
    <a href="/" class="navbar__brand">

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
