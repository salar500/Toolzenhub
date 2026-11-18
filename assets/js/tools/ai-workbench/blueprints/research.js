/* =========================================================
   ToolZen Hub
   AI Workbench blueprints: research and data (Stage 9)

   Every brief here carries the no-fabrication rule (compiler
   NO_FABRICATION): no invented sources, citations, quotations,
   figures or results, and evidence kept apart from interpretation.
   The data task prepares queries and formulas for SQL, Excel,
   Power BI or DAX; the visitor runs them in their own tool.
========================================================= */

import { text, area, choose, more } from "./shared.js";

const CATS = [{ id: "research" }, { id: "assistants" }];

const SEPARATE = "Keep what a source says apart from your interpretation, and say how certain each conclusion is.";

export const BLUEPRINTS = {

    "research-plan": {
        deliverable: "a research plan",
        categories: CATS,
        depth: "detailed",
        noFabrication: true,
        questions: [
            area("question", "Research question", { essential: true, rows: 2, placeholder: "Does remote work change how often junior developers ask for help?" }),
            choose("level", "Level", ["School or college project", "Undergraduate", "Master's", "PhD", "Professional or industry"]),
            area("scope", "Scope", { rows: 2, placeholder: "Software companies in India, 2020-2026" }),
            choose("method", "Method", ["Not decided: suggest options", "Literature review", "Survey", "Interviews", "Experiment", "Analysis of existing data", "Mixed methods"]),
            text("time", "Time available", { placeholder: "12 weeks" })
        ],
        brief: (a) => ({
            goal: `Help me plan research on this question: ${a.question}`,
            context: [["Level", a.level], ["Scope", a.scope], ["Method", a.method], ["Time", a.time]],
            requirements: [
                "Sharpen the question until it can be answered, and say why the sharper version is better.",
                "Propose the method with its strengths and limits, the data or sources needed, how they will be found, and the criteria for including a source.",
                "Give a timeline, the main risks to validity, and the ethics points (consent, data protection) if people are involved.",
                SEPARATE
            ],
            format: ["Sections: question, method, sources and search strategy, inclusion criteria, analysis, timeline, risks, ethics."]
        }),
        stages: [
            { at: "standard", name: "Sharpen the question", objective: "A question that can be answered.", submit: "The master prompt.", ask: () => "Give three sharper versions of my question, each with what it would and would not let me conclude.", expect: "Three versions.", done: "You chose one." },
            { at: "standard", name: "Method and search strategy", objective: "How the answer will be found.", submit: "The chosen question.", ask: () => "Propose the method, the search strategy (databases, search terms, inclusion and exclusion criteria) and the analysis.", expect: "A method and strategy.", done: "Someone else could repeat the search." },
            { at: "detailed", name: "Timeline and risks", objective: "A plan that can be done.", submit: "Nothing new.", ask: (a) => `Turn this into a timeline${a.time ? ` over ${a.time}` : ""} with milestones, and list the risks to validity and how to reduce each.`, expect: "Timeline and risks.", done: "Each milestone has an output." }
        ],
        refine: ["evidence", "completeness", "clarity"],
        quality: ["The question can be answered with the method and time available.", "The search could be repeated by someone else.", "Limitations are written down."],
        prepare: { required: ["Your question in one sentence.", "Your institution's or client's requirements."], optional: ["Sources you already know.", "Your supervisor's comments."] },
        next: ["Discuss the sharpened question with your supervisor or client.", "Run the search yourself in the databases named; the AI cannot see behind paywalls.", "Use the task \"a literature review\" once you have sources."]
    },

    "literature-review": {
        deliverable: "a literature review",
        categories: CATS,
        depth: "detailed",
        noFabrication: true,
        questions: [
            area("question", "Topic or research question", { essential: true, rows: 2 }),
            area("sources", "Your sources", { essential: true, long: true, rows: 8, hint: "Paste titles, abstracts or your notes for each source you have read or found. The review uses only these." }),
            choose("level", "Level", ["Undergraduate", "Master's", "PhD", "Professional"]),
            text("style", "Citation style", { placeholder: "APA 7" }),
            text("length", "Length", { placeholder: "2,000 words" })
        ],
        brief: (a) => ({
            goal: `Help me write a literature review on: ${a.question}`,
            context: [["Level", a.level], ["Citation style", a.style], ["Length", a.length], ["Sources (use only these)", a.sources]],
            requirements: [
                "Use only the sources I gave. If the review needs a source I did not give, say what kind of source is missing instead of naming one.",
                "Organise by theme, not source by source: where sources agree, disagree, and what is not known.",
                SEPARATE,
                a.style ? `Cite in ${a.style}, using only the details I gave for each source.` : "Cite each point to the source it came from."
            ],
            format: ["An evidence matrix first (source, method, finding, limitation), then the review."]
        }),
        stages: [
            { at: "standard", name: "Evidence matrix", objective: "Know what each source says.", submit: "The master prompt with your sources.", ask: () => "Build the evidence matrix only: one row per source with its method, main finding and limitation, using only what I gave.", expect: "A matrix.", done: "Each row matches the source when you check it." },
            { at: "standard", name: "Themes", objective: "Find the structure.", submit: "Corrections to the matrix.", ask: () => "Group the findings into themes, with where sources agree, disagree, and the gaps.", expect: "Themes.", done: "The themes answer the question." },
            { at: "detailed", name: "Write the review", objective: "The review.", submit: "Approval of the themes.", ask: () => "Write the review from the themes, citing each point.", expect: "The review.", done: "Every citation points to one of your sources." }
        ],
        refine: ["evidence", "accuracy", "structure"],
        quality: ["Every citation is to a source you gave and says what the source says: open each one.", "Gaps in the literature are stated, not filled with guesses.", "It follows your citation style."],
        prepare: { required: ["The sources themselves (abstracts, notes or full texts you are allowed to share)."], optional: ["Your institution's guidance on AI use; follow it."] },
        next: ["Check every citation against the original.", "Follow your institution's rules on declaring AI assistance.", "Write the final text in your own voice."]
    },

    dashboard: {
        deliverable: "a dashboard design and build plan",
        categories: [{ id: "data" }, { id: "assistants" }],
        depth: "standard",
        noFabrication: true,
        questions: [
            area("purpose", "Who uses the dashboard and for what decisions", { essential: true, rows: 2, placeholder: "Regional sales managers, weekly: which regions and products are behind target and why" }),
            area("data", "The data: tables, columns and how often it updates", { essential: true, long: true, rows: 5, hint: "Column names and types, and the grain (one row per what). Remove personal or confidential data.", placeholder: "sales(order_id, order_date, region, product_id, qty, revenue) one row per order line, daily\ntargets(month, region, revenue_target)" }),
            area("kpis", "Measures you need (if known)", { rows: 3, placeholder: "Revenue vs target, growth vs last year, average order value, top products" }),
            choose("tool", "Where it is built", ["Power BI", "Excel", "Tableau", "Looker Studio", "Not decided"]),
            more(area("rules", "Business rules and definitions", { rows: 2, placeholder: "Revenue excludes tax and returns; the financial year starts in April" }))
        ],
        brief: (a) => ({
            goal: `Design a business performance dashboard and the plan to build it${a.tool && a.tool !== "Not decided" ? ` in ${a.tool}` : ""}, for: ${a.purpose}`,
            context: [["Data", a.data], ["Measures wanted", a.kpis], ["Business rules", a.rules]],
            requirements: [
                "Start from the decisions the users make, then define each KPI: its business meaning, the exact calculation, the grain, the filters it respects, and the comparison it needs (target, last period, last year).",
                "Design the data model and the preparation the data needs before any visual.",
                "Lay out the pages: the summary first, then the detail, each visual with the question it answers.",
                "Use only the tables and columns I listed; ask for anything missing.",
                "Do not show results or example numbers as if they were mine: I will build it and tell you what came back."
            ],
            format: ["KPI definitions as a table: name, meaning, calculation, comparison, owner.", "The data model and preparation steps.", "The page layout, visual by visual.", "How to validate the numbers."]
        }),
        stages: [
            { at: "standard", name: "KPIs and questions", objective: "Agree what the dashboard must answer.", submit: "The master prompt with the data description.", ask: () => "Propose the KPI definitions and the questions each page answers. List the questions you have about the data and the definitions. Do not design visuals yet.", expect: "A KPI table and open questions.", done: "Every KPI has an agreed definition." },
            { at: "standard", name: "Model and build", objective: "A model and pages to build.", submit: "Your answers and the agreed KPIs.", ask: () => "Give the data preparation, the model, the calculations and the page layout, ready to build.", expect: "Preparation steps, model, calculations and layout.", done: "You can build it step by step." },
            { at: "detailed", name: "Validate", objective: "Trust the numbers.", submit: "The totals the built dashboard shows and a figure you trust for the same period.", ask: () => "Here are the dashboard's totals and a trusted figure. List each check to run, explain any difference and what would cause it.", expect: "Validation checks and explanations.", done: "The totals reconcile." }
        ],
        refine: ["technical", "completeness", "missing"],
        quality: ["Every KPI has a written definition and calculation.", "Totals reconcile with a figure you trust for the same period and filters.", "Each visual answers a stated question.", "Nothing uses a column that does not exist."],
        prepare: { required: ["The table and column names, types and grain.", "Who uses the dashboard and the decisions they make."], optional: ["Existing reports or spreadsheets the dashboard replaces.", "Targets or budgets to compare with.", "A trusted total for one period, to reconcile."] },
        next: ["Build one page first and reconcile its totals before the rest.", "Show it to two users and watch them answer their questions with it.", "Write the KPI definitions where users can find them."]
    },

    "data-analysis": {
        deliverable: "an analysis of the data",
        categories: [{ id: "data" }, { id: "assistants" }],
        depth: "standard",
        noFabrication: true,
        questions: [
            area("question", "What you want to find out", { essential: true, rows: 2, placeholder: "Which products lost sales after the price change in March?" }),
            choose("tool", "Your tool", ["SQL", "Excel", "Power BI (DAX)", "Python", "Not decided"], { essential: true }),
            area("schema", "The data: tables, columns and types", { essential: true, long: true, rows: 5, hint: "Column names and a few example rows. Remove personal or confidential data.", placeholder: "sales(order_id, product_id, order_date DATE, qty INT, price DECIMAL)\nproducts(product_id, name, category)" }),
            text("dialect", "Version or dialect", { showIf: (a) => a.tool === "SQL", placeholder: "PostgreSQL 16, MySQL 8, SQL Server…" }),
            area("rules", "Business rules", { rows: 2, placeholder: "A return is a negative qty; the financial year starts in April" })
        ],
        brief: (a) => ({
            goal: `Help me answer this with ${a.tool === "Not decided" ? "the right tool" : a.tool}: ${a.question}`,
            context: [["Data", a.schema], ["Dialect", a.dialect], ["Business rules", a.rules]],
            requirements: [
                a.tool === "SQL" ? `Write the query${a.dialect ? ` for ${a.dialect}` : ""}, with each step explained, and say what it assumes about the data.` : "",
                a.tool === "Excel" ? "Give the formulas (and the cells they go in) or the PivotTable steps, explained." : "",
                /DAX/.test(a.tool) ? "Give the DAX measures and the visual to put them in, explained, including the filter context they rely on." : "",
                a.tool === "Python" ? "Give the pandas code, explained." : "",
                "Use only the columns I listed; ask if something is missing.",
                "Say how to check the result is right (a total to compare, a row to check by hand).",
                "Do not state results: I will run it and tell you what came back."
            ],
            format: ["The approach in a few lines, then the code or formulas, then how to check them."]
        }),
        stages: [
            { at: "standard", name: "Approach", objective: "Agree the logic.", submit: "The master prompt with the columns.", ask: () => "Explain the approach and any question about the data before writing code.", expect: "An approach.", done: "It answers the question you asked." },
            { at: "standard", name: "Query or formulas", objective: "Something to run.", submit: "Answers.", ask: () => "Write the code or formulas.", expect: "Code and checks.", done: "It runs in your tool." },
            { at: "detailed", name: "Interpret", objective: "Read the result correctly.", submit: "The actual result you got (summarised, no personal data).", ask: () => "This is what came back. Interpret it, say what it does and does not show, and what to check next.", expect: "An interpretation.", done: "The conclusion follows from the numbers." }
        ],
        refine: ["technical", "evidence"],
        quality: ["You ran it yourself and the totals match a figure you trust.", "It uses only columns that exist.", "The interpretation does not claim more than the data shows."],
        prepare: { required: ["The table and column names with types.", "The question in one sentence."], optional: ["A few example rows with personal data removed.", "A known total to check against."] },
        next: ["Run it on a small sample first.", "Practise the technique in the SQL, Excel or Power BI Practice Labs.", "Never paste confidential data into an AI product your organisation has not approved."]
    },

    "market-research": {
        deliverable: "market research",
        categories: CATS,
        depth: "standard",
        noFabrication: true,
        questions: [
            area("market", "The product or market", { essential: true, rows: 2 }),
            area("question", "What you need to decide", { essential: true, rows: 2, placeholder: "Whether to launch a subscription plan" }),
            text("region", "Region", { placeholder: "India" }),
            area("known", "What you already know", { rows: 3, hint: "Competitors, customer feedback, your own figures." })
        ],
        brief: (a) => ({
            goal: `Help me research ${a.market} to decide: ${a.question}`,
            context: [["Region", a.region], ["What I know", a.known]],
            requirements: [
                "List the questions that would decide this, and for each, the kind of evidence that would answer it and where to find it.",
                "Analyse only what I gave you; for anything else, say what to look up and where.",
                SEPARATE,
                "Give no market sizes, prices or shares unless they come from a source I gave."
            ],
            format: ["Decision questions, evidence needed, sources to check, then analysis of what I gave."]
        }),
        stages: [
            { at: "standard", name: "Research questions", objective: "Know what to look for.", submit: "The master prompt.", ask: () => "Give the decision questions and the evidence for each.", expect: "Questions and evidence.", done: "You know what to look up." },
            { at: "standard", name: "Analysis", objective: "Sense of what you found.", submit: "What you found (with sources).", ask: () => "Analyse what I found against the decision questions.", expect: "Analysis.", done: "Each conclusion cites what you found." }
        ],
        refine: ["evidence", "missing"],
        quality: ["Every figure has a source you opened.", "Conclusions follow from the evidence, with uncertainty stated."],
        prepare: { required: ["The decision you need to make."], optional: ["Your own sales or customer data."] },
        next: ["Collect the evidence yourself from the sources listed.", "Write the decision and what would change it."]
    },

    report: {
        deliverable: "a report",
        categories: [{ id: "assistants" }, { id: "writing" }, { id: "research" }],
        depth: "standard",
        noFabrication: true,
        questions: [
            area("findings", "Your findings", { essential: true, long: true, rows: 8 }),
            text("readers", "Who reads it", { essential: true, placeholder: "The management team" }),
            choose("kind", "Kind", ["Executive summary", "Full report", "Research report", "Status report"]),
            text("length", "Length", { placeholder: "2 pages" })
        ],
        brief: (a) => ({
            goal: `Write a ${a.kind ? a.kind.toLowerCase() : "report"} for ${a.readers} from these findings.`,
            context: [["Length", a.length], ["Findings", a.findings]],
            requirements: ["Lead with the conclusion and what it means for the readers.", "Use only my findings; mark gaps.", SEPARATE],
            format: ["Summary, findings, implications, recommendations, limitations."]
        }),
        stages: [
            { at: "standard", name: "Key messages", objective: "What the readers must take away.", submit: "The master prompt.", ask: () => "List the three key messages and the finding behind each.", expect: "Messages.", done: "You agree with them." },
            { at: "standard", name: "Report", objective: "The report.", submit: "Approval.", ask: () => "Write the report.", expect: "The report.", done: "It fits the length." }
        ],
        refine: ["evidence", "clarity", "structure"],
        quality: ["Each statement traces to a finding.", "Limitations are stated.", "The first paragraph gives the conclusion."],
        prepare: { required: ["Your findings and the data behind them."], optional: ["A previous report to match the format."] },
        next: ["Check every figure against your data.", "Ask one reader what they took away before sending widely."]
    },

    /* AI ecosystem programme 16 D4: information from a document the visitor has (research 01, S25) */
    "doc-summary": {
        deliverable: "a summary of a document",
        categories: CATS,
        depth: "standard",
        noFabrication: true,
        questions: [
            area("document", "The document", { essential: true, rows: 3, hint: "What it is and how long. Attach or paste the document itself in the AI product, not here.", placeholder: "A 40-page supplier contract (PDF)" }),
            area("purpose", "What the summary is for", { essential: true, rows: 2, hint: "The decision or job it serves.", placeholder: "Deciding whether to renew the contract in January" }),
            text("reader", "Who will read it", { placeholder: "Our finance manager, not a lawyer" }),
            text("length", "Length", { placeholder: "One page, or ten bullet points" }),
            area("questions", "Questions it must answer", { rows: 3, hint: "One per line.", placeholder: "What is the notice period?\nAre prices fixed or indexed?" }),
            more(choose("shape", "Format", ["Paragraphs", "Bullet points", "A table"]))
        ],
        brief: (a) => ({
            goal: `Summarise the document I attach or paste (${a.document}) for this purpose: ${a.purpose}`,
            context: [["Reader", a.reader], ["Length", a.length], ["Questions to answer", a.questions], ["Format", a.shape]],
            requirements: [
                "Use only the document. For every fact you give, quote the passage it comes from or name the section or page.",
                a.questions ? "Answer each of my questions; where the document does not answer one, say so plainly." : "",
                "Put what matters most for the purpose first.",
                SEPARATE
            ],
            format: [a.shape ? `${a.shape}.` : "Short sections or bullet points.", "End with a list of what the document does not say that the purpose needs."],
            avoid: ["Facts that are not in the document."]
        }),
        conflicts: (a) => /table/i.test(a.shape) && /paragraph/i.test(a.length) ? ["You asked for a table but a length in paragraphs. Choose one."] : [],
        stages: [
            { at: "standard", name: "Map the document", objective: "Know what is in it before summarising.", submit: "The master prompt and the document.", ask: () => "Before summarising, list the document's sections with one line each, and say which sections matter for my purpose.", expect: "A section map.", done: "You recognise the document from the map." },
            { at: "standard", name: "Summary", objective: "The summary itself.", submit: "Any section to add or drop.", ask: () => "Write the summary as specified in the master prompt, with a quote or section reference for every fact.", expect: "The summary with references.", done: "Every fact has its reference." },
            { at: "detailed", name: "Quote check", objective: "Catch facts the document does not support.", submit: "Nothing new.", ask: () => "Go through the summary fact by fact. For each, give the exact quote from the document. Remove any fact you cannot quote and say which.", expect: "A fact-to-quote list.", done: "Every remaining fact has a quote you can find in the document." }
        ],
        refine: ["evidence", "accuracy", "completeness"],
        quality: ["Every fact has a quote or a section reference you found in the document.", "Each of your questions is answered or marked as not in the document.", "The most important point for the purpose comes first.", "Nothing comes from outside the document."],
        prepare: { required: ["The document, as a file or text you can paste into the AI product.", "The purpose in one sentence."], optional: ["The questions you need answered."] },
        next: ["Open the document at two or three of the quoted places and check them.", "Keep the summary with the document's name and date."]
    }

};
