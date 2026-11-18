/* =========================================================
   ToolZen Hub
   AI Workbench: outcomes and tasks (Tool Pack 58)

   The first question is the outcome ("What do you want to
   accomplish with AI?"), then a specific task. Each task names the
   blueprint family that holds its questions, stages and checks
   (blueprints/<family>.js, loaded only when the task is chosen).
   Professions are context inside a task, never a task of their own.
   Pure data; no DOM.
========================================================= */

export const OUTCOMES = Object.freeze([
    { id: "content", title: "Create content", text: "Articles, posts, emails, scripts and marketing copy" },
    { id: "images", title: "Create images", text: "Generate or edit images, product photos, thumbnails" },
    { id: "video", title: "Create videos", text: "Concepts, scripts, storyboards, AI video" },
    { id: "audio", title: "Create audio", text: "Voiceovers, podcasts, music, sound effects" },
    { id: "software", title: "Build software", text: "Requirements, code, debugging, reviews, testing" },
    { id: "research", title: "Research and analyse", text: "Research plans, documents, data, reports" },
    { id: "improve", title: "Improve existing work", text: "Review, correct or adapt something you have" },
    { id: "plan", title: "Plan a multi-step workflow", text: "Projects, learning plans, interviews, proposals" },
    { id: "unsure", title: "I'm not sure. Help me choose", text: "Describe what you want in a few words" }
]);

/* in display order within each outcome; `family` is the blueprint module */
export const TASKS = Object.freeze([

    { id: "article", outcome: "content", family: "content", title: "An article or blog post" },
    { id: "social-posts", outcome: "content", family: "content", title: "Social media posts" },
    { id: "marketing-copy", outcome: "content", family: "content", title: "Marketing or product copy" },
    { id: "script", outcome: "content", family: "content", title: "A script for a video or podcast" },
    { id: "repurpose", outcome: "content", family: "content", title: "Repurpose content for another format" },
    { id: "email-message", outcome: "content", family: "content", title: "Write or reply to an email or message" },

    { id: "image-generate", outcome: "images", family: "images", title: "Generate a new image" },
    { id: "image-edit", outcome: "images", family: "images", title: "Edit an existing image" },
    { id: "product-photo", outcome: "images", family: "images", title: "A product photo" },
    { id: "thumbnail", outcome: "images", family: "images", title: "A thumbnail or banner" },
    { id: "image-series", outcome: "images", family: "images", title: "A character or illustration series (consistent look)" },
    { id: "graphic-design", outcome: "images", family: "design", title: "A graphic design brief" },

    { id: "video-concept", outcome: "video", family: "video", title: "A video concept and script" },
    { id: "storyboard", outcome: "video", family: "video", title: "A storyboard and shot list" },
    { id: "text-to-video", outcome: "video", family: "video", title: "AI video from a description (text to video)" },
    { id: "image-to-video", outcome: "video", family: "video", title: "Animate an image (image to video)" },

    { id: "voiceover", outcome: "audio", family: "audio", title: "Narration or a voiceover (text to speech)" },
    { id: "podcast", outcome: "audio", family: "audio", title: "A podcast episode" },
    { id: "music", outcome: "audio", family: "audio", title: "A music track" },
    { id: "sound-effects", outcome: "audio", family: "audio", title: "Sound effects" },

    { id: "requirements", outcome: "software", family: "software", title: "Analyse requirements" },
    { id: "architecture", outcome: "software", family: "software", title: "A software architecture design" },
    { id: "code-feature", outcome: "software", family: "software", title: "Write code for a feature" },
    { id: "debug", outcome: "software", family: "software", title: "Debug a problem" },
    { id: "code-review", outcome: "software", family: "software", title: "Review code" },
    { id: "refactor", outcome: "software", family: "software", title: "Refactor code" },
    { id: "api-design", outcome: "software", family: "software", title: "Design or document an API" },
    { id: "tech-docs", outcome: "software", family: "software", title: "Write technical documentation" },
    { id: "test-plan", outcome: "software", family: "testing", title: "Testing: a test plan" },
    { id: "test-cases", outcome: "software", family: "testing", title: "Testing: test scenarios and test cases" },
    { id: "api-testing", outcome: "software", family: "testing", title: "Testing: API tests" },
    { id: "test-automation", outcome: "software", family: "testing", title: "Testing: automate tests" },
    { id: "regression", outcome: "software", family: "testing", title: "Testing: a regression plan" },
    { id: "defect", outcome: "software", family: "testing", title: "Testing: a defect report and analysis" },
    { id: "performance-test", outcome: "software", family: "testing", title: "Testing: a performance test plan" },

    { id: "research-plan", outcome: "research", family: "research", title: "Plan a piece of research" },
    { id: "literature-review", outcome: "research", family: "research", title: "A literature review" },
    { id: "data-analysis", outcome: "research", family: "research", title: "Analyse data (SQL, Excel, Power BI or DAX)" },
    { id: "market-research", outcome: "research", family: "research", title: "Market or competitor research" },
    { id: "dashboard", outcome: "research", family: "research", title: "A business performance dashboard" },
    { id: "report", outcome: "research", family: "research", title: "A report from findings" },
    { id: "doc-summary", outcome: "research", family: "research", title: "Summarise or pull information from a document" },

    { id: "review-draft", outcome: "improve", family: "improve", title: "Review and improve a draft" },
    { id: "fix-accuracy", outcome: "improve", family: "improve", title: "Check accuracy and clarity" },
    { id: "adapt-audience", outcome: "improve", family: "improve", title: "Adapt it for another audience or format" },

    { id: "project-plan", outcome: "plan", family: "plan", title: "Plan a project with AI, step by step" },
    { id: "learning-plan", outcome: "plan", family: "plan", title: "A learning plan" },
    { id: "interview-prep", outcome: "plan", family: "plan", title: "Prepare for an interview" },
    { id: "presentation", outcome: "plan", family: "plan", title: "A presentation or proposal" },

    /* professions the first catalogue did not cover (AI programme D18, 20-ROLES-TASKS-TOOLS.md) */
    { id: "seo-audit", outcome: "research", family: "marketing", title: "An SEO audit" },
    { id: "keyword-research", outcome: "research", family: "marketing", title: "Keyword research" },
    { id: "campaign-plan", outcome: "plan", family: "marketing", title: "A marketing campaign plan" },

    { id: "sales-outreach", outcome: "content", family: "business", title: "A sales outreach sequence" },
    { id: "discovery-call", outcome: "plan", family: "business", title: "Prepare a sales discovery call" },
    { id: "business-plan", outcome: "plan", family: "business", title: "A business plan" },
    { id: "prd", outcome: "plan", family: "business", title: "A product requirements document" },
    { id: "status-report", outcome: "plan", family: "business", title: "A project status report" },
    { id: "risk-register", outcome: "plan", family: "business", title: "A project risk register" },

    { id: "job-description", outcome: "content", family: "people", title: "A job description" },
    { id: "hiring-interview", outcome: "plan", family: "people", title: "An interview plan for a hiring panel" },
    { id: "onboarding-plan", outcome: "plan", family: "people", title: "An onboarding plan for a new hire" },
    { id: "hr-policy", outcome: "content", family: "people", title: "An HR policy draft" },
    { id: "support-reply", outcome: "content", family: "people", title: "A customer support reply" },
    { id: "kb-article", outcome: "content", family: "people", title: "A help-centre article" },
    { id: "ticket-analysis", outcome: "research", family: "people", title: "Analyse support tickets" },

    { id: "lesson-plan", outcome: "plan", family: "education", title: "A lesson plan" },
    { id: "assessment", outcome: "content", family: "education", title: "A quiz or assessment" },
    { id: "rubric", outcome: "content", family: "education", title: "A marking rubric" },
    { id: "explain-concept", outcome: "research", family: "education", title: "Explain a concept I am learning" },

    { id: "ux-research-plan", outcome: "research", family: "design", title: "A user research plan" },
    { id: "usability-test", outcome: "research", family: "design", title: "A usability test plan" },
    { id: "user-flow", outcome: "plan", family: "design", title: "A user flow" },
    { id: "ux-review", outcome: "improve", family: "design", title: "A UX and accessibility review" },
    { id: "design-handoff", outcome: "software", family: "design", title: "A design handoff specification" },

    { id: "incident", outcome: "software", family: "operations", title: "Troubleshoot a system incident" },
    { id: "ops-script", outcome: "software", family: "operations", title: "An admin script (PowerShell or Bash)" },
    { id: "runbook", outcome: "software", family: "operations", title: "A runbook or operating procedure" },
    { id: "change-plan", outcome: "plan", family: "operations", title: "An infrastructure change plan" },

    { id: "financial-analysis", outcome: "research", family: "finance", title: "A financial analysis" },
    { id: "budget-forecast", outcome: "plan", family: "finance", title: "A budget or forecast" },
    { id: "variance-analysis", outcome: "research", family: "finance", title: "A budget-versus-actual variance analysis" },
    { id: "reconciliation", outcome: "research", family: "finance", title: "An account reconciliation check" },

    { id: "contract-review", outcome: "improve", family: "legal", title: "A contract review checklist" },
    { id: "legal-research", outcome: "research", family: "legal", title: "A legal research memo" },
    { id: "clause-draft", outcome: "content", family: "legal", title: "Draft or revise a contract clause" }

]);

export const FAMILIES = Object.freeze(["content", "images", "video", "audio", "software", "testing", "research", "improve", "plan", "marketing", "business", "people", "education", "design", "operations", "finance", "legal"]);

export const getOutcome = (id) => OUTCOMES.find((o) => o.id === id) ?? null;
export const getTask = (id) => TASKS.find((t) => t.id === id) ?? null;
export const tasksFor = (outcomeId) => TASKS.filter((t) => t.outcome === outcomeId);

/* Professional context offered after the task, by outcome. Optional; "Skip" is always the first choice. */
export const ROLES = Object.freeze({
    content: ["Content creator", "Blogger", "Copywriter", "YouTube creator", "Marketing specialist", "Student"],
    images: ["Graphic designer", "Content creator", "Marketing specialist", "Small business owner"],
    video: ["Video editor", "YouTube creator", "Content creator", "Marketing specialist"],
    audio: ["Audio producer", "Podcaster", "Content creator", "Video editor"],
    software: ["Frontend developer", "Backend developer", "Full-stack developer", "Mobile developer", "Software architect", "DevOps engineer", "Security engineer", "Manual QA tester", "Automation QA engineer", "API tester", "SDET", "Performance tester", "QA lead or test manager", "Student"],
    research: ["Academic researcher", "PhD scholar", "Research analyst", "Data or BI analyst", "Business analyst", "Student"],
    improve: ["Writer or editor", "Developer", "Student", "Business professional"],
    plan: ["Project manager", "Product manager", "Business analyst", "Consultant", "Entrepreneur", "Operations manager", "Student", "Job seeker"]
});

export const EXPERIENCE = Object.freeze([
    { id: "", label: "Skip" },
    { id: "beginner", label: "Beginner" },
    { id: "intermediate", label: "Intermediate" },
    { id: "experienced", label: "Experienced" },
    { id: "senior", label: "Senior" },
    { id: "specialist", label: "Specialist or architect" }
]);

export const DEPTHS = Object.freeze([
    { id: "", label: "Suggested for this task" },
    { id: "short", label: "Short: one prompt" },
    { id: "standard", label: "Standard: a prompt and a few stages" },
    { id: "detailed", label: "Detailed: more control and a final review" },
    { id: "multi", label: "Multi-stage: every stage of the workflow" }
]);

/*
 * "I'm not sure": a plain description is matched against a few words per outcome. The first outcome with the most hits is
 * suggested, and the visitor confirms it; nothing is chosen for them. Empty when nothing matches.
 */
const OUTCOME_WORDS = {
    content: ["article", "blog", "post", "caption", "copy", "newsletter", "linkedin", "instagram", "tweet", "write", "essay", "content"],
    images: ["image", "picture", "photo", "logo", "illustration", "thumbnail", "banner", "poster", "drawing", "character"],
    video: ["video", "reel", "short", "youtube", "animation", "animate", "film", "clip", "storyboard"],
    audio: ["audio", "voice", "voiceover", "narration", "podcast", "music", "song", "sound", "speech"],
    software: ["code", "app", "website", "bug", "api", "test", "testing", "qa", "program", "software", "function", "script", "deploy", "automation"],
    research: ["research", "study", "data", "analysis", "analyse", "analyze", "sql", "excel", "power bi", "dax", "survey", "market", "report", "literature", "thesis"],
    improve: ["improve", "fix", "review", "edit", "proofread", "rewrite", "better", "check", "polish"],
    plan: ["plan", "learn", "course", "interview", "presentation", "proposal", "project", "roadmap", "workflow", "steps", "career"]
};

export function suggestOutcome(text) {

    const words = ` ${String(text ?? "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ")} `;
    let best = null;
    let bestHits = 0;

    for (const [outcome, list] of Object.entries(OUTCOME_WORDS)) {
        const hits = list.filter((w) => words.includes(` ${w} `) || words.includes(` ${w}s `)).length;
        if (hits > bestHits) {
            best = outcome;
            bestHits = hits;
        }
    }

    return best;

}
