# Content clusters

How a tool and its supporting articles fit together, and the standard every article must meet.
This is the editorial and linking standard for every Tool Pack (`docs/tool-pack-template.md`).

## What the current content looks like (audit of the six published articles)

All six live under `/articles/loan-comparison/…` and share one body template: Table of Contents,
Key Takeaways, 5–6 numbered sections, an Example, "The Bigger Picture", "Things to Consider", a tool
call to action, and a 3–5 item FAQ (about 820–1,040 words each).

What works and should stay reusable:

- the **template** (summary first, numbered explanation, example, caveats, tool call to action, FAQ);
- **one catalog** owns an article's metadata, and the body lives in its own module;
- the **disclaimer** is linked from every page, and the articles state "check your lender's terms".

What to improve for new clusters (the existing articles are not rewritten):

- **No numbers.** The "Example" sections are descriptive ("suppose you have a loan…"). A tool that
  produces figures lets new articles use real, reproducible examples.
- **Everything is linked to everything.** Each article lists the other five as related, and all six
  point at one tool. A cluster should link where it helps the reader, not form a mesh.
- **Overlap.** "What Is Loan Prepayment?", "How to Reduce Your Home Loan Interest", "How Loan Tenure
  Affects Total Interest" and "How to Choose the Right Loan Tenure" each touch tenure and prepayment.
  New articles must state the distinct question they answer (see the standard below).
- **EMI shows the same six articles only by category fallback**, because the articles name just
  `loan-comparison` as their tool.
- **One article has no hero image** (`choose-right-loan-tenure`), so it has no social image.

## The cluster model

A **cluster** is one tool plus the articles that genuinely help someone use or understand it.
There is no required size. Quality decides depth:

| Tool kind | Typical depth |
| --- | --- |
| Major decision tool (a loan or investment decision) | 4 to 6 articles |
| Simple converter or lookup | 1 to 3 articles |
| Developer utility | 2 to 5 practical guides |

Roles an article can play (use only those that fit; never invent a role to reach a number):

| Role | The question it answers |
| --- | --- |
| guide | What is it, and when does it matter? |
| method | How is the number worked out? |
| examples | What happens with real figures, or in a specific situation? |
| comparison | Which of two choices is better, and when? |
| mistakes | What goes wrong, and what should I check first? |
| faq | The advanced questions the guide does not have room for |

**The role is editorial, not code.** No page or rule reads it today, and adding a field to all 12
catalog entries would create migration work with no consumer. Record the role in the cluster brief
(the Tool Pack spec). Add an `articleRole` field only when something reads it.

## Ownership: one catalog

`assets/js/data/articles.js` is the single owner of an article's id, slug, topic, category, status,
title, description, dates, images (card and hero), curated tools and related articles. The body is
the only thing elsewhere (the article's own content module, joined by `article-model.js`), and it
holds no metadata. SEO text comes from the catalog entry; the social image is the hero image. Do not
add a second content list.

## Editorial quality standard

Every article must:

1. **Answer one distinct question**, written down in one sentence before drafting. If another article
   already answers it, link to that article instead of writing this one.
2. **Have a reason to exist** for a reader who already has the tool open or is about to.
3. **Support the tool naturally**: the reader should be able to try their own figures. Link to the tool
   where it helps, once clearly, not repeatedly.
4. **Use real examples where examples help.** Numbers come from the tool's own logic (the golden tests),
   not from a different method, and state their assumptions (rate, tenure, timing).
5. **Link only to genuinely related articles** (2 to 4, not every sibling).
6. **Avoid** keyword stuffing, generic filler ("in today's fast-paced world"), invented authority
   ("experts agree") and unsupported claims.
7. **Be accurate or silent.** If a fact depends on a rule that changes (a regulation, a tax rule, a
   bank policy), either cite a source that was checked when writing, or say "check your lender or
   current rules" and do not state it as fact.
8. Have a **unique** title and description, a canonical URL on the production origin, and a hero image
   (with a WebP next to the PNG).

Sensitive topics (money, tax, health, anything affecting a decision) also:

- **separate calculation from advice**: the tool computes; the article explains and informs; neither
  says what the reader should do with their money or health;
- **state assumptions** next to every number;
- **avoid overclaiming** ("guaranteed", "best", "always");
- keep the existing disclaimer link and the "estimates, not advice" framing (`disclaimer.html`).

## Relationships and internal linking

The system (`data/relationships.js`) is curated first, then falls back by category. A tool pack
declares ids, never titles or routes:

| Direction | Curated source | Falls back to |
| --- | --- | --- |
| tool → related tools | `tool.relatedTools` (ids) | other published tools in the same category |
| tool → related articles | `tool.relatedArticles` (keys), then articles whose `tools` name the tool | other published articles in the category |
| article → tools | `article.tools` (ids; the **first** is the primary tool) | published tools in the category |
| article → related articles | `article.related` (keys), shown as written, **not padded** | the category's articles, only if no curated list |

Facts that shape the standard:

- An article page shows **one** tool call to action, the first entry of `article.tools`. Other entries
  only affect fallback lists, so choose the primary tool deliberately.
- A tool page lists **every** article that points at it (there is no cap today). A cluster of six or
  more should list its strongest few first via `tool.relatedArticles` (curated order), and a cap is
  worth adding when a tool has more articles than fit a page.
- Publishing a new tool changes the related-tool lists of existing tools and articles in its category
  by fallback. That is expected, and is reviewed in the Tool Pack (it changes those pages).

Linking standard:

- A **tool page** exposes related tools, its strongest supporting guides, and the category.
- An **article page** exposes its primary tool, 2 to 4 related articles, and (through the category) related tools.
- Links are useful, not dense: if a link would not help the reader, leave it out.

## SEO for a cluster without thin pages

- The **tool page** carries the problem-solving intent ("calculate X"). One title, one description,
  one canonical, breadcrumb structured data.
- Each **article** carries a distinct informational intent. No two articles share a title, a primary
  question, or a near-identical description. Do not create a page for a keyword variation.
- Structured data only where the content is visible: Article, FAQPage (when the FAQ is on the page)
  and BreadcrumbList, as today.
- Canonical URLs always use the production origin (`https://toolzenhub.in`); the preview build never
  becomes canonical.
- Do not publish a page that is only a re-wording of another: merge it into the stronger one.

## Cluster brief (fill in before writing any article)

```
Tool:               <id>
Article:            <working title>
Role:               guide | method | examples | comparison | mistakes | faq
Question answered:  <one sentence>
Reader:             <who is asking, and what they already know>
Different from:     <the nearest article, and how this one differs>
Tool link:          <where, and why it helps>
Related (2–4):      <article keys>
Numbers needed:     <scenarios, computed with the tool's logic>
Facts to verify:    <anything rule-dependent, with the source checked>
Build now or later: <and why>
```
