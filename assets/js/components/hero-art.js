/* =========================================================
   ToolZen Hub
   Home hero illustration

   Original, inline SVG: no image file, no network request. It shows what the site is: a workspace with a tools sidebar on the left and
   a calculator on the right, with a tile for each of the other kinds of tool around it (time, developer, image, PDF, practice).
   It is decorative (the heading says what the site is), so it is hidden from assistive technology.
========================================================= */

export function heroArt() {

    return `<svg class="hero-art" viewBox="0 0 560 430" role="presentation" aria-hidden="true" focusable="false">

        <ellipse cx="290" cy="215" rx="250" ry="190" fill="#eef2ff"/>

        <!-- the workspace window -->
        <g>
            <rect x="70" y="60" width="400" height="290" rx="20" fill="#ffffff" stroke="#e7e5e4" stroke-width="2"/>
            <path d="M70 80a20 20 0 0 1 20-20h360a20 20 0 0 1 20 20v22H70z" fill="#f5f5f4"/>
            <circle cx="92" cy="81" r="5" fill="#d6d3d1"/><circle cx="110" cy="81" r="5" fill="#d6d3d1"/><circle cx="128" cy="81" r="5" fill="#d6d3d1"/>

            <!-- sidebar: groups and tools -->
            <rect x="84" y="116" width="118" height="220" rx="12" fill="#fafaf9" stroke="#e7e5e4"/>
            <rect x="96" y="130" width="52" height="7" rx="3.5" fill="#a8a29e"/>
            <rect x="96" y="150" width="94" height="10" rx="5" fill="#d6d3d1"/>
            <rect x="92" y="170" width="102" height="26" rx="8" fill="#e0e7ff"/>
            <rect x="92" y="170" width="4" height="26" rx="2" fill="#4338ca"/>
            <rect x="106" y="179" width="72" height="8" rx="4" fill="#4338ca"/>
            <rect x="106" y="207" width="64" height="8" rx="4" fill="#d6d3d1"/>
            <rect x="106" y="227" width="78" height="8" rx="4" fill="#d6d3d1"/>
            <rect x="96" y="252" width="46" height="7" rx="3.5" fill="#a8a29e"/>
            <rect x="106" y="272" width="70" height="8" rx="4" fill="#d6d3d1"/>
            <rect x="106" y="292" width="58" height="8" rx="4" fill="#d6d3d1"/>
            <rect x="106" y="312" width="74" height="8" rx="4" fill="#d6d3d1"/>

            <!-- workspace: a calculator -->
            <rect x="216" y="116" width="240" height="220" rx="12" fill="#ffffff" stroke="#e7e5e4"/>
            <rect x="232" y="132" width="110" height="12" rx="6" fill="#1c1917"/>
            <rect x="232" y="154" width="170" height="7" rx="3.5" fill="#d6d3d1"/>

            <rect x="232" y="176" width="98" height="34" rx="9" fill="#ffffff" stroke="#d6d3d1" stroke-width="1.5"/>
            <rect x="244" y="190" width="44" height="7" rx="3.5" fill="#a8a29e"/>
            <rect x="340" y="176" width="100" height="34" rx="9" fill="#ffffff" stroke="#d6d3d1" stroke-width="1.5"/>
            <rect x="352" y="190" width="30" height="7" rx="3.5" fill="#a8a29e"/>

            <rect x="232" y="224" width="98" height="6" rx="3" fill="#e7e5e4"/>
            <rect x="232" y="224" width="58" height="6" rx="3" fill="#4338ca"/>
            <circle cx="290" cy="227" r="7" fill="#ffffff" stroke="#4338ca" stroke-width="3"/>

            <!-- result -->
            <rect x="232" y="248" width="208" height="74" rx="12" fill="#eef2ff"/>
            <rect x="246" y="262" width="64" height="7" rx="3.5" fill="#6366f1"/>
            <rect x="246" y="278" width="96" height="16" rx="5" fill="#4338ca"/>
            <g fill="#a5b4fc">
                <rect x="372" y="290" width="12" height="20" rx="3"/>
                <rect x="390" y="280" width="12" height="30" rx="3"/>
                <rect x="408" y="268" width="12" height="42" rx="3" fill="#4338ca"/>
            </g>
        </g>

        <!-- tiles around it: time, developer, image, PDF, practice -->
        <g>
            <g transform="translate(24 120)">
                <rect width="64" height="64" rx="16" fill="#ffffff" stroke="#e7e5e4" stroke-width="2"/>
                <circle cx="32" cy="32" r="15" fill="none" stroke="#4338ca" stroke-width="3"/>
                <path d="M32 22v10l7 5" fill="none" stroke="#4338ca" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
            <g transform="translate(470 96)">
                <rect width="64" height="64" rx="16" fill="#1c1917"/>
                <path d="M25 24l-10 8 10 8M39 24l10 8-10 8M35 20l-6 24" fill="none" stroke="#a5b4fc" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
            <g transform="translate(486 224)">
                <rect width="64" height="64" rx="16" fill="#ffffff" stroke="#e7e5e4" stroke-width="2"/>
                <rect x="14" y="16" width="36" height="32" rx="5" fill="none" stroke="#4338ca" stroke-width="3"/>
                <circle cx="25" cy="27" r="3.5" fill="#4338ca"/>
                <path d="M16 44l11-10 8 7 6-5 9 8" fill="none" stroke="#4338ca" stroke-width="3" stroke-linejoin="round"/>
            </g>
            <g transform="translate(40 268)">
                <rect width="64" height="64" rx="16" fill="#ffffff" stroke="#e7e5e4" stroke-width="2"/>
                <path d="M21 14h16l8 8v28H21z" fill="none" stroke="#4338ca" stroke-width="3" stroke-linejoin="round"/>
                <path d="M37 14v8h8M27 33h14M27 40h14" fill="none" stroke="#4338ca" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
            <g transform="translate(236 340)">
                <rect width="64" height="64" rx="16" fill="#4338ca"/>
                <path d="M27 16h10M29 16v12l-9 16a4 4 0 0 0 3.5 6h17a4 4 0 0 0 3.5-6L35 28V16" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M25 42h14" stroke="#a5b4fc" stroke-width="3" stroke-linecap="round"/>
            </g>
        </g>

    </svg>`;

}
