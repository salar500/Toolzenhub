/* =========================================================
   ToolZen Hub
   AI Workbench blueprints: research and data (Stage 9)

   Every brief here carries the no-fabrication rule (compiler
   NO_FABRICATION): no invented sources, citations, quotations,
   figures or results, and evidence kept apart from interpretation.
   The data task prepares queries and formulas for SQL, Excel,
   Power BI or DAX; the visitor runs them in their own tool.
========================================================= */

import { text, area, choose } from "./shared.js";

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
    }

};
