/* =========================================================
   ToolZen Hub
   Tool-to-knowledge links (owner requirement, 2026-11-15)

   For a tool or lab page: where to keep learning on this
   site, and which primary sources to check. Rendered as the
   "Learn and check" block (components/knowledge-links.js),
   after the tool and before its related tools. Related tools
   and related articles stay where they are (the catalog and
   data/relationships.js); nothing here repeats them.

   Each entry is curated by hand and lists only what helps
   the job the page does. A tool with nothing genuinely
   useful has no entry, and the block is not drawn (no
   generic or padded links).

     learn     [{ ref, why }]   ref: "path:<id>", "lesson:<path>/<level>/<module>/<slug>",
                                "lab:<tool id>" (a Practice Labs tool) or "directory:<audience>"
                                (the AI products directory, filtered; "directory:" for all)
     official  [{ ref, why }]   ref: an id in data/official-sources.js
     sources   { label, refs: [ids], why }   several official pages that answer one
                                question (banks' own FD rate pages), drawn as one row

   Every ref is resolved when the site is built; an unknown
   one stops the build (tests/unit/knowledge-links.test.mjs).
========================================================= */

const KFS = { ref: "rbi-kfs", why: "Before you sign, a lender must give you this statement of the annual percentage rate and every charge; compare it with your estimate." };

export const KNOWLEDGE = Object.freeze({

    /* ---------- Calculators: loans ---------- */
    "emi": { official: [KFS] },
    "home-loan": { official: [KFS] },
    "personal-loan": { official: [KFS] },
    "loan-eligibility": { official: [KFS] },
    "loan-comparison": { official: [{ ref: "rbi-kfs", why: "Each lender's Key Facts Statement gives the annual percentage rate and charges, the figures to compare loans on." }] },
    "balance-transfer": { official: [{ ref: "rbi-kfs", why: "The new lender's Key Facts Statement lists the processing and other charges a switch costs." }] },
    "prepayment": { official: [KFS] },
    "interest": { official: [KFS] },
    "credit-card-payoff": { official: [{ ref: "rbi-cards", why: "The RBI rules on how card issuers bill, charge interest and handle minimum payments." }] },

    /* ---------- Calculators: investment ---------- */
    "fd": {
        official: [{ ref: "dicgc", why: "How much of a deposit at one bank is insured if the bank fails." }],
        sources: {
            label: "Current FD rates on the banks' own pages",
            refs: ["sbi-fd", "hdfc-fd", "icici-fd", "axis-fd", "bob-fd", "kotak-fd"],
            why: "Rates change and depend on the term and on whether you are a senior citizen; this site shows none, so check the bank's page on the day you invest."
        }
    },
    "sip": { official: [{ ref: "sebi-investor", why: "The regulator's investor pages: how mutual funds, their risks and their charges work." }] },
    "swp": { official: [{ ref: "sebi-investor", why: "The regulator's investor pages on mutual fund withdrawals, risks and charges." }] },
    "cagr": { official: [{ ref: "sebi-investor", why: "The regulator's investor pages on reading past returns and risk." }] },
    "xirr": { official: [{ ref: "sebi-investor", why: "The regulator's investor pages on how fund returns are reported." }] },

    /* ---------- Calculators: tax ---------- */
    "gst": {
        official: [
            { ref: "cbic-gst", why: "The GST acts, rules and rate notifications: the source for which rate applies to a good or service." },
            { ref: "gst-portal", why: "Registration, returns and payments for GST-registered businesses." }
        ]
    },
    "income-tax": { official: [{ ref: "it-efiling", why: "File your return, and check the department's own tax calculator and notices." }] },
    "salary-in-hand": {
        official: [
            { ref: "it-efiling", why: "The Income Tax Department's portal, for the tax deducted from salary." },
            { ref: "epfo", why: "Your provident fund account and the EPF contribution rules." }
        ]
    },

    /* ---------- Calculators: health and conversion ---------- */
    "bmi": { official: [{ ref: "who-bmi", why: "The WHO's BMI classification, and what BMI does not measure." }] },
    "bmr": { official: [{ ref: "nin-guidelines", why: "ICMR-NIN's dietary guidelines for Indians, for turning energy needs into meals." }] },
    "calorie": { official: [{ ref: "nin-guidelines", why: "ICMR-NIN's dietary guidelines for Indians, for turning energy needs into meals." }] },
    "unit-converter": { official: [{ ref: "bipm-si", why: "The definitions of the SI units every conversion rests on." }] },

    /* ---------- Time Tools ---------- */
    "time-zone-converter": { official: [{ ref: "iana-tz", why: "The time zone database your browser uses for every offset and clock change shown here." }] },
    "world-clock": { official: [{ ref: "iana-tz", why: "The time zone database your browser uses for every offset and clock change shown here." }] },
    "meeting-planner": { official: [{ ref: "iana-tz", why: "The time zone database behind each city's offset and clock changes." }] },

    /* ---------- Developer Tools ---------- */
    "json-formatter": {
        learn: [
            { ref: "lab:json-error-fixing-lab", why: "Practise finding and fixing the errors this tool reports." },
            { ref: "lesson:http-apis/beginner/http-basics/query-headers-and-json", why: "How JSON travels in API requests and responses." }
        ],
        official: [
            { ref: "rfc-8259", why: "The JSON standard: what strict JSON allows, and why trailing commas and comments are errors." },
            { ref: "mdn-json", why: "JSON.parse and JSON.stringify in JavaScript, and their limits." }
        ]
    },
    "json-compare": {
        learn: [{ ref: "lesson:http-apis/beginner/http-basics/query-headers-and-json", why: "How JSON bodies are built, for comparing two API responses." }],
        official: [{ ref: "rfc-8259", why: "The JSON standard both documents follow, including what it says about object member order." }]
    },
    "jsonpath-tester": {
        learn: [{ ref: "lab:jsonpath-challenge-lab", why: "Practise writing JSONPath against real documents, with answers checked." }],
        official: [{ ref: "rfc-9535", why: "The JSONPath standard: selectors, filters and functions." }]
    },
    "json-csv-converter": {
        official: [
            { ref: "rfc-4180", why: "The CSV format: quoting, commas and line breaks inside fields." },
            { ref: "rfc-8259", why: "The JSON standard on the other side of the conversion." }
        ]
    },
    "jwt-decoder": {
        learn: [{ ref: "lesson:backend/intermediate/data-and-identity/sessions-and-tokens", why: "How tokens and sessions fit into authentication." }],
        official: [{ ref: "rfc-7519", why: "The JWT standard: the registered claims (exp, iat, aud) and how a token is built." }]
    },
    "base64-encoder-decoder": { official: [{ ref: "rfc-4648", why: "The Base64 and Base64url alphabets, and padding." }] },
    "url-parser": {
        learn: [{ ref: "lesson:http-apis/beginner/http-basics/clients-servers-and-urls", why: "What each part of a URL does in a request." }],
        official: [
            { ref: "whatwg-url", why: "How browsers parse URLs, which this tool follows." },
            { ref: "rfc-3986", why: "The URI syntax standard, for the names of each part." }
        ]
    },
    "uuid-generator": { official: [{ ref: "rfc-9562", why: "The UUID standard: versions 4 and 7, and their layout." }] },
    "unix-timestamp-converter": { official: [{ ref: "mdn-date", why: "JavaScript dates count milliseconds since 1970; Unix time usually counts seconds." }] },
    "cron-expression-explainer": {
        learn: [{ ref: "lab:cron-challenge-lab", why: "Practise reading and writing cron schedules, with answers checked." }],
        official: [{ ref: "crontab-5", why: "The crontab format, including how day-of-month and day-of-week combine." }]
    },

    /* ---------- Practice Labs ---------- */
    "sql-practice-lab": {
        learn: [
            { ref: "path:sql", why: "The SQL learning path: the lessons these exercises practise, in order." },
            { ref: "lesson:database-design/advanced/databases-in-practice/postgresql-mysql-sqlite", why: "This lab runs SQLite; what changes in PostgreSQL and MySQL." }
        ],
        official: [{ ref: "sqlite-sql", why: "The SQL that SQLite understands, the engine this lab runs." }]
    },
    "excel-practice-lab": {
        learn: [
            { ref: "path:excel", why: "The Excel learning path: the lessons these exercises practise." },
            { ref: "lesson:excel/intermediate/working-with-data/lookups", why: "VLOOKUP, INDEX and MATCH, and XLOOKUP, explained with examples." }
        ],
        official: [{ ref: "ms-excel-functions", why: "Microsoft's reference for every Excel function; this lab simulates a subset." }]
    },
    "power-bi-practice-lab": {
        learn: [{ ref: "path:power-bi", why: "The Power BI learning path: Power Query, modelling and DAX, in order." }],
        official: [
            { ref: "ms-dax", why: "Microsoft's DAX reference; this lab calculates a subset of DAX." },
            { ref: "ms-power-query-m", why: "Microsoft's Power Query M reference, behind the query steps practised here." }
        ]
    },
    "test-design-lab": {
        learn: [
            { ref: "lesson:test-design/beginner/partitions-boundaries/equivalence-partitioning", why: "Equivalence partitioning, explained before you practise it." },
            { ref: "lesson:test-design/beginner/partitions-boundaries/boundary-value-analysis", why: "Boundary value analysis, explained before you practise it." }
        ]
        /* no certification body is linked: the lab states it is not exam or syllabus preparation (test-design-lab.spec) */
    },
    "json-error-fixing-lab": { official: [{ ref: "rfc-8259", why: "The JSON standard every exercise here is checked against." }] },
    "jsonpath-challenge-lab": { official: [{ ref: "rfc-9535", why: "The JSONPath standard behind the challenges." }] },
    "cron-challenge-lab": { official: [{ ref: "crontab-5", why: "The crontab format the challenges use." }] },

    /* ---------- AI Tools ---------- */
    "prompt-builder": {
        learn: [
            { ref: "path:prompt-engineering", why: "A short path on writing prompts that get usable answers." },
            { ref: "lesson:manual-testing/intermediate/executing-reporting/writing-bug-reports", why: "What a bug report needs before any assistant can help with it." },
            { ref: "directory:", why: "The assistants and other AI products you might paste a prompt into, checked on their official sites." }
        ]
    },
    "ai-answer-checker": { learn: [{ ref: "path:ai-foundations", why: "How language models produce answers, why an answer needs checking, and why two can differ." }] },

    /* ---------- Image Tools ---------- */
    "image-compressor-resizer": { official: [{ ref: "mdn-image-types", why: "JPEG, PNG and WebP compared: transparency, quality and browser support." }] },
    "photos-to-pdf": { official: [{ ref: "mdn-image-types", why: "The image formats this tool accepts, compared." }] },
    "image-metadata": { official: [{ ref: "mdn-image-types", why: "JPEG and PNG compared, including what each format can store besides the picture." }] }

});
