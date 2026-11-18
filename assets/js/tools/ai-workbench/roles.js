/* =========================================================
   ToolZen Hub
   AI Workbench: professions (AI programme D18; research in
   docs/ecosystem-review/ai-ecosystem/20-ROLES-TASKS-TOOLS.md)

   "Start from your profession": 20 professions in 6 groups. Each
   lists the Workbench tasks that are part of that work, in the
   order they are most often needed. The title is written into
   the prompt as "I work as a ...". The tools each profession uses
   are in tools.js (ROLE_TOOLS), loaded with the tool step. Data
   only; loaded with the page for the guided panel's first step.
========================================================= */

export const ROLE_GROUPS = [
    { id: "tech", title: "Technology and IT" },
    { id: "marketing", title: "Marketing and content" },
    { id: "business", title: "Business and management" },
    { id: "education", title: "Education and research" },
    { id: "design-people", title: "Design and people" },
    { id: "professional", title: "Finance and legal" },
    { id: "creative", title: "Creative and media" }
];

const r = (id, group, title, tasks) => ({ id, group, title, tasks });

export const ROLES = [
    r("developer", "tech", "Software developer",
        ["requirements", "architecture", "code-feature", "debug", "code-review", "refactor", "api-design", "tech-docs", "incident"]),
    r("qa", "tech", "QA engineer or software tester",
        ["test-plan", "test-cases", "api-testing", "test-automation", "regression", "defect", "performance-test", "requirements"]),
    r("data", "tech", "Data analyst",
        ["data-analysis", "dashboard", "report", "doc-summary", "research-plan", "presentation", "status-report"]),
    r("sysadmin", "tech", "IT or system administrator",
        ["incident", "ops-script", "runbook", "change-plan", "debug", "tech-docs"]),

    r("marketer", "marketing", "Digital marketer",
        ["seo-audit", "keyword-research", "campaign-plan", "marketing-copy", "social-posts", "market-research", "report"]),
    r("writer", "marketing", "Content writer or blogger",
        ["article", "script", "social-posts", "keyword-research", "repurpose", "email-message", "review-draft", "fix-accuracy"]),
    r("techwriter", "marketing", "Technical writer",
        ["tech-docs", "api-design", "kb-article", "review-draft", "fix-accuracy", "adapt-audience", "doc-summary"]),

    r("ba", "business", "Business analyst",
        ["requirements", "prd", "data-analysis", "dashboard", "doc-summary", "report", "presentation", "risk-register"]),
    r("owner", "business", "Entrepreneur or small business owner",
        ["business-plan", "marketing-copy", "social-posts", "market-research", "email-message", "presentation", "budget-forecast", "support-reply"]),
    r("sales", "business", "Sales or business development",
        ["sales-outreach", "discovery-call", "presentation", "email-message", "market-research", "report"]),
    r("pm", "business", "Project manager",
        ["project-plan", "status-report", "risk-register", "presentation", "email-message", "report"]),
    r("product", "business", "Product manager",
        ["prd", "requirements", "user-flow", "market-research", "ux-research-plan", "presentation", "status-report", "data-analysis"]),

    r("student", "education", "Student",
        ["explain-concept", "learning-plan", "literature-review", "doc-summary", "presentation", "review-draft", "interview-prep"]),
    r("teacher", "education", "Teacher or educator",
        ["lesson-plan", "assessment", "rubric", "adapt-audience", "presentation", "learning-plan"]),
    r("researcher", "education", "Researcher",
        ["research-plan", "literature-review", "data-analysis", "report", "doc-summary", "fix-accuracy"]),

    r("designer", "design-people", "UI/UX designer",
        ["ux-research-plan", "user-flow", "usability-test", "ux-review", "design-handoff", "presentation"]),
    r("hr", "design-people", "HR or recruiter",
        ["job-description", "hiring-interview", "onboarding-plan", "hr-policy", "email-message"]),
    r("support", "design-people", "Customer support",
        ["support-reply", "kb-article", "ticket-analysis", "email-message"]),

    r("finance", "professional", "Finance or accounting professional",
        ["financial-analysis", "budget-forecast", "variance-analysis", "reconciliation", "report", "presentation"]),
    r("legal", "professional", "Legal professional",
        ["contract-review", "legal-research", "clause-draft", "doc-summary", "fix-accuracy"]),

    /* D21: the image, video and audio tasks had no profession, so the guided panel could not reach them */
    r("creator", "creative", "Video, audio or podcast creator",
        ["video-concept", "script", "storyboard", "text-to-video", "image-to-video", "voiceover", "podcast", "music", "sound-effects", "thumbnail"]),
    r("graphic", "creative", "Graphic designer",
        ["graphic-design", "image-generate", "image-edit", "product-photo", "image-series", "thumbnail", "presentation", "social-posts"])
];

export const getRole = (id) => ROLES.find((x) => x.id === id) ?? null;
