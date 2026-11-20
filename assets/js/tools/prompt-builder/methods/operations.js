/* =========================================================
   ToolZen Hub
   AI Prompt Builder methods: IT operations (D19)

   See method.js for the contract. Safe operations practice: read
   before changing, a rollback for every change, no secrets shared,
   approval for production.
========================================================= */

export const FAMILY = {
    review: "Never ask for passwords, keys or tokens; start with read-only commands; every change needs a tested rollback and approval before it touches production.",
    sections: [
        {
            id: "safety", at: "detailed", title: "Safe change",
            lines: ["Say for each command whether it reads or changes state, what it affects, and how to undo it; run changes in a test environment first, and back up before changing data or configuration."]
        },
        {
            id: "verify", at: "comprehensive", kind: "deliverables", title: "Verification",
            lines: ["After each step, the command or check that shows it worked, and what to do if it did not."]
        }
    ]
};

export const METHODS = {
    incident: {
        role: "Act as a senior site reliability engineer leading an incident response.",
        approach: ["Stabilise first: limit the impact and restore service.", "Diagnose from evidence with read-only checks.", "Communicate status, then record the timeline and actions."],
        sections: [
            { at: "detailed", title: "Incident method", lines: ["Assess impact and severity; check recent changes first; mitigate (roll back, fail over, scale) before finding the root cause; keep a timestamped timeline of actions and findings."] },
            { at: "comprehensive", kind: "steps", title: "Response phases", lines: ["Detect and declare: the symptoms, the severity and who leads.", "Assess: what is affected, since when, and what changed recently.", "Mitigate: roll back, fail over, scale or disable the faulty feature, with a check after each action.", "Diagnose: read-only checks to find the cause once service is stable.", "Recover: restore normal operation and data, and confirm with users or monitoring.", "Communicate: updates to stakeholders at a set interval, then the closure note."] },
            { at: "comprehensive", kind: "deliverables", title: "After the incident", lines: ["A blameless review: timeline, impact, root cause and contributing factors, what went well, and actions with owners to prevent a repeat."] }
        ]
    },
    "ops-script": {
        role: "Act as a senior systems engineer who writes safe, maintainable scripts.",
        approach: ["Confirm the platform, version and permissions.", "Write the script with checks, logging and a dry-run mode.", "Explain each part and how to test it safely."],
        sections: [
            { at: "detailed", title: "Script design", lines: [
                "State the operational objective, where it runs (the environment and version I named), its preconditions and dependencies, and the least permissions it needs.",
                "Validate every input and precondition before changing anything, and stop with a clear message when one fails.",
                "Make it safe to run again (idempotent): check the current state and change only what differs; give a dry-run mode that reports what it would do without doing it.",
                "Handle errors explicitly, log each action with a timestamp (never secrets), and return a non-zero exit code on failure."
            ] },
            { when: (a) => /powershell/i.test(a.shell), at: "detailed", title: "In PowerShell", lines: ["Use approved verbs and parameter validation, stop on errors (ErrorAction Stop with try and catch), and support -WhatIf through SupportsShouldProcess as the dry run."] },
            { when: (a) => /bash/i.test(a.shell), at: "detailed", title: "In Bash", lines: ["Start with set -euo pipefail, quote every variable, check commands exist before using them, and use a DRY_RUN variable for the dry run."] },
            { when: (a) => /python/i.test(a.shell), at: "detailed", title: "In Python", lines: ["Use argparse with a --dry-run flag, the logging module, explicit exceptions with a non-zero exit, and only the standard library unless I name a package."] },
            { at: "comprehensive", kind: "deliverables", title: "Deliverables", lines: ["The script, how to run it (dry run first), how to verify the result, how to roll back or recover from a partial run, and a short README: purpose, parameters, permissions, examples."] },
            { at: "comprehensive", kind: "edges", title: "Edge cases", lines: ["Missing files or permissions, paths with spaces, partial failures halfway through, running twice, and running on many machines at once."] }
        ]
    },
    runbook: {
        role: "Act as an experienced operations engineer who writes runbooks someone can follow under pressure.",
        approach: ["State when to use the runbook and what it needs.", "Number the steps with the exact commands and the expected output.", "Add decision points, escalation and rollback."]
    },
    "change-plan": {
        role: "Act as a senior infrastructure engineer planning a controlled change.",
        approach: ["Describe the change, the reason, the impact and the risk.", "Plan pre-checks, steps, verification and rollback.", "Name the window, the approvals and the communication."],
        sections: [{ at: "detailed", kind: "deliverables", title: "The plan must contain", lines: ["Summary, systems affected, risk and impact, prerequisites and backups, step-by-step implementation, verification, rollback with its trigger, schedule and approvals, and communication."] }]
    }
};

/* Sections added after the D21 coverage audit (24-STRATEGY-ENGINE.md section 5): tasks that had only a role and an
   approach now carry their own professional method. */
METHODS["runbook"].sections = [...(METHODS["runbook"].sections ?? []),
    { at: "detailed", title: "Runbook structure", lines: [
        "Purpose and when to use it; prerequisites and access; numbered steps with exact commands and expected output; decision points; how to verify success; rollback; who to escalate to and when; when it was last tested."
    ] },
    { at: "comprehensive", kind: "edges", title: "When it does not go to plan", lines: [
        "A command fails or returns something unexpected; the system is partly changed; access is missing; it is outside working hours. Say what to do in each case."
    ] }
];
