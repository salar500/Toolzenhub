/* =========================================================
   ToolZen Hub
   AI Prompt Builder blueprints: IT and system administration (AI
   programme D18)

   Incident troubleshooting, an admin script, a runbook and a
   change plan. Every prompt keeps secrets out, asks for read-only
   diagnosis before any change, and requires a tested rollback
   before anything touches production.
========================================================= */

import { text, area, choose, more } from "./shared.js";

const CATS = [{ id: "coding" }, { id: "assistants" }, { id: "automation" }];
const SECRETS = "Never ask me for passwords, keys or tokens; use placeholders like <API_KEY> and tell me to keep secrets out of logs I paste.";

export const BLUEPRINTS = {

    incident: {
        deliverable: "an incident diagnosis and fix plan",
        categories: CATS,
        depth: "standard",
        questions: [
            area("symptom", "What is wrong and since when", { essential: true, rows: 3, placeholder: "Web app returns 502 for about 20% of requests since 10:40 IST" }),
            area("system", "The system: platform, services, recent changes", { essential: true, rows: 3, placeholder: "Nginx in front of two Node services on Ubuntu 22.04 VMs; deployed a config change at 10:30" }),
            area("evidence", "Logs, errors and what you have checked", { rows: 4, hint: "Paste the relevant lines with secrets and personal data removed." }),
            choose("env", "Environment", ["Production", "Staging", "Development"], { essential: true })
        ],
        brief: (a) => ({
            goal: `Help me diagnose and fix this incident: ${a.symptom}`,
            context: [["System", a.system], ["Evidence so far", a.evidence], ["Environment", a.env]],
            requirements: [
                "Rank the likely causes from the evidence, and for each give the read-only checks (commands or console views) that confirm or rule it out.",
                "Only after a cause is confirmed, give the fix with its risk, a rollback, and how to verify recovery.",
                a.env === "Production" ? "Treat this as production: prefer the smallest reversible change, and say what to communicate to users and stakeholders." : "",
                "Explain what each command does before I run it.",
                SECRETS
            ],
            format: ["Likely causes with checks first; then the fix plan; then what to capture for the incident review."],
            avoid: ["Destructive commands (deleting, restarting everything, changing firewall or access) without a clear warning and a rollback."]
        }),
        stages: [
            { at: "standard", name: "Diagnose", objective: "Find the cause with read-only checks.", submit: "The main prompt.", ask: () => "Give only the ranked causes and the read-only checks for each. I will run them and paste the results.", expect: "Checks to run.", done: "One cause is confirmed by evidence." },
            { at: "standard", name: "Fix and verify", objective: "Fix safely.", submit: "The check results.", ask: () => "Given these results, give the fix, rollback and verification steps.", expect: "A fix plan.", done: "Service is verified healthy and the rollback is known." }
        ],
        refine: ["technical", "missing"],
        quality: ["The cause was confirmed by evidence before anything was changed.", "You have a rollback for every change."],
        prepare: { required: ["Error messages and logs around the start time, with secrets removed."], optional: ["What changed recently."] },
        next: ["Write the incident review and turn the fix into a runbook with \"A runbook or operating procedure\"."]
    },

    "ops-script": {
        deliverable: "an admin script",
        categories: CATS,
        depth: "standard",
        questions: [
            area("job", "What the script must do", { essential: true, rows: 3, placeholder: "Find user accounts not signed in for 90 days and export them to CSV" }),
            choose("shell", "Language", ["PowerShell", "Bash", "Python"], { essential: true }),
            text("env", "Where it runs", { essential: true, placeholder: "Windows Server 2022 with the ActiveDirectory module" }),
            more(area("rules", "Rules: what it must never change, schedule, logging", { rows: 2 }))
        ],
        brief: (a) => ({
            goal: `Write a ${a.shell || "shell"} script that will: ${a.job}`,
            context: [["Runs on", a.env], ["Rules", a.rules]],
            requirements: [
                "Read-only by default; any change needs an explicit switch (for example -WhatIf / --dry-run first, then -Apply).",
                "Validate inputs, handle errors with clear messages and non-zero exit codes, and log what it did.",
                "Comment each section; list the permissions and modules it needs.",
                SECRETS
            ],
            format: ["The script in one code block, then how to run it in dry-run and for real, and how to test it."],
            avoid: ["Hard-coded credentials.", "Commands that are not available on the platform I named."]
        }),
        stages: [],
        refine: ["technical", "clarity"],
        quality: ["You ran it in dry-run on a test system before production."],
        prepare: { required: ["The OS and version, and the modules available."], optional: [] },
        next: ["Keep the script in version control with a short README."]
    },

    runbook: {
        deliverable: "a runbook",
        categories: CATS,
        depth: "standard",
        questions: [
            text("procedure", "The procedure", { essential: true, placeholder: "Restore a PostgreSQL database from last night's backup" }),
            area("steps", "How it is done today", { essential: true, rows: 5, hint: "Your notes, commands or a past incident. The runbook uses only these." }),
            text("who", "Who will follow it", { placeholder: "On-call engineers, some new to the system" })
        ],
        brief: (a) => ({
            goal: `Write a runbook for: ${a.procedure}`,
            context: [["Current steps", a.steps], ["Followed by", a.who]],
            requirements: [
                "Sections: purpose, when to use it, prerequisites and access, step-by-step procedure, verification, rollback, escalation, references.",
                "Each step: one action, the exact command or console path from my notes, and the expected result.",
                "Mark steps that are irreversible or affect users; mark anything missing from my notes as [to confirm]."
            ],
            format: ["Numbered steps with commands in code blocks."],
            avoid: ["Steps not in my notes presented as known."]
        }),
        stages: [],
        refine: ["clarity", "completeness"],
        quality: ["Someone new to the system has followed the runbook in a test environment."],
        prepare: { required: ["The current steps, commands and access needed."], optional: [] },
        next: ["Schedule a test run and record the date in the runbook."]
    },

    "change-plan": {
        deliverable: "an infrastructure change plan",
        categories: CATS,
        depth: "detailed",
        questions: [
            area("change", "The change", { essential: true, rows: 3, placeholder: "Upgrade the Kubernetes cluster from 1.29 to 1.30" }),
            area("scope", "Systems and users affected", { essential: true, rows: 2 }),
            text("window", "Maintenance window and approvals", { placeholder: "Sunday 01:00-04:00 IST; CAB approval needed" }),
            more(area("tools", "How you deploy (for example Terraform, Ansible, console)", { rows: 2 }))
        ],
        brief: (a) => ({
            goal: `Plan this change: ${a.change}`,
            context: [["Affected", a.scope], ["Window and approvals", a.window], ["How we deploy", a.tools]],
            requirements: [
                "Sections: description and reason, risk and impact assessment, pre-checks, implementation steps, verification, rollback plan with a decision point, communication, post-change review.",
                "Name the vendor documentation (release notes, upgrade guide) I must read and what to check in it; do not state version-specific behaviour as certain.",
                "Give a go / no-go checklist and the time each step should take."
            ],
            format: ["Headed sections; implementation and rollback as numbered steps."],
            avoid: ["A plan without a tested rollback."]
        }),
        stages: [],
        refine: ["technical", "completeness"],
        quality: ["The rollback was tested in a non-production environment.", "You checked the vendor's release notes for this version."],
        prepare: { required: ["Current versions and configuration of the affected systems."], optional: ["Previous change records."] },
        next: ["Rehearse the change and rollback in staging before the window."]
    }

};
