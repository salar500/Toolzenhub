/* =========================================================
   ToolZen Hub
   AI Workbench: the task index (AI ecosystem programme, 17 §5.2)

   A plain description ("test plan for a coupon feature") is
   matched against the words people really use for each task and
   for the AI tools beside the Workbench. The result is a short
   list for the visitor to choose from: nothing is chosen for them
   and equal scores are shown as equal. Deterministic; pure.

   Scoring: a matched phrase of two or more words 3, a matched
   synonym word 2, a word of the task's title 1, a word of the
   task's outcome 0.5. Words are compared after a light stem.
========================================================= */

import { TASKS, getTask } from "./taxonomy.js";
import { ROUTES } from "../../routes.js";

/* true terms for each task's job (rulebook 5.3: no broad or invented words) */
const SYNONYMS = {
    "article": ["article", "blog post", "blog", "guide", "how to article"],
    "social-posts": ["social media", "social post", "linkedin post", "instagram caption", "caption", "tweet", "thread", "facebook post"],
    "marketing-copy": ["marketing copy", "ad copy", "advert", "landing page", "product description", "slogan", "tagline", "sales page"],
    "script": ["script", "video script", "podcast script", "youtube script", "voiceover script"],
    "repurpose": ["repurpose", "reuse content", "into posts", "into a newsletter", "into a thread", "into a video", "into slides", "into a summary"],
    "email-message": ["email", "e-mail", "reply", "message", "letter", "whatsapp message", "follow up email", "cover letter"],
    "graphic-design": ["graphic design", "design brief", "creative brief", "flyer", "brochure", "brand identity", "logo concept", "social graphic", "banner design", "layout", "visual design"],
    "image-generate": ["image", "picture", "illustration", "artwork", "generate an image", "ai art", "poster", "logo"],
    "image-edit": ["edit image", "edit a photo", "remove background", "retouch", "change the background", "photo edit", "inpaint"],
    "product-photo": ["product photo", "product shot", "packshot", "white background", "ecommerce photo"],
    "thumbnail": ["thumbnail", "banner", "cover image", "youtube thumbnail", "header image"],
    "image-series": ["consistent character", "character", "series of images", "illustration series", "same character", "comic"],
    "video-concept": ["video idea", "video concept", "video plan", "reel idea", "youtube video"],
    "storyboard": ["storyboard", "shot list", "scenes", "scene plan"],
    "text-to-video": ["ai video", "text to video", "generate a video", "video from text", "short video", "reel", "clip"],
    "image-to-video": ["animate", "image to video", "animate a photo", "photo to video", "bring a picture to life"],
    "voiceover": ["voiceover", "voice over", "narration", "text to speech", "tts", "read aloud", "audiobook"],
    "podcast": ["podcast", "episode", "interview show"],
    "music": ["music", "song", "jingle", "soundtrack", "beat", "lyrics"],
    "sound-effects": ["sound effect", "sfx", "sound design", "ambient sound"],
    "requirements": ["requirements", "user stories", "acceptance criteria", "specification", "spec", "brd", "requirement analysis"],
    "architecture": ["architecture", "system design", "software architecture", "design the system", "solution design", "technical design", "components"],
    "code-feature": ["build a feature", "implement", "feature", "function", "component", "app", "website", "program"],
    "debug": ["bug", "debug", "error", "crash", "not working", "exception", "stack trace", "fix code", "broken"],
    "code-review": ["code review", "review my code", "pull request", "review code", "pr review"],
    "refactor": ["refactor", "clean up code", "restructure code", "technical debt", "simplify code"],
    "api-design": ["api design", "design an api", "endpoint", "rest api", "openapi", "swagger", "graphql schema"],
    "tech-docs": ["documentation", "readme", "technical docs", "developer docs", "api docs", "docs"],
    "test-plan": ["test plan", "test strategy", "qa plan", "release testing", "testing plan"],
    "test-cases": ["test cases", "test scenarios", "test case", "scenarios", "bdd", "gherkin", "given when then"],
    "api-testing": ["api test", "api testing", "postman", "contract test", "endpoint tests"],
    "test-automation": ["test automation", "automate tests", "playwright", "selenium", "cypress", "automation script", "automated tests"],
    "regression": ["regression", "regression plan", "regression suite", "smoke test", "retest"],
    "defect": ["defect", "bug report", "defect report", "issue report", "root cause"],
    "performance-test": ["performance test", "load test", "stress test", "jmeter", "k6", "performance testing"],
    "research-plan": ["research plan", "research question", "methodology", "study design", "research proposal", "thesis plan"],
    "literature-review": ["literature review", "papers", "academic sources", "related work", "systematic review"],
    "data-analysis": ["data analysis", "analyse data", "analyze data", "sql", "excel", "power bi", "dax", "spreadsheet", "formula", "query"],
    "dashboard": ["dashboard", "kpi", "kpis", "performance dashboard", "sales dashboard", "report page", "visualisation", "visualization", "scorecard", "power bi report"],
    "market-research": ["market research", "competitor", "competitors", "competitor analysis", "market size", "customer research"],
    "report": ["report", "findings", "write up results", "summary report", "status report"],
    "doc-summary": ["summarise", "summarize", "summary", "pdf", "document", "contract", "key points", "extract information", "tldr"],
    "review-draft": ["review my draft", "feedback on", "improve my", "critique", "review draft", "make it better"],
    "fix-accuracy": ["proofread", "fact check", "check accuracy", "grammar", "check my", "correct errors"],
    "adapt-audience": ["rewrite for", "simplify", "adapt", "translate", "make it simpler", "for kids", "for beginners", "change the tone"],
    "project-plan": ["project plan", "plan a project", "roadmap", "milestones", "launch plan", "step by step plan"],
    "learning-plan": ["learn", "learning plan", "study plan", "course", "teach me", "syllabus", "revise for exam"],
    "interview-prep": ["interview", "job interview", "interview questions", "mock interview", "prepare for interview"],
    "presentation": ["presentation", "slides", "deck", "proposal", "pitch", "powerpoint"],
    "seo-audit": ["seo audit", "site audit", "technical seo", "search console", "on-page seo"],
    "keyword-research": ["keyword research", "keywords", "search terms", "keyword plan"],
    "campaign-plan": ["campaign", "marketing campaign", "ad campaign", "campaign plan", "launch campaign"],
    "sales-outreach": ["cold email", "outreach", "sales email", "prospecting", "follow-up sequence"],
    "discovery-call": ["discovery call", "sales call", "qualification", "prospect call"],
    "business-plan": ["business plan", "startup plan", "loan application plan"],
    "prd": ["prd", "product requirements", "requirements document", "feature spec", "product spec"],
    "status-report": ["status report", "project update", "weekly update", "progress report"],
    "risk-register": ["risk register", "project risks", "risk log", "raid log"],
    "job-description": ["job description", "job posting", "job advert", "hiring post"],
    "hiring-interview": ["hiring panel", "interview plan", "interview scorecard", "candidate interview"],
    "onboarding-plan": ["onboarding", "new hire", "first 90 days", "new joiner"],
    "hr-policy": ["hr policy", "company policy", "leave policy", "employee policy"],
    "support-reply": ["customer reply", "support reply", "complaint reply", "reply to customer"],
    "kb-article": ["help article", "knowledge base", "help centre", "help center", "faq article"],
    "ticket-analysis": ["support tickets", "ticket analysis", "contact reasons", "ticket trends"],
    "lesson-plan": ["lesson plan", "lesson", "teaching plan", "class plan"],
    "assessment": ["quiz", "test paper", "exam questions", "assessment"],
    "rubric": ["rubric", "marking scheme", "grading criteria"],
    "explain-concept": ["explain", "understand", "teach me", "concept", "study help"],
    "ux-research-plan": ["user research", "user interviews", "research plan for users"],
    "usability-test": ["usability test", "usability testing", "user testing", "prototype test"],
    "user-flow": ["user flow", "user journey", "flow diagram", "task flow", "screen flow", "journey map"],
    "ux-review": ["ux review", "ux audit", "accessibility review", "heuristic evaluation"],
    "design-handoff": ["design handoff", "handoff", "design spec", "figma handoff", "dev handoff"],
    "incident": ["incident", "outage", "server down", "troubleshoot server", "production issue"],
    "ops-script": ["powershell", "bash script", "shell script", "admin script", "automation script"],
    "runbook": ["runbook", "sop", "operating procedure", "playbook for on-call"],
    "change-plan": ["change plan", "upgrade plan", "migration plan", "maintenance window"],
    "financial-analysis": ["financial analysis", "ratio analysis", "profit and loss", "financial statements"],
    "budget-forecast": ["budget", "forecast", "financial model", "cash flow forecast"],
    "variance-analysis": ["variance", "budget vs actual", "budget versus actual"],
    "reconciliation": ["reconciliation", "reconcile", "bank reconciliation"],
    "contract-review": ["contract review", "review contract", "agreement review", "nda review"],
    "legal-research": ["legal research", "legal memo", "case research"],
    "clause-draft": ["contract clause", "clause", "draft clause", "indemnity clause"]
};

/* the other AI tools: a description that names their job offers them beside the tasks */
export const UTILITIES = Object.freeze([
    { id: "bug-report-prompt", title: "Bug Report to Debugging Prompt", words: ["bug report", "stack trace", "error message", "logs"] },
    { id: "context-pack-builder", title: "AI Context Bridge", words: ["context", "handoff", "hand over", "switch to claude", "switch to chatgpt", "continue in", "new chat", "project context", "carry", "agents md", "claude md"] },
    { id: "ai-answer-checklist", title: "AI Output Reviewer", words: ["check an answer", "check the answer", "review an answer", "ai answer", "is this correct", "verify answer", "hallucination", "review output"] },
    { id: "ai-answer-compare", title: "Compare Two AI Answers", words: ["compare answers", "two answers", "compare two", "which answer"] },
    { id: "meeting-notes-action-plan", title: "Meeting Notes to Action Plan", words: ["meeting notes", "minutes", "action items", "action plan"] },
    { id: "ai-directory", title: "AI Directory", words: ["which ai", "which tool", "best ai", "ai product", "ai tool for", "what ai"] }
]);

const OUTCOME_TITLES = {
    content: "Create content", images: "Create images", video: "Create videos", audio: "Create audio", software: "Build software",
    research: "Research and analyse", improve: "Improve existing work", plan: "Plan a multi-step workflow"
};

const STOP = new Set(["a", "an", "the", "for", "to", "of", "and", "or", "my", "me", "i", "we", "our", "on", "in", "with", "from", "about", "this", "that", "it", "is", "be", "do", "need", "want", "help", "make", "create", "write", "some", "new", "please", "can", "you", "how", "get", "use"]);

/** lower case letters and digits; a light stem so "tests", "testing" and "test" compare equal */
export function normalise(text) {

    return String(text ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().split(" ").filter(Boolean).map(stem);

}

function stem(word) {

    if (word.length >= 6 && word.endsWith("ing")) return word.slice(0, -3);
    if (word.length >= 5 && word.endsWith("ies")) return `${word.slice(0, -3)}y`;
    if (word.length >= 5 && word.endsWith("es") && /(?:ss|sh|ch|x)es$/.test(word)) return word.slice(0, -2);
    if (word.length >= 4 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
    return word;

}

const contains = (words, phrase) => {

    if (phrase.length === 0 || phrase.length > words.length) return false;

    for (let i = 0; i + phrase.length <= words.length; i += 1) {
        if (phrase.every((w, j) => words[i + j] === w)) return true;
    }

    return false;

};

function scoreOf(words, synonyms, title, outcomeTitle) {

    let score = 0;
    const used = new Set();
    const seen = new Set();

    for (const term of synonyms) {
        const phrase = normalise(term).filter((w) => !STOP.has(w));
        const key = phrase.join(" ");
        if (seen.has(key)) continue; // "test plan" and "testing plan" are one phrase after the stem
        seen.add(key);
        if (contains(words, phrase)) {
            score += phrase.length >= 2 ? 3 : 2;
            for (const w of phrase) used.add(w);
        }
    }

    for (const w of new Set(normalise(title))) {
        if (!STOP.has(w) && !used.has(w) && words.includes(w)) score += 1;
    }

    for (const w of new Set(normalise(outcomeTitle))) {
        if (!STOP.has(w) && words.includes(w)) score += 0.5;
    }

    return score;

}

/*
 * Matches for a description: { tasks: [{ id, outcome, title, score }], utilities: [{ id, title, route }], confident }.
 * Up to three tasks, best first, then catalog order; `confident` when the best scores at least 3 and at least 1.5 times
 * the second. The visitor always chooses.
 */
export function matchTasks(text) {

    const words = normalise(text).filter((w) => !STOP.has(w));

    if (!words.length) return { tasks: [], utilities: [], confident: false };

    const scored = TASKS
        .map((t, order) => ({ id: t.id, outcome: t.outcome, title: t.title, order, score: scoreOf(words, SYNONYMS[t.id] ?? [], t.title, OUTCOME_TITLES[t.outcome]) }))
        .filter((t) => t.score >= 1)
        .sort((a, b) => b.score - a.score || a.order - b.order)
        .slice(0, 3)
        .map(({ order, ...t }) => t);

    const utilities = UTILITIES
        .filter((u) => u.words.some((term) => contains(words, normalise(term).filter((w) => !STOP.has(w)))))
        .map(({ id, title }) => ({ id, title, route: id === "ai-directory" ? ROUTES.aiDirectory : ROUTES.tool("tools", id) }));

    const [first, second] = scored;
    const confident = Boolean(first) && first.score >= 3 && (!second || first.score >= second.score * 1.5);

    return { tasks: scored, utilities, confident };

}

export const SYNONYM_TASKS = Object.freeze(Object.keys(SYNONYMS));

/** true when every task has synonyms and every synonym entry names a task (a unit test keeps them in step) */
export const indexCovers = () => TASKS.every((t) => SYNONYMS[t.id]?.length) && SYNONYM_TASKS.every((id) => getTask(id));
