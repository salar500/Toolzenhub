/* =========================================================
   ToolZen Hub
   Bug Report to Debugging Prompt (AI Tools)

   What was seen, what was expected, how to reproduce it, where
   it happened and what the error said become a debugging task
   for an AI coding assistant: reproduce first, find the root
   cause, make the smallest fix, add a regression test, keep
   everything else as it is, and report what was verified. The
   page is drawn by the shared brief page.
========================================================= */

import { createBriefTool } from "../ai-tools/common/brief-tool.js";
import { section, bullets, numbered, fenced, document as doc } from "../ai-tools/common/brief-engine.js";


export const showRelatedCalculators = true;
export const showRelatedArticles = false;


const FIX_SCOPE = [
    { value: "Make the smallest change that fixes the cause. Do not refactor, rename or tidy anything else, even if you see something you would improve; mention it in the report instead.", label: "Smallest fix only" },
    { value: "Fix the cause. If the code around it clearly caused the bug or makes the fix fragile, improve it as well, and say exactly what you changed beyond the fix.", label: "Fix, and improve the code around it if clearly needed" }
];

const TESTS = [
    { value: "Add an automated test that fails before the fix and passes after it. Run it both ways and show the output.", label: "Add a regression test that fails first" },
    { value: "Update the existing tests that cover this behaviour, and show that they pass.", label: "Update the existing tests" },
    { value: "Do not change the tests. Describe exactly how you verified the fix by hand.", label: "No test changes; verify by hand" }
];


export const CONFIG = {

    toolId: "bug-report-prompt",
    prefix: "bug",
    outputName: "debugging prompt",
    fileName: "debugging-prompt",
    intro: "Turn a bug into a task an AI coding assistant can act on: what happens, what should happen, how to reproduce it, where to look, and the rules of the fix: find the root cause, change as little as possible, add a test, report what was verified.",
    sectionTitle: "Describe the bug",
    sectionText: "Three fields are essential. The exact error text and the environment save the assistant its first wrong guesses. The prompt is written as you type.",

    fields: [
        { key: "observed", label: "What happens", required: true, rows: 3, hint: "What you see, exactly. Numbers, messages and the screen or endpoint it happens on.", placeholder: "Pressing Save on the profile page shows \"Saved\" but the new phone number is gone after a refresh." },
        { key: "expected", label: "What should happen", required: true, rows: 2, hint: "The correct behaviour, as a plain statement.", placeholder: "The new phone number is stored and shown after a refresh." },
        { key: "steps", label: "Steps to reproduce", required: true, rows: 5, hint: "One step per line, from a known starting point. Include the data you used.", placeholder: "Sign in as a normal user\nOpen Account, then Profile\nChange the phone number to +91 98765 43210\nPress Save\nRefresh the page" },
        { key: "frequency", label: "How often", kind: "text", hint: "Every time, sometimes, only the first time, only for some users.", placeholder: "every time, for every user we tried" },
        { key: "environment", label: "Where it happens", rows: 2, hint: "Browser or device, operating system, app version, branch or commit, environment (local, staging, production).", placeholder: "Chrome 130 on Windows 11 and Safari on iPhone 15\nStaging, branch feature/profile-edit at commit 3f2a9c1\nIt does not happen on main" },
        { key: "error", label: "Error output or logs", rows: 5, hint: "The exact text, copied. Console errors, stack traces, server logs, failing test output.", placeholder: "PUT /api/profile 200 OK\nconsole: Warning: state update on an unmounted component (ProfileForm)" },
        { key: "evidence", label: "Other evidence", rows: 2, hint: "What you have ruled out, what changed recently, a screenshot you can describe, a link to a failing run.", placeholder: "Started after PR #412 (profile form rewrite). The request body in DevTools contains the old number." },
        { key: "files", label: "Where to look first", rows: 3, hint: "Files, modules or functions you suspect, one per line. Leave it empty if you do not know.", placeholder: "src/components/ProfileForm.jsx\nsrc/api/profile.js (buildPayload)" },
        { key: "protect", label: "What must not change", rows: 2, hint: "Behaviour, public interfaces, files or data the fix must leave alone.", placeholder: "The API contract of PUT /api/profile\nThe validation messages, which are covered by tests" },
        { key: "scope", label: "Size of the fix", kind: "select", options: FIX_SCOPE, hint: "How far the assistant may go beyond the cause." },
        { key: "tests", label: "Tests", kind: "select", options: TESTS, hint: "How the fix is proven." }
    ],

    compose(v) {

        const environment = [v.frequency ? `Frequency: ${v.frequency}` : "", v.environment].filter(Boolean).join("\n");
        const method = [
            "Reproduce the problem first, following the steps above, and say whether you could.",
            "Find the root cause. Do not patch the symptom. Before you change any code, explain the cause in one short paragraph, with the file and the line it comes from.",
            v.scope,
            v.tests,
            "Keep every unrelated behaviour exactly as it is. List every file you changed and why.",
            "Report in this order: the cause, the fix, how you verified it (the commands and their output), and anything you could not verify.",
            "If any step cannot be completed, say so and stop there. Do not guess and do not invent output."
        ].filter(Boolean).join("\n");

        return doc([
            "# Debugging task",
            section("What happens", v.observed),
            section("What should happen", v.expected),
            section("Steps to reproduce", numbered(v.steps)),
            section("Environment", environment),
            section("Error output", v.error ? fenced(v.error) : ""),
            section("Other evidence", v.evidence),
            section("Where to look first", bullets(v.files)),
            section("Must not change", bullets(v.protect)),
            section("How to work", numbered(method))
        ]);

    },

    example: {
        values: {
            observed: "Pressing Save on the profile page shows \"Saved\", but the new phone number is gone after a refresh. The old number is back.",
            expected: "The new phone number is stored and shown after a refresh.",
            steps: "Sign in as a normal user (test account qa-user-1)\nOpen Account, then Profile\nChange the phone number to +91 98765 43210\nPress Save; the toast says \"Saved\"\nRefresh the page",
            frequency: "every time, for every account we tried",
            environment: "Chrome 130 on Windows 11, and Safari on iPhone 15\nStaging, branch feature/profile-edit at commit 3f2a9c1\nIt does not happen on main",
            error: "PUT /api/profile 200 OK, response {\"ok\":true}\nconsole: Warning: Cannot update a component (ProfileForm) while rendering a different component",
            evidence: "Started after PR #412 (profile form rewrite).\nIn DevTools the request body still contains the OLD phone number, so the server never receives the new one.",
            files: "src/components/ProfileForm.jsx\nsrc/api/profile.js (buildPayload)",
            protect: "The API contract of PUT /api/profile\nThe validation messages, which are covered by tests in tests/profile.test.js",
            scope: FIX_SCOPE[0].value,
            tests: TESTS[0].value
        }
    },

    howTo: [
        "Describe what happens and what should happen, as two plain statements.",
        "Write the steps to reproduce from a known starting point, one per line, with the data you used.",
        "Paste the exact error text and say where it happens. If you suspect a file, name it; if not, leave it empty.",
        "Choose how big the fix may be and how it must be proven, then copy the prompt into your coding assistant.",
        "Read the cause the assistant reports before you accept the change. A fix without a cause is a guess."
    ],

    parts: [
        { title: "What happens and what should happen", text: "The gap between the two is the bug. Writing them separately stops the most common failure: a report that describes the fix the reporter has in mind instead of the behaviour." },
        { title: "Steps to reproduce", text: "A numbered path from a known state. The prompt tells the assistant to walk it first and say whether the bug appeared; a fix for a problem that could not be reproduced is not a fix." },
        { title: "Environment and error output", text: "Where it happens and the exact text of what went wrong. Copied error text lets the assistant search for the real line instead of guessing from a paraphrase." },
        { title: "Where to look first and what must not change", text: "Your suspicion saves a first round of exploration; your protected list keeps the fix from spilling into contracts, messages and files that other code relies on." },
        { title: "How to work", text: "The rules that separate a repair from a rewrite: reproduce, find the cause and explain it before changing code, keep the change small, prove it with a test, list every changed file, report what was verified and what was not, and never invent output." }
    ],

    useWith: [
        "Paste the prompt into the assistant that can see your code: Claude Code, GitHub Copilot Chat, Cursor, ChatGPT with the files attached, or any other.",
        "If the assistant cannot run the code, it will say so at step 1; give it the output of the steps yourself.",
        "Ask for the cause paragraph before the diff if the assistant jumps straight to code.",
        "Run the regression test yourself, both before and after the fix, before you merge anything.",
        "Keep the prompt with the bug: it is already a good bug report for a human too."
    ],

    faq: [
        { q: "Why reproduce first?", a: "Because a bug that cannot be reproduced cannot be shown fixed. The prompt makes the assistant say whether the steps produced the problem before it touches anything, so a \"fix\" for a different problem is caught at the start." },
        { q: "What if I do not know which files are involved?", a: "Leave \"Where to look first\" empty; the heading is left out of the prompt. The error text and the steps usually give the assistant enough to find the place." },
        { q: "Does this send my code or logs anywhere?", a: "No. This page composes text in your browser and stores nothing. What you paste into an assistant, and which assistant, is your choice; remove secrets from logs before you do." },
        { q: "Can I use it for a bug report to a person?", a: "Yes. The first sections (what happens, what should happen, steps, environment, error output) are the shape of a good bug report for anyone. Delete \"How to work\" if the reader is a colleague." }
    ]

};


const tool = createBriefTool(CONFIG);

export const markup = tool.markup;
export const render = tool.render;
export const init = tool.init;
export const build = tool.build;
