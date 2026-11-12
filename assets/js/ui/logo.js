/* =========================================================
   ToolZen Hub
   The logo mark, in one place

   A rounded dark tile holding three white tiles (the tools) and a tilted indigo tile where the fourth would be (the "zen" accent).
   Equal margins and gaps so it holds together at 16 px; the tile carries its own background, so it reads on light and dark pages.
   The header, the footer and /favicon.svg draw the same geometry: change it here and in favicon.svg together.
========================================================= */

export function logoMark({ background = "#202c45" } = {}) {

    return `<svg viewBox="0 0 100 100" focusable="false">
                            <rect width="100" height="100" rx="24" fill="${background}"/>
                            <g fill="#fff">
                                <rect x="18" y="18" width="28" height="28" rx="7"/>
                                <rect x="18" y="54" width="28" height="28" rx="7"/>
                                <rect x="54" y="54" width="28" height="28" rx="7"/>
                            </g>
                            <rect x="58" y="22" width="20" height="20" rx="4.5" transform="rotate(45 68 32)" fill="#bba8f6"/>
                        </svg>`;

}
