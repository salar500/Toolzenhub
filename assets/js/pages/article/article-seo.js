/* =========================================================
   ToolZen Hub
   Article SEO

   Purpose:
   Shared SEO engine for every individual article.

   Handles:
   - Page title
   - Meta description
   - Canonical URL
   - Open Graph
   - Twitter metadata
   - Article structured data
   - FAQ structured data

   No visual UI changes.
========================================================= */


/* =========================================================
   Site Information
========================================================= */

const SITE_NAME =
    "ToolZen Hub";


const SITE_URL =
    "https://salar500.github.io/Toolzenhub/";


const SITE_LOGO =
    `${SITE_URL}favicon.svg`;



/* =========================================================
   Set Meta Tag
========================================================= */

function setMeta(
    attribute,
    value,
    content
) {

    if (!content) {

        return;

    }


    let meta =
        document.head.querySelector(
            `meta[${attribute}="${value}"]`
        );


    if (!meta) {

        meta =
            document.createElement(
                "meta"
            );


        meta.setAttribute(
            attribute,
            value
        );


        document.head.appendChild(
            meta
        );

    }


    meta.setAttribute(
        "content",
        content
    );

}



/* =========================================================
   Set Link Tag
========================================================= */

function setLink(
    rel,
    href
) {

    let link =
        document.head.querySelector(
            `link[rel="${rel}"]`
        );


    if (!link) {

        link =
            document.createElement(
                "link"
            );


        link.setAttribute(
            "rel",
            rel
        );


        document.head.appendChild(
            link
        );

    }


    link.setAttribute(
        "href",
        href
    );

}



/* =========================================================
   Get Canonical URL
========================================================= */

function getCanonicalURL() {

    const pathname =
        window.location.pathname
            .replace(
                /\/+$/,
                "/"
            );


    return new URL(
        pathname,
        window.location.origin
    ).href;

}



/* =========================================================
   Get Absolute Image URL
========================================================= */

function getAbsoluteImageURL(
    image
) {

    if (!image) {

        return "";

    }


    try {

        return new URL(
            image,
            window.location.origin
        ).href;

    } catch {

        return "";

    }

}



/* =========================================================
   Set Page Metadata
========================================================= */

function setPageMetadata(
    article
) {

    const title =
        `${article.title} | ${SITE_NAME}`;


    const description =
        article.description ||
        article.introduction ||
        "";


    const canonical =
        getCanonicalURL();


    /* =====================================================
       Title
    ===================================================== */

    document.title =
        title;


    /* =====================================================
       Description
    ===================================================== */

    setMeta(
        "name",
        "description",
        description
    );


    /* =====================================================
       Canonical
    ===================================================== */

    setLink(
        "canonical",
        canonical
    );


    /* =====================================================
       Open Graph
    ===================================================== */

    setMeta(
        "property",
        "og:title",
        title
    );


    setMeta(
        "property",
        "og:description",
        description
    );


    setMeta(
        "property",
        "og:url",
        canonical
    );


    setMeta(
        "property",
        "og:type",
        "article"
    );


    setMeta(
        "property",
        "og:site_name",
        SITE_NAME
    );


    /* =====================================================
       Twitter
    ===================================================== */

    setMeta(
        "name",
        "twitter:title",
        title
    );


    setMeta(
        "name",
        "twitter:description",
        description
    );


    setMeta(
        "name",
        "twitter:card",
        article.image
            ? "summary_large_image"
            : "summary"
    );


    /* =====================================================
       Featured Image
    ===================================================== */

    const imageURL =
        getAbsoluteImageURL(
            article.image?.src
        );


    if (imageURL) {

        setMeta(
            "property",
            "og:image",
            imageURL
        );


        setMeta(
            "name",
            "twitter:image",
            imageURL
        );

    }

}



/* =========================================================
   Generate Article Schema
========================================================= */

function generateArticleSchema(
    article
) {

    const existing =
        document.querySelector(
            "#article-schema"
        );


    if (existing) {

        existing.remove();

    }


    const canonical =
        getCanonicalURL();


    const schema = {

        "@context":
            "https://schema.org",

        "@type":
            "Article",

        "headline":
            article.title,

        "description":
            article.description ||
            article.introduction ||
            "",

        "mainEntityOfPage": {

            "@type":
                "WebPage",

            "@id":
                canonical

        },

        "author": {

            "@type":
                article.author?.type ||
                "Organization",

            "name":
                article.author?.name ||
                SITE_NAME

        },

        "publisher": {

            "@type":
                "Organization",

            "name":
                SITE_NAME,

            "url":
                SITE_URL,

            "logo": {

                "@type":
                    "ImageObject",

                "url":
                    SITE_LOGO

            }

        },

        "articleSection":
            article.category

    };


    /* =====================================================
       Dates
    ===================================================== */

    if (article.datePublished) {

        schema.datePublished =
            article.datePublished;

    }


    if (article.dateModified) {

        schema.dateModified =
            article.dateModified;

    }


    /* =====================================================
       Image
    ===================================================== */

    const imageURL =
        getAbsoluteImageURL(
            article.image?.src
        );


    if (imageURL) {

        schema.image =
            imageURL;

    }


    /* =====================================================
       Insert Schema
    ===================================================== */

    const script =
        document.createElement(
            "script"
        );


    script.id =
        "article-schema";


    script.type =
        "application/ld+json";


    script.textContent =
        JSON.stringify(
            schema
        );


    document.head.appendChild(
        script
    );

}



/* =========================================================
   Generate FAQ Schema
========================================================= */

function generateFAQSchema(
    article
) {

    const existing =
        document.querySelector(
            "#article-faq-schema"
        );


    if (existing) {

        existing.remove();

    }


    if (
        !article.faq ||
        !article.faq.length
    ) {

        return;

    }


    const schema = {

        "@context":
            "https://schema.org",

        "@type":
            "FAQPage",

        "mainEntity":
            article.faq.map(
                item => ({

                    "@type":
                        "Question",

                    "name":
                        item.question,

                    "acceptedAnswer": {

                        "@type":
                            "Answer",

                        "text":
                            item.answer

                    }

                })
            )

    };


    const script =
        document.createElement(
            "script"
        );


    script.id =
        "article-faq-schema";


    script.type =
        "application/ld+json";


    script.textContent =
        JSON.stringify(
            schema
        );


    document.head.appendChild(
        script
    );

}



/* =========================================================
   Initialize Article SEO
========================================================= */

export function initializeArticleSEO(
    article
) {

    setPageMetadata(
        article
    );


    generateArticleSchema(
        article
    );


    generateFAQSchema(
        article
    );

}
