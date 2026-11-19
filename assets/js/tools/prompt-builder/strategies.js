/* =========================================================
   ToolZen Hub
   AI Prompt Builder: professional strategies (AI programme D21;
   docs/ecosystem-review/ai-ecosystem/24-STRATEGY-ENGINE.md)

   The same task can be done in several legitimate professional
   ways. A strategy is three reusable parts: an approach (the
   methodology, per task family, optionally limited to some tasks),
   an emphasis (cross-cutting) and the audience the deliverables are
   written for. Each part adds its own instructions to the prompt;
   contradictory parts are never combined. Every combination has a
   stable id, so the same choices give the same prompt, and
   "another approach" walks the valid combinations in a fixed
   order. No randomness; data and pure functions only. Loaded with
   the method engine, never on the page's first load.
========================================================= */

export const STRATEGY_VERSION = "s1";

/* approaches per family: { id, label, why, lines, tasks? (only these), not? (all but these), conflicts? (emphasis or audience ids) } */
const APPROACHES = {

    testing: [
        { id: "risk", label: "Risk-based", why: "Effort follows the likelihood and impact of failure.", lines: ["Rank features, flows and requirements by likelihood of failure and impact on users or the business, and spend effort in that order.", "Tie every priority to a named risk, and say which low-risk areas get the least testing and why."] },
        { id: "trace", label: "Requirements traceability", why: "Every test comes from a requirement, and every requirement is covered.", lines: ["Number each requirement or acceptance criterion and derive every test from one of them.", "Keep a two-way traceability table (requirement to tests, test to requirement) and report gaps and untestable requirements first."] },
        { id: "process", label: "Business-process-driven", why: "Tests follow real end-to-end journeys and hand-offs.", lines: ["Model the end-to-end business processes and user journeys first, including every role and system involved.", "Test the hand-offs between steps, roles and systems, where most process failures happen, before isolated functions."], not: ["defect"] },
        { id: "explore", label: "Exploratory-testing-led", why: "Time-boxed charters find what scripts miss.", lines: ["Plan the work as time-boxed exploratory charters: mission, area, risks to probe, data and heuristics to use.", "Keep scripted checks for the critical paths only, and say how session notes, findings and defects are recorded."], tasks: ["test-plan", "test-cases", "regression", "api-testing"], conflicts: ["audit"] },
        { id: "comply", label: "Compliance-focused", why: "Tests produce evidence against the rules that apply.", lines: ["Map each regulation, standard or contractual rule I name to the tests that show it is met; ask me which rules apply rather than assuming them.", "Make every test produce evidence: what was checked, against which rule, the result and where the evidence is kept."], conflicts: ["lean"] },
        { id: "automate", label: "Automation-oriented", why: "Designed so the valuable checks can run on every build.", lines: ["For each test, decide automate or keep manual (automate what is stable, repeated and high value) and say why.", "Design for automation: stable identifiers, test data created through the API, independent tests and a clear place in the CI pipeline."], not: ["defect"] },
        { id: "negative", label: "Negative and robustness-focused", why: "Breaks the rules before confirming the happy path.", lines: ["Put invalid input, boundaries, error paths, permissions, concurrency and failing dependencies ahead of the main path.", "For every rule, ask how it can be broken, by mistake or on purpose, and design a test for each way."] },
        { id: "release", label: "Release-readiness", why: "Organised around the go or no-go decision.", lines: ["Organise the work around the release decision: exit criteria, coverage of what changed, open defects by severity and residual risks.", "End with a go, no-go or go-with-conditions recommendation and the evidence for it; the release owner decides."], tasks: ["test-plan", "regression", "performance-test", "test-automation"] }
    ],

    software: [
        { id: "arch", label: "Architecture-first", why: "Structure and boundaries before details.", lines: ["Settle the structure first: components, boundaries, responsibilities and interfaces, and where this work sits in them.", "Explain each detailed choice in terms of that structure."] },
        { id: "contract", label: "API- and contract-first", why: "Interfaces are agreed before code.", lines: ["Define the interfaces and contracts first (inputs, outputs, errors, versions) and build to them.", "Add contract tests so either side can change without breaking the other."], tasks: ["api-design", "code-feature", "architecture", "requirements", "refactor"] },
        { id: "secure", label: "Security-first", why: "Threats are treated as requirements.", lines: ["Start with a short threat model: assets, entry points, who might attack and how.", "Turn each threat into a requirement or a test: validated input, least privilege, secrets out of code and logs, safe defaults."] },
        { id: "perf", label: "Performance-first", why: "Measured targets drive the design.", lines: ["Set measurable performance targets and identify the hot paths before designing or changing code.", "Measure before and after every change; no optimisation without a measurement that shows it is needed."] },
        { id: "maintain", label: "Maintainability-first", why: "Optimised for the next developer.", lines: ["Optimise for whoever changes this next: small units, clear names, tests that document behaviour and no clever shortcuts.", "Record any technical debt taken on, with the reason and how to repay it."] },
        { id: "reliable", label: "Reliability-oriented", why: "Designed for failure.", lines: ["Design for failure: timeouts, retries with backoff only for idempotent operations, graceful degradation and clear failure states.", "Add the logs, metrics and alerts that would show the problem in production."], not: ["tech-docs", "requirements"] },
        { id: "cost", label: "Cost-aware", why: "The simplest option that meets the targets.", lines: ["Estimate the build and running cost of each option, including people's time.", "Prefer the simplest option that meets the targets, and name the cost risks of the others."], tasks: ["architecture", "api-design", "code-feature", "refactor"] },
        { id: "tdd", label: "Test-driven", why: "A failing test before each change.", lines: ["For each behaviour, write the failing test first, then the smallest code that passes it, then refactor with the tests green.", "Show the tests before the implementation."], tasks: ["code-feature", "debug", "refactor"] }
    ],

    research: [
        { id: "hypothesis", label: "Hypothesis-driven", why: "Tests stated hypotheses instead of searching for patterns.", lines: ["State the hypotheses up front and the evidence that would confirm or reject each.", "Analyse to test them, and report rejected hypotheses as findings too."] },
        { id: "explore", label: "Exploratory", why: "Lets the data suggest the questions.", lines: ["Profile the data or sources first (distributions, segments, outliers, gaps) and let the patterns suggest the questions.", "Label every finding as exploratory, to be confirmed with a focused analysis."], conflicts: ["audit"] },
        { id: "decision", label: "Decision-led", why: "Only what changes the decision.", lines: ["Start from the decision the reader must make and analyse only what could change it.", "End with a recommendation, its confidence and what would change it."] },
        { id: "metric", label: "Metric-definition-first", why: "Agreed definitions before any number.", lines: ["Define every metric before calculating it: meaning, formula, grain, filters and owner.", "Flag any metric with more than one accepted definition and ask which applies."], tasks: ["data-analysis", "dashboard", "report", "market-research"] },
        { id: "rigour", label: "Statistically rigorous", why: "Methods, assumptions and uncertainty stated.", lines: ["Name each statistical method, its assumptions and how they are checked.", "Report effect sizes and uncertainty (intervals), not only whether a result is significant."], tasks: ["data-analysis", "research-plan", "literature-review", "report"], conflicts: ["lean"] },
        { id: "story", label: "Insight storytelling", why: "Findings shaped into a narrative for action.", lines: ["Shape the findings as a narrative: context, complication, insight, action.", "One message per chart or section, with the evidence beside it."], tasks: ["report", "dashboard", "data-analysis", "market-research", "doc-summary"] }
    ],

    content: [
        { id: "research", label: "Research-led", why: "Built on evidence first.", lines: ["Gather and list the facts, examples and sources from my material before writing, and build the piece on them.", "Mark every claim that needs a source I have not given."] },
        { id: "story", label: "Story-driven", why: "A narrative arc carries the message.", lines: ["Carry the message with a narrative: a person or situation, a tension, a turning point, an outcome.", "Use concrete scenes and details from my material, never invented testimonials."] },
        { id: "teach", label: "Educational", why: "The reader learns to do something.", lines: ["Structure the piece so the reader learns: what it is, why it matters, how to do it, a worked example, a common mistake.", "Check each step can be followed without prior knowledge."] },
        { id: "seo", label: "Search-led", why: "Matches what people search for.", lines: ["Match the search intent of the main query: answer it early, then cover the related questions people ask.", "Use the topic's terms naturally in the title, headings and opening; never stuff keywords."], tasks: ["article", "repurpose", "marketing-copy"] },
        { id: "convert", label: "Conversion-led", why: "Moves the reader to one action.", lines: ["Write toward one action: the reader's problem, the specific benefit, the evidence, the objection answered, the call to action.", "Keep every claim to what I can prove."], tasks: ["marketing-copy", "social-posts", "email-message", "article", "script"] },
        { id: "native", label: "Platform-native", why: "Fits how the platform is used.", lines: ["Write for how people use the platform: its format, length, pace and conventions, rather than adapting a document.", "Check the platform's current limits instead of assuming them."], tasks: ["social-posts", "script", "repurpose", "video-concept", "storyboard"] },
        { id: "retain", label: "Retention-oriented", why: "Holds attention to the end.", lines: ["Plan attention: a hook at the start, a reason to continue before each change of section, and a payoff saved for the end.", "Remove anything that does not move the piece forward."], tasks: ["script", "video-concept", "storyboard", "podcast"] },
        { id: "documentary", label: "Documentary", why: "Shows real people and evidence.", lines: ["Tell it through real evidence: interviews, footage, documents and data I provide, with sources named.", "Keep what was observed apart from interpretation."], tasks: ["script", "video-concept", "storyboard", "podcast", "article"] }
    ],

    improve: [
        { id: "light", label: "Light edit", why: "Keeps the author's voice and structure.", lines: ["Make the smallest changes that fix clarity, accuracy and errors; keep the structure and the author's voice."] },
        { id: "structural", label: "Structural edit", why: "Reorganises for the reader.", lines: ["Reorganise for the reader first (order, sections, what comes first), then fix sentences."] },
        { id: "factcheck", label: "Evidence audit", why: "Every claim checked against a source.", lines: ["List every checkable claim with its source or mark it unsupported, before changing any wording."] }
    ],

    plan: [
        { id: "predictive", label: "Plan-driven", why: "A full baseline plan with change control.", lines: ["Build a complete baseline: work breakdown, estimates, dependencies, critical path and milestones.", "Put changes through a stated change-control step."], tasks: ["project-plan"] },
        { id: "agile", label: "Iterative", why: "Short cycles, each delivering something usable.", lines: ["Plan in short iterations, each ending with something usable and a review.", "Keep a prioritised backlog and re-plan after each iteration."], tasks: ["project-plan", "learning-plan"] },
        { id: "milestone", label: "Outcome and milestone-led", why: "Organised around outcomes, not activities.", lines: ["Organise the plan around outcomes and milestones that can be checked, not lists of activities.", "Give each milestone a measurable definition of done."] },
        { id: "riskfirst", label: "Risk-first", why: "The riskiest parts are tackled first.", lines: ["Identify the riskiest unknowns and schedule work that reduces them first."], tasks: ["project-plan", "learning-plan", "interview-prep"] },
        { id: "persuade", label: "Persuasive", why: "Built to win a decision.", lines: ["Build toward one decision: the problem, the proposal, the evidence, the objections answered and the ask."], tasks: ["presentation"] },
        { id: "inform", label: "Informative", why: "Built to be understood and remembered.", lines: ["Build for understanding: one idea per slide, a simple example for each, and a summary the audience can repeat."], tasks: ["presentation"] }
    ],

    marketing: [
        { id: "data", label: "Data-driven", why: "Decisions follow my exported numbers.", lines: ["Base every recommendation on the data I export and say which numbers support it.", "Where data is missing, say what to measure first."] },
        { id: "audience", label: "Audience-first", why: "Starts from the customer's job and words.", lines: ["Start from the audience: their situation, the job they are trying to get done, their objections and the words they use.", "Shape every message and channel choice around that."] },
        { id: "funnel", label: "Funnel-based", why: "A stage-by-stage path to conversion.", lines: ["Map the work to the stages of the funnel (awareness, consideration, conversion, retention) with a goal and a measure for each."], not: ["seo-audit"] },
        { id: "experiment", label: "Experiment-led", why: "Tests before scaling.", lines: ["Turn the main assumptions into experiments with a hypothesis, a metric, a sample and a stop rule.", "Scale only what the results support."] },
        { id: "content", label: "Content-led", why: "Earns attention with useful content.", lines: ["Earn attention with content that answers the audience's questions, then connect it to the offer."], tasks: ["seo-audit", "keyword-research", "campaign-plan"] },
        { id: "technical", label: "Technical-SEO-first", why: "Fixes crawling and indexing before content.", lines: ["Fix crawling, indexing, speed and structured data before content work, because content cannot rank on pages search engines cannot read."], tasks: ["seo-audit"] }
    ],

    business: [
        { id: "customer", label: "Customer-centred", why: "Starts from the customer's problem.", lines: ["Start from the customer's problem and evidence for it, and judge every element by what it does for them."] },
        { id: "value", label: "Value-based", why: "Quantifies value and cost.", lines: ["Express the value in the customer's or business's terms (time, money, risk) and set it against the cost, with each figure from my data or marked as an assumption."] },
        { id: "hypothesis", label: "Hypothesis-driven (lean)", why: "Tests the riskiest assumptions first.", lines: ["List the assumptions the plan depends on, and design the cheapest test of the riskiest one first."], tasks: ["business-plan", "prd"] },
        { id: "consult", label: "Consultative", why: "Questions before proposals.", lines: ["Lead with questions about the situation, problem, impact and decision process before proposing anything."], tasks: ["sales-outreach", "discovery-call"] },
        { id: "exec", label: "Executive-summary-led", why: "Decision first, details after.", lines: ["Open with the decision or status in three lines, then the evidence, then the detail."], tasks: ["status-report", "risk-register", "business-plan", "prd"] },
        { id: "outcome", label: "Outcome-based", why: "Measured by outcomes, not output.", lines: ["Define success as an outcome with a metric and a target, not a list of features or activities."], tasks: ["prd", "business-plan", "status-report"] }
    ],

    people: [
        { id: "competency", label: "Competency-based", why: "Everything tied to job competencies.", lines: ["Derive everything from the competencies the job needs and how each is evidenced."], tasks: ["job-description", "hiring-interview", "onboarding-plan"] },
        { id: "structured", label: "Structured and consistent", why: "The same process for everyone.", lines: ["Use the same structure, questions and criteria for everyone, with a written scoring or decision guide."], tasks: ["hiring-interview", "hr-policy", "job-description"] },
        { id: "experience", label: "Employee-experience-led", why: "Designed from the person's side.", lines: ["Design from the employee's or candidate's point of view: what they need to know, feel and be able to do at each point."], tasks: ["onboarding-plan", "job-description", "hr-policy"] },
        { id: "empathy", label: "Empathetic resolution", why: "Acknowledges the person, then solves.", lines: ["Acknowledge the person's situation in their terms before solving, and keep the tone human."], tasks: ["support-reply", "email-message"] },
        { id: "fcr", label: "First-contact resolution", why: "Solves it in one reply where possible.", lines: ["Aim to resolve in one reply: anticipate the follow-up questions and answer them now, with the exact steps."], tasks: ["support-reply", "kb-article"] },
        { id: "knowledge", label: "Knowledge-centred", why: "Each answer improves the knowledge base.", lines: ["Turn each answer into reusable knowledge: capture the problem in the customer's words, the cause and the fix."], tasks: ["kb-article", "ticket-analysis", "support-reply"] }
    ],

    education: [
        { id: "backward", label: "Backward design", why: "Outcomes and evidence before activities.", lines: ["Plan backward: first the outcomes, then the evidence that shows they are met, then the activities that lead there."] },
        { id: "inquiry", label: "Inquiry-based", why: "Learners investigate a question.", lines: ["Build the learning around a question learners investigate, with the teacher guiding rather than telling."], tasks: ["lesson-plan", "learning-plan", "explain-concept"] },
        { id: "direct", label: "Explicit instruction", why: "Model, guide, then independent practice.", lines: ["Teach explicitly: model, then guided practice with feedback, then independent practice, checking understanding at each step."], tasks: ["lesson-plan", "explain-concept", "learning-plan"] },
        { id: "differentiate", label: "Differentiated", why: "Different routes for different learners.", lines: ["Plan different routes to the same outcome: support, core and extension, each with its own task or question."] },
        { id: "mastery", label: "Mastery-based", why: "Move on only when it is mastered.", lines: ["Set a mastery threshold for each step and give a route back when it is not met."], tasks: ["learning-plan", "assessment", "rubric", "lesson-plan"] },
        { id: "formative", label: "Formative-assessment-led", why: "Frequent checks steer the teaching.", lines: ["Build frequent low-stakes checks into the work and say how each result changes what happens next."] }
    ],

    design: [
        { id: "research", label: "Research-led", why: "Decisions come from user evidence.", lines: ["Base every decision on evidence from real users I provide, and mark what still needs research."] },
        { id: "a11y", label: "Accessibility-first", why: "Inclusive from the first step.", lines: ["Design for people using keyboards, screen readers, zoom and low vision from the first step, against WCAG 2.2 AA."] },
        { id: "leanux", label: "Lean UX", why: "Hypotheses tested with quick prototypes.", lines: ["State design hypotheses, test them with the smallest prototype, and change the design from what is learned."], tasks: ["ux-research-plan", "usability-test", "user-flow"] },
        { id: "heuristic", label: "Heuristic", why: "Checked against established usability principles.", lines: ["Check the design against established usability heuristics and name the principle behind each finding."], tasks: ["ux-review", "user-flow", "design-handoff"] },
        { id: "mobile", label: "Mobile-first", why: "Small screens and touch first.", lines: ["Design for the smallest screen and touch first, then enhance for larger screens."], tasks: ["user-flow", "design-handoff", "ux-review"] },
        { id: "system", label: "Design-system-led", why: "Built from existing components and tokens.", lines: ["Build from the existing design system's components and tokens, and list anything new it would need."], tasks: ["design-handoff", "user-flow", "graphic-design"] }
    ],

    operations: [
        { id: "stability", label: "Stability-first", why: "Restore and protect service before anything else.", lines: ["Protect service first: the smallest safe change, with a tested way back, before any improvement."] },
        { id: "automate", label: "Automation and infrastructure-as-code", why: "Repeatable, reviewed changes.", lines: ["Make every change repeatable as reviewed code or scripts rather than manual steps."], not: ["incident"] },
        { id: "secure", label: "Security and least privilege", why: "Minimum access, everything logged.", lines: ["Use the least privilege each step needs, keep secrets in a vault, and log every privileged action."] },
        { id: "observe", label: "Observability-led", why: "See the system before changing it.", lines: ["Define the signals (logs, metrics, traces, alerts) that show the system's state before and after each change."] },
        { id: "document", label: "Documentation-first", why: "Written so anyone on call can follow it.", lines: ["Write it so anyone on call can follow it at night: exact commands, expected output and decision points."], tasks: ["runbook", "change-plan", "ops-script"] }
    ],

    finance: [
        { id: "prudent", label: "Prudent", why: "Conservative assumptions and recognition.", lines: ["Use conservative assumptions, and recognise risks and losses when likely rather than gains before they are certain."] },
        { id: "driver", label: "Driver-based", why: "Built from operational drivers.", lines: ["Build figures from operational drivers (volume, price, rate, headcount) so each can be changed and traced."], tasks: ["budget-forecast", "financial-analysis", "variance-analysis"] },
        { id: "scenario", label: "Scenario-based", why: "Base, downside and upside.", lines: ["Present a base, a downside and an upside case, with the assumptions that differ between them."], tasks: ["budget-forecast", "financial-analysis"] },
        { id: "cash", label: "Cash-focused", why: "Cash timing over accounting profit.", lines: ["Follow the cash: timing of receipts and payments, working capital and the lowest cash point."], tasks: ["budget-forecast", "financial-analysis", "variance-analysis"] },
        { id: "auditready", label: "Audit-ready", why: "Every figure traceable to its source.", lines: ["Make every figure traceable to its source document or ledger account, with the working kept."], conflicts: ["lean"] }
    ],

    legal: [
        { id: "protect", label: "Protective of my side", why: "Allocates risk away from me.", lines: ["Read every clause for how it allocates risk to my side and propose changes that reduce it."] },
        { id: "balanced", label: "Balanced and agreeable", why: "Fair terms the other side can accept.", lines: ["Aim for terms both sides can accept: flag one-sided clauses either way and propose market-standard middle ground, to be confirmed by a lawyer."] },
        { id: "negotiate", label: "Negotiation-ready", why: "Positions and fallbacks for each issue.", lines: ["For each issue give the opening position, the fallback and the walk-away point."], tasks: ["contract-review", "clause-draft"] },
        { id: "plain", label: "Plain-language", why: "Readable by non-lawyers.", lines: ["Use plain language a non-lawyer can follow, without changing the legal effect; flag any term where plain wording could change it."] }
    ]
};
APPROACHES.video = APPROACHES.content;
APPROACHES.audio = APPROACHES.content;

/* cross-cutting emphases */
export const EMPHASES = Object.freeze([
    { id: "verify", label: "Verification-heavy", why: "Says how every output is checked.", lines: ["For every output, say how it will be checked, by whom and with what evidence, and end with a verification checklist."] },
    { id: "risk", label: "Risk-aware", why: "Risks and mitigations at each step.", lines: ["Name the main risk at each step and the mitigation, and keep a short risk list at the end."] },
    { id: "lean", label: "Lean and fast", why: "The minimum that meets the objective.", lines: ["Do the minimum that meets the objective; list what is deferred and the risk of deferring it."] },
    { id: "gates", label: "Quality-gated", why: "No phase starts until the last one passes.", lines: ["Put a quality gate between phases with its criteria, and do not continue past a gate that fails."] },
    { id: "teach", label: "Explain as you go", why: "So a less experienced colleague learns.", lines: ["Explain briefly why each step is done, so a less experienced colleague could repeat it."] }
]);

/* who the deliverables are written for */
export const AUDIENCES = Object.freeze([
    { id: "team", label: "The people doing the work", why: "Precise, executable detail.", lines: ["Write for the people doing the work: precise, executable steps and artefacts, without background they already know."] },
    { id: "decision", label: "Decision makers", why: "Summary and recommendation first.", lines: ["Open with a short summary for decision makers: the recommendation, its cost, risk and confidence; details follow."] },
    { id: "audit", label: "Review or audit", why: "Traceable ids, sources and evidence.", lines: ["Make everything traceable for review or audit: ids, sources, evidence locations, and decisions with their date and owner."], conflicts: ["lean"] },
    { id: "newcomer", label: "Newcomers", why: "Terms defined, examples given.", lines: ["Write so someone new to the area can follow: define each term and give an example for each concept."] }
]);

const NONE = { id: "-", label: "", lines: [] };

/** The approaches that fit a task (its family's, limited by tasks and not). */
export function approachesFor(task) {

    return (APPROACHES[task?.family] ?? []).filter((x) => (!x.tasks || x.tasks.includes(task.id)) && !x.not?.includes(task.id));

}

const clash = (a, b) => Boolean(a.conflicts?.includes(b.id) || b.conflicts?.includes(a.id));

/** Whether three parts can be used together (no part names another as a conflict). */
export function compatible(approach, emphasis, audience) {

    const parts = [approach, emphasis, audience].filter((x) => x && x.id !== "-");
    return parts.every((x, i) => parts.slice(i + 1).every((y) => !clash(x, y)));

}

/** Every valid combination for a task, in a fixed order: [{ id, approach, emphasis, audience }]. "-" means none. */
export function strategiesFor(task) {

    const out = [];
    for (const approach of [NONE, ...approachesFor(task)]) {
        for (const emphasis of [NONE, ...EMPHASES]) {
            for (const audience of [NONE, ...AUDIENCES]) {
                if (compatible(approach, emphasis, audience)) out.push({ id: strategyId(approach.id, emphasis.id, audience.id), approach, emphasis, audience });
            }
        }
    }
    return out;

}

/** Counts for the coverage record: every combination, the valid ones, and the ones with a named approach. */
export function strategyCounts(task) {

    const a = approachesFor(task).length;
    const all = (a + 1) * (EMPHASES.length + 1) * (AUDIENCES.length + 1);
    const valid = strategiesFor(task);
    return { approaches: a, theoretical: all, valid: valid.length, withApproach: valid.filter((s) => s.approach.id !== "-").length };

}

export const strategyId = (approach = "-", emphasis = "-", audience = "-") => `${STRATEGY_VERSION}:${approach || "-"}+${emphasis || "-"}+${audience || "-"}`;

/** The parts of a strategy id for this task, or null when the id is unknown or not valid for it. */
export function readStrategy(task, id) {

    return strategiesFor(task).find((s) => s.id === id) ?? null;

}

/**
 * Another approach: a different approach first (in the family's order, after the current one), keeping the emphasis
 * and audience when they fit; then other emphases. Skips the ids in `used`. Returns null when every one was used.
 */
export function nextStrategy(task, currentId, used = []) {

    const all = strategiesFor(task);
    const current = all.find((s) => s.id === currentId) ?? all[0];
    const seen = new Set([...used, current.id]);
    const order = [NONE, ...approachesFor(task)];
    const at = order.findIndex((a) => a.id === current.approach.id);
    const rotated = [...order.slice(at + 1), ...order.slice(0, at + 1)];
    const pick = (test) => {
        for (const a of rotated) {
            const s = all.find((x) => x.approach.id === a.id && test(x) && !seen.has(x.id));
            if (s) return s;
        }
        return null;
    };
    return pick((x) => x.emphasis.id === current.emphasis.id && x.audience.id === current.audience.id && x.approach.id !== "-")
        ?? pick((x) => x.audience.id === current.audience.id)
        ?? all.find((x) => !seen.has(x.id)) ?? null;

}

/** The strategy's prompt sections. */
export function strategyBlocks(s) {

    if (!s) return [];
    const block = (title, part) => part && part.id !== "-" ? `${title}: ${part.label}:\n${part.lines.map((l) => `- ${l}`).join("\n")}` : "";
    return [block("Professional approach", s.approach), block("Emphasis", s.emphasis), block("Written for", s.audience)].filter(Boolean);

}
