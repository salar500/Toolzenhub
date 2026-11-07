/* =========================================================
   ToolZen Hub
   Sidebar or drawer: one definition, used by the style sheet and the scripts

   The ecosystem navigation is a persistent left sidebar only where there is genuinely room for it, and a left drawer everywhere else.
   "Room" is decided by the real screen, not by the browser's Desktop site setting or its user agent:

   - the layout width is at least 1000 px, AND
   - the device has a fine pointer (a mouse or trackpad), OR a screen that is itself at least 1000 px wide.

   A phone with "Desktop site" turned on reports a layout width of about 980 to 1280 px, but its screen is a phone's (about 360 to 430 px
   wide) and its pointer is a finger, so it gets the drawer, not a cramped two-column page. A narrow window, a phone in the normal mode, a
   portrait tablet and a small landscape phone get the drawer by width alone. A desktop or laptop window, and a tablet in landscape that
   is at least 1000 px wide, get the sidebar.

   The same two lists of conditions are written in assets/css/components/section-switcher.css. Keep them in step.
========================================================= */

export const WIDE = "(min-width: 1000px) and (pointer: fine), (min-width: 1000px) and (min-device-width: 1000px)";

/**
 * How much larger the drawer is drawn when the page is laid out much wider than the screen showing it (a phone in Desktop site mode,
 * where the whole page is shown zoomed out). 1 everywhere else. Pure given the numbers.
 */
export function drawerZoom(layoutWidth, screenWidth, wide) {

    if (wide || !(layoutWidth > 0) || !(screenWidth > 0) || screenWidth >= layoutWidth) {
        return 1;
    }

    return Math.min(4, Math.round((layoutWidth / screenWidth) * 100) / 100);

}
