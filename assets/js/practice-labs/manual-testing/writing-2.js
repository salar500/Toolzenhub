/* =========================================================
   ToolZen Hub
   Specialised Testing path: structured writing exercises (checked by practice-labs/writing-check.js)
========================================================= */

export const WRITING_2 = Object.freeze([
    {
        id: "st-w-rca",
        template: "rca",
        task: "Production incident: customers were charged delivery on orders of ₹1,000 for two days after release 4.2. Write a short root-cause analysis: the problem, at least three 'why' steps, the root cause and one preventive action with an owner.",
        scenario: "Release 4.2 changed the delivery rule from 'free over ₹999' to read the threshold from configuration. Staging used ₹999; production configuration still held an old value of ₹1,499. No test covered the configuration value, and the release checklist did not include configuration review.",
        fields: [
            { name: "problem", label: "Problem statement", lines: 2 },
            { name: "whys", label: "Why? Why? Why? (one per line)", lines: 5 },
            { name: "root", label: "Root cause", lines: 2 },
            { name: "action", label: "Preventive action and owner", lines: 2 }
        ],
        rules: [
            { id: "problem", type: "required", field: "problem", label: "States the problem", advice: "Say what happened, to whom and for how long, with the numbers." },
            { id: "impact", type: "covers", fields: ["problem"], groups: [["1,000", "1000", "two days", "2 days", "4.2"]], label: "The problem has concrete facts", advice: "Include the order value, the duration or the release." },
            { id: "whys", type: "minLines", field: "whys", min: 3, label: "At least three why steps", advice: "Keep asking why until you reach a process or system cause, not a person." },
            { id: "config", type: "covers", fields: ["whys", "root"], groups: [["config", "configuration", "1,499", "1499"]], label: "Finds the configuration difference", advice: "Production used a different threshold value from staging." },
            { id: "process", type: "covers", fields: ["root"], groups: [["checklist", "review", "no test", "not tested", "process", "pipeline", "validation"]], label: "Root cause is a process or system gap, not a person", advice: "For example: configuration was not reviewed or tested as part of the release." },
            { id: "action", type: "covers", fields: ["action"], groups: [["test", "check", "checklist", "validate", "alert", "monitor"], ["owner", "team", "lead", "by "]], label: "One preventive action with an owner", advice: "For example: add a test that reads the production configuration value; owner: release team lead." },
            { id: "blame", type: "noVague", fields: ["root", "action"], words: ["careless", "fault", "blame", "should have been more careful", "human error"], label: "Blameless wording", advice: "Describe what in the system allowed the mistake, not who made it." }
        ],
        model: {
            problem: "After release 4.2, orders of ₹1,000 to ₹1,499 were charged ₹49 delivery for two days (about 380 orders).",
            whys: "Why were they charged? Production used a free-delivery threshold of ₹1,499.\nWhy ₹1,499? The new configuration key kept an old production value; staging had ₹999.\nWhy was it not caught? No test checked the configured threshold, and staging configuration differs from production.\nWhy no check? The release checklist does not include a configuration review.",
            root: "Configuration values are not reviewed or tested as part of the release process, so production and staging can silently differ.",
            action: "Add a pipeline check that compares business-rule configuration between staging and production before release; owner: release team lead. Refund the affected orders."
        },
        weak: [{ name: "blame and no process", answer: { problem: "Delivery was wrong.", whys: "The developer made a mistake.", root: "Human error by the developer, who was careless.", action: "Be more careful next time." }, missing: ["impact", "whys", "config", "process", "action", "blame"] }],
        explain: "A useful root-cause analysis follows the facts to a system or process gap that can be fixed, and ends with a concrete preventive action that has an owner. Blaming a person stops the investigation before the real cause."
    }
]);
