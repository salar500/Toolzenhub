/* =========================================================
   ToolZen Hub
   Global Footer Component
========================================================= */

export function renderFooter() {

    const footer = document.getElementById("footer");

    if (!footer) {
        return;
    }


    footer.innerHTML = `

        <footer class="footer">


            <!-- ==========================================
                 Footer Features
            =========================================== -->

            <div class="footer__features">

                <div class="container">

                    <div class="footer__features-grid">


                        <!-- Accurate -->

                        <div class="footer__feature">

                            <div class="footer__feature-icon">
                                ◎
                            </div>

                            <div class="footer__feature-content">

                                <h3 class="footer__feature-title">
                                    Accurate
                                </h3>

                                <p class="footer__feature-text">
                                    Trusted Calculations
                                </p>

                            </div>

                        </div>


                        <!-- Fast -->

                        <div class="footer__feature">

                            <div class="footer__feature-icon">
                                ⚡
                            </div>

                            <div class="footer__feature-content">

                                <h3 class="footer__feature-title">
                                    Fast
                                </h3>

                                <p class="footer__feature-text">
                                    Instant Results
                                </p>

                            </div>

                        </div>


                        <!-- Free -->

                        <div class="footer__feature">

                            <div class="footer__feature-icon">
                                ✓
                            </div>

                            <div class="footer__feature-content">

                                <h3 class="footer__feature-title">
                                    Free
                                </h3>

                                <p class="footer__feature-text">
                                    100% Free Forever
                                </p>

                            </div>

                        </div>


                        <!-- Mobile Friendly -->

                        <div class="footer__feature">

                            <div class="footer__feature-icon">
                                ▣
                            </div>

                            <div class="footer__feature-content">

                                <h3 class="footer__feature-title">
                                    Mobile Friendly
                                </h3>

                                <p class="footer__feature-text">
                                    Works on All Devices
                                </p>

                            </div>

                        </div>


                        <!-- Secure -->

                        <div class="footer__feature">

                            <div class="footer__feature-icon">
                                🔒
                            </div>

                            <div class="footer__feature-content">

                                <h3 class="footer__feature-title">
                                    Secure
                                </h3>

                                <p class="footer__feature-text">
                                    Your Data Stays Safe
                                </p>

                            </div>

                        </div>


                    </div>

                </div>

            </div>


            <!-- ==========================================
                 Main Footer
            =========================================== -->

            <div class="footer__main">

                <div class="container">

                    <div class="footer__main-grid">


                        <!-- ==================================
                             Brand
                        =================================== -->

                        <div class="footer__brand">

                            <a
                                href="#"
                                class="footer__logo"
                            >

                                <span class="footer__logo-mark">
                                    ▦
                                </span>

                                <span>
                                    ToolZen
                                    <span class="footer__logo-highlight">
                                        Hub
                                    </span>
                                </span>

                            </a>


                            <p class="footer__description">

                                Smart, simple and reliable calculators
                                for finance, health, business and
                                everyday life.

                            </p>


                            <div class="footer__social">

                                <a
                                    href="#"
                                    class="footer__social-link"
                                    aria-label="Facebook"
                                >
                                    f
                                </a>

                                <a
                                    href="#"
                                    class="footer__social-link"
                                    aria-label="Twitter"
                                >
                                    𝕏
                                </a>

                                <a
                                    href="#"
                                    class="footer__social-link"
                                    aria-label="Instagram"
                                >
                                    ◎
                                </a>

                                <a
                                    href="#"
                                    class="footer__social-link"
                                    aria-label="LinkedIn"
                                >
                                    in
                                </a>

                            </div>

                        </div>


                        <!-- ==================================
                             Quick Links
                        =================================== -->

                        <div class="footer__column">

                            <h3 class="footer__column-title">
                                Quick Links
                            </h3>

                            <ul class="footer__links">

                                <li>
                                    <a href="#">
                                        Home
                                    </a>
                                </li>

                                <li>
                                    <a href="#">
                                        Categories
                                    </a>
                                </li>

                                <li>
                                    <a href="#">
                                        Articles
                                    </a>
                                </li>

                                <li>
                                    <a href="#">
                                        About
                                    </a>
                                </li>

                            </ul>

                        </div>


                        <!-- ==================================
                             Resources
                        =================================== -->

                        <div class="footer__column">

                            <h3 class="footer__column-title">
                                Resources
                            </h3>

                            <ul class="footer__links">

                                <li>
                                    <a href="#">
                                        Contact Us
                                    </a>
                                </li>

                                <li>
                                    <a href="#">
                                        Privacy Policy
                                    </a>
                                </li>

                                <li>
                                    <a href="#">
                                        Terms & Conditions
                                    </a>
                                </li>

                                <li>
                                    <a href="#">
                                        Disclaimer
                                    </a>
                                </li>

                            </ul>

                        </div>


                        <!-- ==================================
                             Popular Calculators
                        =================================== -->

                        <div class="footer__column">

                            <h3 class="footer__column-title">
                                Popular Calculators
                            </h3>

                            <ul class="footer__links">

                                <li>
                                    <a href="#">
                                        EMI Calculator
                                    </a>
                                </li>

                                <li>
                                    <a href="#">
                                        Loan Comparison
                                    </a>
                                </li>

                                <li>
                                    <a href="#">
                                        SIP Calculator
                                    </a>
                                </li>

                                <li>
                                    <a href="#">
                                        GST Calculator
                                    </a>
                                </li>

                            </ul>

                        </div>


                        <!-- ==================================
                             Newsletter
                        =================================== -->

                        <div class="footer__newsletter">

                            <h3 class="footer__column-title">
                                Subscribe to our newsletter
                            </h3>


                            <p class="footer__newsletter-text">

                                Get updates, useful tips and new
                                calculators directly in your inbox.

                            </p>


                            <form class="footer__newsletter-form">

                                <input
                                    type="email"
                                    class="footer__newsletter-input"
                                    placeholder="Enter your email"
                                    aria-label="Email address"
                                >


                                <button
                                    type="submit"
                                    class="footer__newsletter-button"
                                >
                                    Subscribe
                                </button>

                            </form>

                        </div>


                    </div>

                </div>

            </div>


            <!-- ==========================================
                 Footer Bottom
            =========================================== -->

            <div class="footer__bottom">

                <div class="container">

                    <div class="footer__bottom-inner">


                        <p class="footer__copyright">

                            © 2026 ToolZen Hub. All rights reserved.

                        </p>


                        <nav
                            class="footer__legal"
                            aria-label="Legal"
                        >

                            <a href="#">
                                Privacy Policy
                            </a>

                            <a href="#">
                                Terms
                            </a>

                            <a href="#">
                                Disclaimer
                            </a>

                        </nav>


                    </div>

                </div>

            </div>


        </footer>
    `;
}
