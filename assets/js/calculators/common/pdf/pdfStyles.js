/* =========================================================
   ToolZen Hub
   Global PDF Styles
========================================================= */


/* =========================================================
   PAGE
========================================================= */

export const PDF_PAGE = {

    width: 210,

    height: 297,

    margin: 15

};


/* =========================================================
   COLORS
========================================================= */

export const PDF_COLORS = {

    primary: [37, 99, 235],

    dark: [15, 23, 42],

    gray: [100, 116, 139],

    light: [248, 250, 252],

    border: [226, 232, 240],

    white: [255, 255, 255],

    /*
     * Very light watermark.
     *
     * The watermark is intentionally subtle.
     */
    watermark: [226, 232, 240],

    /*
     * Professional repeating page header.
     */
    headerLine: [226, 232, 240]

};


/* =========================================================
   FONTS
========================================================= */

export const PDF_FONTS = {

    title: 20,

    subtitle: 10,

    heading: 13,

    body: 9,

    small: 8,

    watermark: 34,

    pageHeader: 8,

    pageHeaderTitle: 10

};


/* =========================================================
   WATERMARK
========================================================= */

export const PDF_WATERMARK = {

    text:
        "TOOLZEN HUB",

    /*
     * Diagonal direction.
     */
    angle:
        35,

    fontSize:
        PDF_FONTS.watermark,

    color:
        PDF_COLORS.watermark

};


/* =========================================================
   REPEATING PAGE HEADER
========================================================= */

export const PDF_HEADER = {

    /*
     * Header is only shown on pages after
     * the first report page.
     */
    enabled:
        true,

    top:
        10,

    titleY:
        16,

    subtitleY:
        22,

    lineY:
        27,

    /*
     * Space reserved above tables.
     */
    tableTop:
        32

};


/* =========================================================
   FOOTER
========================================================= */

export const PDF_FOOTER = {

    offset:
        10

};
