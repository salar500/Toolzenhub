/* =========================================================
   ToolZen Hub
   Page ready

   A page whose content is built in the browser (home, categories,
   all calculators, Loans, the articles listing) is generated with
   <html data-pending>. Its footer is already in the HTML, so the
   stylesheet keeps the footer out of the layout until the content
   exists; otherwise the content would arrive above the footer and
   push it down (a layout shift). The page script calls this when it
   has rendered.
========================================================= */

export function markPageReady() {

    document.documentElement.removeAttribute(
        "data-pending"
    );

}
