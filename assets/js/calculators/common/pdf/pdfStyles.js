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
     * Extremely light watermark.
     *
     * The watermark is intentionally subtle so
     * it remains visible without competing with
     * report content.
     */
    watermark: [224, 229, 236],

    /*
     * Professional repeating header line.
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

    /*
     * Large watermark.
     */
    watermark: 38,

    /*
     * Repeating page header.
     */
    pageHeader: 8,

    pageHeaderTitle: 10

};


/* =========================================================
   DIAGONAL WATERMARK
========================================================= */

export const PDF_WATERMARK = {

    text:
        "TOOLZEN HUB",

    /*
     * Diagonal angle.
     */
    angle:
        35,

    /*
     * Large enough to cross the central
     * portion of an A4 page.
     */
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
     * Enabled for pages after page 1.
     */
    enabled:
        true,

    /*
     * Small brand line.
     */
    top:
        10,

    /*
     * Report title.
     */
    titleY:
        16,

    /*
     * Report subtitle.
     */
    subtitleY:
        22,

    /*
     * Separator line.
     */
    lineY:
        27,

    /*
     * Table must start below the header.
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
