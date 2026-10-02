/* =========================================================
   ToolZen Hub
   Search

   One small, deterministic search over the shared index
   (data/search-index.js). No backend, no external service.

   A query is lower-cased, trimmed and matched as ONE phrase
   (a plain substring), exactly like the page searches always
   worked. Every entry gets the score of the BEST rule it
   satisfies:

       100  title is exactly the query
        80  title starts with the query
        60  title contains the query
        50  an alias contains the query
        40  a keyword contains the query
        30  the category or subcategory title contains the query
        25  the id contains the query          (only with matchId)
        20  the description contains the query

   Results are sorted by score, highest first. Among equal
   scores a published item comes before a coming-soon one,
   and after that the catalog order is kept, so the output
   never depends on anything but the data and the query.

   Options
       types              ["tool", "article", ...]  default: all
       category           only entries of this major category id
       subcategory        only entries of this subcategory id
       includeComingSoon  default false. Coming-soon items are
                          not found unless the caller asks, as
                          the pages that list "Coming soon"
                          cards do.
       matchId            also match the id (the Loans page
                          always did)
       limit              maximum number of results
       index              a different index (tests)

   An empty query returns []. Pages decide what to show then.
========================================================= */

import {
    searchIndex
} from "../data/search-index.js";


/* =========================================================
   RANK
========================================================= */

export const RANK = Object.freeze({
    TITLE_EXACT: 100,
    TITLE_PREFIX: 80,
    TITLE_CONTAINS: 60,
    ALIAS: 50,
    KEYWORD: 40,
    CATEGORY: 30,
    ID: 25,
    DESCRIPTION: 20
});


export function normalizeQuery(
    query
) {

    return String(query ?? "")
        .trim()
        .toLowerCase();

}


function includes(
    text,
    query
) {

    return String(text ?? "")
        .toLowerCase()
        .includes(query);

}


/*
 * Score of one entry for a normalized, non-empty query.
 * 0 means no match.
 */

export function scoreEntry(
    entry,
    query,
    { matchId = false } = {}
) {

    const title =
        String(entry.title ?? "").toLowerCase();

    if (title === query) {
        return RANK.TITLE_EXACT;
    }

    if (title.startsWith(query)) {
        return RANK.TITLE_PREFIX;
    }

    if (title.includes(query)) {
        return RANK.TITLE_CONTAINS;
    }

    if (entry.aliases?.some(alias => includes(alias, query))) {
        return RANK.ALIAS;
    }

    if (entry.keywords?.some(word => includes(word, query))) {
        return RANK.KEYWORD;
    }

    if (
        includes(entry.categoryTitle, query) ||
        includes(entry.subcategoryTitle, query)
    ) {
        return RANK.CATEGORY;
    }

    if (matchId && includes(entry.id, query)) {
        return RANK.ID;
    }

    if (includes(entry.description, query)) {
        return RANK.DESCRIPTION;
    }

    return 0;

}


/* =========================================================
   SEARCH
========================================================= */

export function search(
    query,
    {
        types,
        category,
        subcategory,
        includeComingSoon = false,
        matchId = false,
        limit,
        index = searchIndex
    } = {}
) {

    const normalized =
        normalizeQuery(query);

    if (!normalized) {
        return [];
    }

    const results = [];

    index.forEach(
        (entry, position) => {

            if (types && !types.includes(entry.type)) {
                return;
            }

            if (
                !includeComingSoon &&
                entry.status !== "published"
            ) {
                return;
            }

            if (category && entry.category !== category) {
                return;
            }

            if (subcategory && entry.subcategory !== subcategory) {
                return;
            }

            const score =
                scoreEntry(
                    entry,
                    normalized,
                    { matchId }
                );

            if (score > 0) {
                results.push({
                    entry,
                    score,
                    position
                });
            }

        }
    );

    const isPublished = result =>
        result.entry.status === "published"
            ? 0
            : 1;

    results.sort(
        (a, b) =>
            b.score - a.score ||
            isPublished(a) - isPublished(b) ||
            a.position - b.position
    );

    const entries =
        results.map(
            result => ({
                ...result.entry,
                score: result.score
            })
        );

    return typeof limit === "number"
        ? entries.slice(0, limit)
        : entries;

}
