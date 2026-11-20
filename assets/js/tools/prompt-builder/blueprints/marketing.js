/* =========================================================
   ToolZen Hub
   AI Prompt Builder blueprints: digital marketing (AI programme D18)

   An SEO audit, keyword research and a campaign plan. Figures
   come only from the visitor's own exports (Search Console,
   Analytics, an SEO platform); the AI is told never to invent
   search volumes, rankings or traffic.
========================================================= */

import { text, area, choose, more } from "./shared.js";

const CATS = [{ id: "research" }, { id: "assistants" }, { id: "writing" }];

export const BLUEPRINTS = {

    "seo-audit": {
        deliverable: "an SEO audit with prioritised fixes",
        categories: CATS,
        depth: "detailed",
        noFabrication: true,
        questions: [
            text("site", "Website or pages to audit", { essential: true, placeholder: "example.in, mainly /products/ and the blog" }),
            area("business", "What the site is for and who it serves", { essential: true, rows: 2, placeholder: "Online shop selling handmade leather bags to customers in India" }),
            choose("focus", "Focus of the audit", ["Technical SEO (crawling, indexing, speed, structured data)", "On-page SEO (titles, headings, content, internal links)", "Content gaps and search intent", "All three"], { essential: true }),
            text("market", "Target country and language", { placeholder: "India, English and Hindi" }),
            area("data", "What data you can share", { rows: 3, hint: "Exports you have: Search Console Performance or Page indexing, Analytics, a crawl, an SEO platform. Paste or attach them when the AI asks.", placeholder: "Search Console Performance export for the last 3 months; a crawl CSV" }),
            more(area("known", "Known problems or recent changes", { rows: 2, placeholder: "Traffic fell after the March redesign" }))
        ],
        brief: (a) => ({
            goal: `Run an SEO audit of ${a.site} and give me fixes in order of impact.`,
            context: [["The site", a.business], ["Focus", a.focus], ["Target market", a.market], ["Data I can share", a.data], ["Known problems", a.known]],
            requirements: [
                "Work from the data I give you. Where you need data I have not given, name the report or export and ask for it.",
                "For each finding give: what is wrong, the evidence (which page, query or report row), why it matters for search, the fix, and the effort (small, medium, large).",
                "Separate technical, on-page and content findings, and match each page to the search intent it should serve.",
                "Prioritise by likely impact on qualified traffic, not by the number of issues."
            ],
            format: ["A short summary of the three most important problems first.", "Then a table: finding, evidence, fix, impact, effort.", "End with what to measure after the fixes and when."],
            avoid: ["Invented search volumes, rankings, traffic figures or competitor data.", "Promises of rankings or traffic."]
        }),
        stages: [
            { at: "standard", name: "Agree the scope", objective: "Confirm what is audited and what data exists.", submit: "The main prompt.", ask: () => "Before auditing, list the data you need from me, by report or export name, and the questions you have about the site. Wait for my answers.", expect: "A list of exports and questions.", done: "You have shared the data or said it is not available." },
            { at: "standard", name: "Findings", objective: "Get the audit.", submit: "The exports.", ask: () => "Audit the site with the data I shared, as specified in the main prompt.", expect: "The summary and the findings table.", done: "Each finding cites its evidence." },
            { at: "detailed", name: "Fix plan", objective: "Turn findings into work.", submit: "Nothing new.", ask: () => "Turn the top ten findings into a fix plan: owner type (developer, writer, marketer), steps and how to verify each fix in Search Console or a crawl.", expect: "A fix plan with verification steps.", done: "Every top finding has a verification step." }
        ],
        refine: ["evidence", "completeness", "missing"],
        quality: ["Every finding points to a page, query or report row you can open.", "No figure appears that is not in your own data.", "The fixes are ones your team can actually make."],
        prepare: { required: ["The site address and the pages that matter most.", "Exports from Search Console, Analytics or an SEO platform, if you have them."], optional: ["A recent crawl of the site.", "The dates of redesigns, migrations or big content changes."] },
        next: ["Fix the high-impact, low-effort items first.", "Compare the same Search Console report four to eight weeks after the fixes."]
    },

    "keyword-research": {
        deliverable: "a keyword plan grouped by search intent",
        categories: CATS,
        depth: "standard",
        noFabrication: true,
        questions: [
            area("topic", "Product, service or topic", { essential: true, rows: 2, placeholder: "Online accounting course for small business owners" }),
            text("audience", "Who searches for it", { placeholder: "Small business owners in India without an accountant" }),
            text("market", "Country and language", { placeholder: "India, English" }),
            area("seeds", "Keywords and data you already have", { rows: 3, hint: "Seed keywords, Search Console queries, or an export from your SEO platform with volumes. Volumes come only from your data.", placeholder: "bookkeeping course, GST course; Search Console queries export attached" }),
            choose("goal", "What the keywords are for", ["New pages to write", "Improving existing pages", "Paid search (ads)", "All of these"])
        ],
        brief: (a) => ({
            goal: `Build a keyword plan for: ${a.topic}`,
            context: [["Searchers", a.audience], ["Market", a.market], ["What I already have", a.seeds], ["Used for", a.goal]],
            requirements: [
                "Group keywords into topics and label each with its search intent (informational, commercial, transactional, navigational).",
                "Map each group to one page: an existing page or a new one, never two pages for the same intent.",
                "Use search volumes and difficulty only from the data I give you; otherwise mark them unknown and tell me where to look them up.",
                "Flag keywords that look relevant but would attract the wrong visitors."
            ],
            format: ["A table: keyword group, main keyword, variants, intent, page, volume (from my data or 'unknown').", "Then the five groups to start with and why."],
            avoid: ["Invented search volumes or difficulty scores."]
        }),
        stages: [
            { at: "standard", name: "Topics and intent", objective: "Agree the topic groups first.", submit: "The main prompt and your data.", ask: () => "List the topic groups and their intent only. Wait for my review before listing keywords.", expect: "Topic groups with intent.", done: "You have kept, merged or dropped each group." },
            { at: "standard", name: "Keyword table", objective: "Get the plan.", submit: "Your approved groups.", ask: () => "Write the full keyword table for the approved groups, as specified.", expect: "The keyword table.", done: "Every group maps to one page." }
        ],
        refine: ["evidence", "completeness"],
        quality: ["Each group maps to exactly one page.", "Every volume figure comes from your own data or is marked unknown."],
        prepare: { required: ["What you sell or write about, and who for."], optional: ["Search Console queries or an SEO platform export with volumes."] },
        next: ["Check volumes and difficulty in your SEO platform before committing to a page.", "Plan the pages with the AI Prompt Builder task \"An article or blog post\"."]
    },

    "campaign-plan": {
        deliverable: "a marketing campaign plan",
        categories: [{ id: "assistants" }, { id: "writing" }],
        depth: "detailed",
        questions: [
            area("offer", "What the campaign promotes", { essential: true, rows: 2, placeholder: "A festive 20% discount on gift hampers" }),
            text("objective", "Objective and how it is measured", { essential: true, placeholder: "300 orders in 3 weeks at under ₹150 cost per order" }),
            text("audience", "Audience", { placeholder: "Existing customers and lookalikes, 25-45, metro cities" }),
            text("budget", "Budget and dates", { placeholder: "₹1.5 lakh, 1-21 December" }),
            area("channels", "Channels and tools you use", { rows: 2, hint: "Google Ads, Meta Ads Manager, email, social. The plan only uses these.", placeholder: "Meta Ads Manager, Mailchimp, Instagram" }),
            more(area("past", "What worked or failed before", { rows: 2 }))
        ],
        brief: (a) => ({
            goal: `Plan a marketing campaign for: ${a.offer}`,
            context: [["Objective and measure", a.objective], ["Audience", a.audience], ["Budget and dates", a.budget], ["Channels", a.channels], ["Past results", a.past]],
            requirements: [
                "Start from the objective: define the primary KPI, how it is tracked and the target.",
                "Split budget and timing across the channels I named, with the reasoning for the split.",
                "For each channel give the audience, the message, the creative needed and the tracking (UTM parameters or the platform's own conversion tracking).",
                "Include a test plan (what is tested against what) and the rule for moving budget during the campaign.",
                "State every assumption about costs or conversion rates as an assumption to check, not as a fact."
            ],
            format: ["Sections: objective and KPIs, audience, channel plan, budget and timeline, creative list, tracking, tests, risks."],
            avoid: ["Benchmarks presented as facts.", "Channels I do not use."]
        }),
        stages: [
            { at: "standard", name: "Strategy", objective: "Agree objective, audience and channels.", submit: "The main prompt.", ask: () => "Give the objective, KPIs, audience and channel split only, with your assumptions. Wait for my review.", expect: "A one-page strategy.", done: "The KPI and budget split are agreed." },
            { at: "standard", name: "Full plan", objective: "Get the plan.", submit: "Your corrections.", ask: () => "Write the full campaign plan as specified.", expect: "The full plan.", done: "Every channel has message, creative and tracking." },
            { at: "detailed", name: "Creative briefs", objective: "Brief the creative.", submit: "Nothing new.", ask: () => "Write one creative brief per channel: format, size, message, call to action and three variations to test.", expect: "Creative briefs.", done: "Each brief can go to a designer or writer as it is." }
        ],
        refine: ["completeness", "missing", "structure"],
        quality: ["The KPI can be measured with the tracking described.", "Every cost or rate figure is labelled as an assumption or comes from your data."],
        prepare: { required: ["The offer, the objective and the budget."], optional: ["Results of past campaigns.", "Brand guidelines."] },
        next: ["Set up tracking before launch and test that conversions are recorded.", "Write the ad copy with the task \"Marketing or product copy\"."]
    }

};
