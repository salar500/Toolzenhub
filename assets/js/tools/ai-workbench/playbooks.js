/* =========================================================
   ToolZen Hub
   AI Workbench: playbook starters (AI ecosystem programme, 16 D14)

   A starter is a recurring piece of work broken into Workbench
   tasks, each with a depth and a few generic answers (choices,
   never project facts). Choosing a step opens that task and fills
   only the fields that are still empty. The visitor's own
   playbook is a downloaded Work Pack, opened again (pack-format).
   Reviewed with the blueprints, at least every six months.
========================================================= */

export const PLAYBOOKS_REVIEWED = "2026-11-16";

export const PLAYBOOKS = Object.freeze([
    {
        id: "newsletter",
        title: "Weekly article or newsletter",
        purpose: "Write the piece, then turn it into posts.",
        steps: [
            { task: "article", depth: "detailed", answers: { purpose: "Explain or teach" } },
            { task: "repurpose", depth: "standard", answers: { target: "Social posts" } }
        ]
    },
    {
        id: "youtube",
        title: "YouTube video from idea to upload",
        purpose: "Concept, script and thumbnail for one video.",
        steps: [
            { task: "video-concept", depth: "standard", answers: {} },
            { task: "script", depth: "standard", answers: {} },
            { task: "thumbnail", depth: "short", answers: {} }
        ]
    },
    {
        id: "release-testing",
        title: "Release testing",
        purpose: "Plan, cases, regression and defects for one release.",
        steps: [
            { task: "test-plan", depth: "detailed", answers: { scope: "Functional and regression" } },
            { task: "test-cases", depth: "standard", answers: {} },
            { task: "regression", depth: "standard", answers: {} },
            { task: "defect", depth: "short", answers: {} }
        ]
    },
    {
        id: "api-cycle",
        title: "API test cycle",
        purpose: "Design the API tests, then automate them.",
        steps: [
            { task: "api-testing", depth: "standard", answers: {} },
            { task: "test-automation", depth: "standard", answers: {} }
        ]
    },
    {
        id: "bug-investigation",
        title: "Bug investigation",
        purpose: "Investigate in stages; for one bug with its error and steps, the Bug Report tool is faster.",
        steps: [
            { task: "debug", depth: "multi", answers: {} }
        ]
    },
    {
        id: "feature",
        title: "Feature from requirements to review",
        purpose: "Clarify, build and review one feature.",
        steps: [
            { task: "requirements", depth: "standard", answers: {} },
            { task: "code-feature", depth: "detailed", answers: {} },
            { task: "code-review", depth: "standard", answers: {} }
        ]
    },
    {
        id: "research-report",
        title: "Research report",
        purpose: "Plan, review the literature, then report.",
        steps: [
            { task: "research-plan", depth: "detailed", answers: {} },
            { task: "literature-review", depth: "standard", answers: {} },
            { task: "report", depth: "standard", answers: {} }
        ]
    },
    {
        id: "monthly-report",
        title: "Monthly business report",
        purpose: "Analyse the month's data, write the report, present it.",
        steps: [
            { task: "data-analysis", depth: "standard", answers: {} },
            { task: "report", depth: "standard", answers: {} },
            { task: "presentation", depth: "standard", answers: {} }
        ]
    },
    {
        id: "meeting-follow-up",
        title: "Meeting follow-up",
        purpose: "Turn the notes into actions with the Meeting Notes tool, then send the follow-up.",
        steps: [
            { task: "email-message", depth: "short", answers: { kind: "A new message" } }
        ]
    },
    {
        id: "image-series",
        title: "Consistent image series",
        purpose: "Several images with the same character and look.",
        steps: [
            { task: "image-series", depth: "standard", answers: {} }
        ]
    }
]);

export const getPlaybook = (id) => PLAYBOOKS.find((p) => p.id === id) ?? null;
