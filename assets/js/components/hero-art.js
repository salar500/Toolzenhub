/* =========================================================
   ToolZen Hub
   Home hero illustration

   Original, inline SVG: no image file, no network request. It shows what the site is: a workspace with an ecosystem sidebar on the left
   (the Calculators list, EMI selected) and the EMI Calculator on the right with a sample result, and a tile for each of the other kinds
   of tool around it (time, developer, image, PDF, practice labs). The figures are a sample (10,00,000 at 8.5% over 20 years), not a claim.
   It is decorative (the heading says what the site is), so it is hidden from assistive technology.
========================================================= */

export function heroArt() {

    return `<svg class="hero-art" viewBox="0 0 600 460" role="presentation" aria-hidden="true" focusable="false" font-family="Inter, system-ui, -apple-system, 'Segoe UI', sans-serif">

        <defs>
            <linearGradient id="hero-art-glow" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#f1edfb"/>
                <stop offset="1" stop-color="#e6dffa"/>
            </linearGradient>
        </defs>

        <!-- soft backdrop and a few dots -->
        <ellipse cx="300" cy="232" rx="288" ry="208" fill="url(#hero-art-glow)"/>
        <g fill="#d5c9f3">
            <circle cx="96" cy="58" r="3"/><circle cx="114" cy="58" r="3"/><circle cx="132" cy="58" r="3"/>
            <circle cx="96" cy="76" r="3"/><circle cx="114" cy="76" r="3"/><circle cx="132" cy="76" r="3"/>
            <circle cx="486" cy="410" r="3"/><circle cx="504" cy="410" r="3"/><circle cx="522" cy="410" r="3"/>
            <circle cx="486" cy="428" r="3"/><circle cx="504" cy="428" r="3"/><circle cx="522" cy="428" r="3"/>
        </g>

        <!-- the workspace window -->
        <g>
            <rect x="70" y="82" width="440" height="318" rx="20" fill="#d5c9f3" opacity="0.45"/>
            <rect x="70" y="72" width="440" height="318" rx="20" fill="#ffffff" stroke="#e1e5ec" stroke-width="2"/>
            <path d="M70 92a20 20 0 0 1 20-20h400a20 20 0 0 1 20 20v14H70z" fill="#edeff4"/>
            <circle cx="92" cy="89" r="5" fill="#d3d9e4"/><circle cx="110" cy="89" r="5" fill="#d3d9e4"/><circle cx="128" cy="89" r="5" fill="#d3d9e4"/>

            <!-- sidebar: the Calculators list, a group open, EMI selected -->
            <rect x="84" y="118" width="130" height="260" rx="12" fill="#f6f4ee" stroke="#e1e5ec"/>
            <text x="98" y="140" font-size="9" font-weight="700" letter-spacing="0.8" fill="#475269">LOANS</text>
            <text x="196" y="141" font-size="12" font-weight="600" fill="#6b7690" text-anchor="end">&#8722;</text>
            <rect x="92" y="150" width="114" height="26" rx="8" fill="#e6dffa"/>
            <rect x="92" y="150" width="4" height="26" rx="2" fill="#7656c9"/>
            <text x="106" y="167" font-size="11" font-weight="700" fill="#6446b8">EMI Calculator</text>
            <text x="106" y="193" font-size="11" fill="#475269">Home Loan</text>
            <text x="106" y="215" font-size="11" fill="#475269">Personal Loan</text>
            <text x="106" y="237" font-size="11" fill="#475269">Loan Comparison</text>
            <line x1="98" y1="250" x2="202" y2="250" stroke="#e1e5ec"/>
            <text x="98" y="270" font-size="9" font-weight="700" letter-spacing="0.8" fill="#475269">INVESTMENT</text>
            <text x="196" y="271" font-size="12" font-weight="600" fill="#6b7690" text-anchor="end">+</text>
            <text x="98" y="298" font-size="9" font-weight="700" letter-spacing="0.8" fill="#475269">TAX</text>
            <text x="196" y="299" font-size="12" font-weight="600" fill="#6b7690" text-anchor="end">+</text>
            <text x="98" y="326" font-size="9" font-weight="700" letter-spacing="0.8" fill="#475269">HEALTH</text>
            <text x="196" y="327" font-size="12" font-weight="600" fill="#6b7690" text-anchor="end">+</text>
            <text x="98" y="354" font-size="9" font-weight="700" letter-spacing="0.8" fill="#475269">BUSINESS</text>
            <text x="196" y="355" font-size="12" font-weight="600" fill="#6b7690" text-anchor="end">+</text>

            <!-- workspace: the EMI Calculator -->
            <rect x="226" y="118" width="272" height="260" rx="12" fill="#ffffff" stroke="#e1e5ec"/>
            <text x="242" y="146" font-size="15" font-weight="800" fill="#202c45">EMI Calculator</text>
            <rect x="242" y="154" width="22" height="3" rx="1.5" fill="#7656c9"/>

            <text x="242" y="182" font-size="9" font-weight="600" fill="#6b7690">Loan amount</text>
            <rect x="242" y="188" width="118" height="30" rx="8" fill="#ffffff" stroke="#d3d9e4" stroke-width="1.5"/>
            <text x="254" y="208" font-size="11.5" font-weight="600" fill="#202c45">10,00,000</text>
            <text x="348" y="208" font-size="11" fill="#6b7690" text-anchor="end">&#8377;</text>
            <text x="372" y="182" font-size="9" font-weight="600" fill="#6b7690">Interest rate</text>
            <rect x="372" y="188" width="114" height="30" rx="8" fill="#ffffff" stroke="#d3d9e4" stroke-width="1.5"/>
            <text x="384" y="208" font-size="11.5" font-weight="600" fill="#202c45">8.5</text>
            <text x="474" y="208" font-size="11" fill="#6b7690" text-anchor="end">%</text>

            <rect x="242" y="232" width="118" height="5" rx="2.5" fill="#e1e5ec"/>
            <rect x="242" y="232" width="52" height="5" rx="2.5" fill="#7656c9"/>
            <circle cx="294" cy="234.5" r="7" fill="#ffffff" stroke="#7656c9" stroke-width="3"/>
            <rect x="372" y="232" width="114" height="5" rx="2.5" fill="#e1e5ec"/>
            <rect x="372" y="232" width="48" height="5" rx="2.5" fill="#7656c9"/>
            <circle cx="420" cy="234.5" r="7" fill="#ffffff" stroke="#7656c9" stroke-width="3"/>

            <!-- result -->
            <rect x="242" y="256" width="244" height="104" rx="12" fill="#f1edfb"/>
            <text x="258" y="278" font-size="9.5" font-weight="600" fill="#8467d2">Monthly EMI</text>
            <text x="258" y="310" font-size="26" font-weight="800" fill="#6446b8">&#8377;8,678</text>
            <circle cx="258" cy="332" r="4" fill="#7656c9"/>
            <text x="268" y="335.5" font-size="9" fill="#475269">Principal</text>
            <circle cx="322" cy="332" r="4" fill="#bba8f6"/>
            <text x="332" y="335.5" font-size="9" fill="#475269">Interest</text>
            <g transform="translate(436 308)">
                <circle r="28" fill="none" stroke="#bba8f6" stroke-width="11"/>
                <circle r="28" fill="none" stroke="#7656c9" stroke-width="11" stroke-dasharray="84 92" transform="rotate(-90)"/>
            </g>
        </g>

        <!-- tiles around it: time, developer, image, PDF, practice labs -->
        <g>
            <g transform="translate(22 128)">
                <rect width="64" height="64" rx="16" fill="#ffffff" stroke="#e1e5ec" stroke-width="2"/>
                <circle cx="32" cy="32" r="15" fill="none" stroke="#7656c9" stroke-width="3"/>
                <path d="M32 22v10l7 5" fill="none" stroke="#7656c9" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
            <g transform="translate(508 70)">
                <rect width="64" height="64" rx="16" fill="#202c45"/>
                <path d="M25 24l-10 8 10 8M39 24l10 8-10 8M35 20l-6 24" fill="none" stroke="#bba8f6" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
            <g transform="translate(520 214)">
                <rect width="64" height="64" rx="16" fill="#ffffff" stroke="#e1e5ec" stroke-width="2"/>
                <rect x="14" y="16" width="36" height="32" rx="5" fill="none" stroke="#7656c9" stroke-width="3"/>
                <circle cx="25" cy="27" r="3.5" fill="#7656c9"/>
                <path d="M16 44l11-10 8 7 6-5 9 8" fill="none" stroke="#7656c9" stroke-width="3" stroke-linejoin="round"/>
            </g>
            <g transform="translate(28 276)">
                <rect width="64" height="64" rx="16" fill="#ffffff" stroke="#e1e5ec" stroke-width="2"/>
                <path d="M21 14h16l8 8v28H21z" fill="none" stroke="#7656c9" stroke-width="3" stroke-linejoin="round"/>
                <path d="M37 14v8h8M27 33h14M27 40h14" fill="none" stroke="#7656c9" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
            <g transform="translate(250 372)">
                <rect width="64" height="64" rx="16" fill="#7656c9"/>
                <path d="M27 16h10M29 16v12l-9 16a4 4 0 0 0 3.5 6h17a4 4 0 0 0 3.5-6L35 28V16" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M25 42h14" stroke="#bba8f6" stroke-width="3" stroke-linecap="round"/>
            </g>
        </g>

    </svg>`;

}
