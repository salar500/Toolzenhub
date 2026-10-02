/* =========================================================
   ToolZen Hub
   Article Interactions

   The only behaviour an article page needs from script: the
   table of contents marks the link you clicked. Everything
   else on an article page is static HTML from the site build.
========================================================= */

let interactionsBound = false;

export function bindArticleInteractions() {

    if (interactionsBound) {
        return;
    }

    interactionsBound = true;

    document.addEventListener(
    "click",
    event => {

        const link =
            event.target.closest(
                ".article-toc a"
            );


        if (!link) {
            return;
        }


        const links =
            document.querySelectorAll(
                ".article-toc a"
            );


        links.forEach(item => {

            item.classList.remove(
                "is-active"
            );

        });


        link.classList.add(
            "is-active"
        );

    }
    );

}
