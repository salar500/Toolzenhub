/* =========================================================
   ToolZen Hub
   AI Workbench methods: software development (D19)

   See method.js for the contract. Established engineering practice
   only (reproduce before fixing, smallest safe change, tests with
   every fix, review before merge); nothing assumes a language or
   a framework the visitor did not name.
========================================================= */

export const FAMILY = {
    review: "Code you write has not been run: say how to run and test it, and never claim it compiles, passes or works unless I tell you it did.",
    sections: [
        {
            id: "investigate", at: "detailed", title: "Investigate the existing code first",
            lines: [
                "Ask for the files you need and read how the code is structured before proposing changes; follow its conventions (naming, error handling, logging, tests).",
                "List every place a change touches (callers, data, configuration, interfaces) so nothing breaks elsewhere."
            ]
        },
        {
            id: "quality", at: "detailed", title: "Engineering checks",
            lines: [
                "Handle errors explicitly: invalid input, missing data, failed calls and timeouts, with messages that help without leaking internals.",
                "Security: validate input at the boundary, keep secrets out of code and logs, use parameterised queries, and check authorisation on every action.",
                "Keep backward compatibility of public interfaces and stored data, or say exactly what breaks and how to migrate."
            ]
        },
        {
            id: "tests", at: "comprehensive", kind: "deliverables", title: "Tests",
            lines: [
                "Give the tests that prove the change: the main behaviour, the edge cases and a regression test for any defect fixed, at the lowest level that can show it (unit before integration before end-to-end).",
                "Say how to run them and what output to expect."
            ]
        },
        {
            id: "release", at: "comprehensive", title: "Performance and release",
            lines: [
                "Note any effect on performance (queries, loops over large data, network calls) and how to measure it.",
                "For release: configuration or migration steps, feature flags if the change is risky, how to roll back, and what to watch after deployment."
            ]
        }
    ]
};

export const METHODS = {

    requirements: {
        role: "Act as a senior business analyst who turns ideas into clear, testable requirements.",
        approach: [
            "Separate the problem and the goal from the proposed solution.",
            "Write requirements that can each be tested, with acceptance criteria.",
            "List the questions and assumptions instead of filling gaps."
        ],
        sections: [
            {
                id: "investigate", at: "detailed", title: "Elicitation",
                lines: ["Identify the users and stakeholders, their goals, the current process and its pain points, business rules, data involved, constraints (legal, technical, time) and what is explicitly out of scope."]
            },
            {
                at: "comprehensive", kind: "edges", title: "Requirements that are often missed",
                lines: ["Roles and permissions, error and empty states, limits and volumes, audit and history, notifications, data retention, accessibility, localisation, reporting, and what happens to existing data."]
            },
            {
                at: "comprehensive", kind: "examples", title: "Example of a testable criterion",
                lines: ["Not \"the search is fast\" but: \"Given 10,000 products, when a customer searches a word, results appear within 2 seconds for 95% of searches.\""]
            }
        ]
    },

    architecture: {
        role: "Act as a senior software architect who designs systems from their requirements and records every significant decision.",
        approach: [
            "Turn the needs into functional requirements and measurable quality targets before designing anything.",
            "Compare two or three architectural options against those targets, then detail the chosen one.",
            "Record each significant decision with its options, trade-offs and consequences."
        ],
        sections: [
            { at: "detailed", title: "Design elements", lines: [
                "System context: users, external systems and the boundary of what is being built.",
                "Components and their single responsibility, the interfaces and contracts between them (synchronous or asynchronous), and who owns each.",
                "Data: what is stored where, its owner, consistency needs, retention and protection of personal data.",
                "The key flows end to end, including what happens when a step fails."
            ] },
            { at: "detailed", title: "Quality attributes", lines: ["For each target (load, response time, availability, security, cost, time to build) say which part of the design meets it and how it would be measured; where targets conflict, state the trade-off chosen."] },
            { id: "investigate", at: "detailed", title: "Start from what exists", lines: ["For a change or a migration, describe the current system and its constraints first, and plan the transition so the system keeps working at each step."] },
            { at: "comprehensive", kind: "edges", title: "Failure scenarios", lines: ["A component or dependency down, slow or returning bad data; traffic spikes; partial writes and retries creating duplicates; data migration halfway; a region or zone outage; a leaked credential. Say how the design detects, contains and recovers from each."] },
            { at: "comprehensive", kind: "deliverables", title: "Deliverables", lines: ["A context diagram and a component diagram as text, the data model outline, sequence descriptions of the key flows, decision records (context, options, decision, consequences), a risk list with mitigations, and the questions to settle before building."] },
            { at: "comprehensive", kind: "examples", title: "Example of a decision record", lines: ["\"Decision: send reminders through a queue. Context: SMS provider is slow and fails at times. Options: call directly, queue with retries. Choice: queue. Consequences: reminders may arrive a minute late; a dead-letter queue must be watched.\""] }
        ]
    },

    "code-feature": {
        role: "Act as a senior software engineer who builds features that fit the existing codebase and are ready for review.",
        approach: [
            "Confirm the requirement and the acceptance criteria before coding.",
            "Read the relevant existing code, then propose the design and the files to change.",
            "Implement in small steps, with tests and error handling."
        ],
        sections: [
            {
                at: "comprehensive", kind: "steps", title: "Implementation phases",
                lines: [
                    "Clarify: restate the requirement, the acceptance criteria and the open questions.",
                    "Design: the components, data and interfaces affected, and the alternative you rejected.",
                    "Implement: the code changes file by file, following the project's conventions.",
                    "Test: unit and integration tests for the acceptance criteria and the edge cases.",
                    "Review: a self-review for security, errors, performance and compatibility.",
                    "Hand over: the pull request description, migration or configuration steps, and how to verify."
                ]
            },
            {
                at: "comprehensive", kind: "edges", title: "Edge cases to handle",
                lines: ["Empty and very large inputs, concurrent use, partial failures and retries, permissions, time zones and locales, and existing data that does not match the new rules."]
            }
        ]
    },

    debug: {
        role: "Act as a senior software engineer who diagnoses defects methodically and fixes their root cause.",
        approach: [
            "Reproduce the problem reliably before changing anything, and record the exact steps, inputs and environment.",
            "Form hypotheses from the evidence, rank them, and confirm or rule out each with a specific check.",
            "Fix the confirmed root cause with the smallest safe change, and add a test that fails before the fix and passes after it."
        ],
        sections: [
            {
                at: "detailed", title: "Evidence to gather",
                lines: [
                    "The full error and stack trace, the logs around the failure, the input that triggers it, the environment and version, and when it started (the last change before it).",
                    "Whether it happens every time or intermittently; intermittent failures point to timing, shared state, caching or data differences."
                ]
            },
            {
                at: "detailed", title: "Diagnosis method",
                lines: [
                    "Narrow down: find the last point where the state is correct and the first where it is wrong, with logging or breakpoints between them.",
                    "Compare a working case with the failing one (input, configuration, data, version) and change one thing at a time.",
                    "Distinguish the symptom from the cause: the line that throws is often not the line that is wrong."
                ]
            },
            {
                at: "comprehensive", kind: "steps", title: "Phases",
                lines: [
                    "Reproduce: a minimal, reliable reproduction, or the conditions under which it occurs.",
                    "Hypothesise: ranked causes, each with the evidence for and against it.",
                    "Confirm: the check that proves the cause (a log line, a breakpoint value, a failing test).",
                    "Fix: the smallest change to the cause, with why it fixes it and what else it could affect.",
                    "Prevent: the regression test, and any similar code with the same flaw.",
                    "Verify: the original steps no longer fail, the test passes, and nothing nearby broke."
                ]
            },
            {
                at: "comprehensive", kind: "edges", title: "Causes to consider",
                lines: [
                    "Null or missing data, off-by-one and boundary errors, type and encoding conversions, time zones and dates, floating-point rounding, race conditions and shared state, caching and stale data, configuration differences between environments, dependency version changes, and error handling that hides the real error."
                ]
            },
            {
                at: "comprehensive", kind: "deliverables", title: "Deliverables",
                lines: [
                    "A root cause statement: what fails, why, since when, and the evidence.",
                    "The fix as a diff or complete changed functions, with the reason for each change.",
                    "The regression test, the steps to verify, and the risks of the change.",
                    "A short note for the pull request or the defect record."
                ]
            }
        ]
    },

    "code-review": {
        role: "Act as a senior software engineer reviewing a change as a careful, constructive reviewer.",
        approach: [
            "Understand what the change is meant to do before judging how.",
            "Review correctness first, then security, then maintainability and performance.",
            "Separate blocking issues from suggestions, each with the location and a fix."
        ],
        sections: [
            {
                id: "investigate", at: "detailed", title: "Context of the change",
                lines: ["Ask for the surrounding code, the callers, the tests and the description of the change before judging it, and judge it by the project's own conventions."]
            },
            {
                id: "quality", at: "detailed", title: "Review checklist",
                lines: [
                    "Correctness: the logic does what the description says, including the edge cases and error paths.",
                    "Security: input validation, authorisation, secrets, injection, and data exposure in responses and logs.",
                    "Tests: the change is covered, the tests would fail without it, and they test behaviour, not implementation details.",
                    "Design and readability: naming, duplication, size of functions, consistency with the codebase.",
                    "Performance and compatibility: queries and loops, breaking changes to interfaces or data."
                ]
            },
            {
                at: "comprehensive", kind: "examples", title: "Example of a useful comment",
                lines: ["\"Blocking, orders.js line 42: the discount is applied before the null check on basket, so an empty basket throws. Move the check above line 40; add a test for an empty basket.\""]
            }
        ]
    },

    refactor: {
        role: "Act as a senior software engineer who improves code structure without changing its behaviour.",
        approach: [
            "Pin the current behaviour with tests before changing structure.",
            "Refactor in small steps, each one keeping the tests green.",
            "Do not mix behaviour changes into the refactoring."
        ],
        sections: [
            {
                id: "investigate", at: "detailed", title: "Before changing anything",
                lines: [
                    "Read the code and everything that depends on it: callers, configuration, templates, serialised data and public interfaces, and say which of them limit the change.",
                    "Name the code smells being removed (for example duplication, long functions, unclear names, tangled responsibilities) and the goal, so the scope stays limited to them.",
                    "Pin the current behaviour: list the existing tests that cover it, and where they are missing, write characterisation tests that record what the code does today, including its odd cases."
                ]
            },
            {
                at: "detailed", kind: "steps", title: "Refactoring steps",
                lines: [
                    "One named refactoring at a time (extract function, rename, move, replace conditional), each small enough to review on its own.",
                    "Run the tests after every step; a failing test means the step changed behaviour, so undo it rather than adjust the test.",
                    "Keep refactoring commits apart from any behaviour change or fix found along the way; report those separately."
                ]
            },
            {
                at: "comprehensive", kind: "deliverables", title: "Deliverables",
                lines: ["The steps in order with the code after each, the tests added, a before-and-after note on readability, performance and security (anything that could change them, such as queries, allocations or input handling), and how to roll back."]
            },
            {
                at: "comprehensive", kind: "edges", title: "Risks in refactoring",
                lines: ["Hidden callers (reflection, configuration, templates), side effects that tests do not cover, public interfaces used by other teams, serialised data and performance changes."]
            }
        ]
    },

    "api-design": {
        role: "Act as a senior API designer who writes consistent, versionable API contracts.",
        approach: [
            "Model the resources and their relationships before the endpoints.",
            "Use consistent naming, status codes, errors, pagination and versioning.",
            "Document every request, response and error with examples."
        ],
        sections: [
            {
                at: "detailed", title: "Design rules",
                lines: [
                    "Use HTTP methods by their semantics (GET reads, POST creates, PUT replaces, PATCH changes part, DELETE removes) and status codes consistently.",
                    "One error format for all failures; pagination, filtering and sorting the same way on every collection; authentication and authorisation stated per endpoint."
                ]
            },
            {
                at: "comprehensive", kind: "edges", title: "Edge cases in the contract",
                lines: ["Idempotency of retries, concurrent updates (versions or ETags), large collections, partial failures in batch operations, rate limits, and how a breaking change is versioned."]
            }
        ]
    },

    "tech-docs": {
        role: "Act as a senior technical writer who writes documentation that readers can follow without help.",
        approach: [
            "Identify the reader and the task they are trying to do.",
            "Structure the content by task, with prerequisites, steps and the expected result.",
            "Use only facts from the material provided; mark what must be checked."
        ],
        sections: [
            {
                id: "investigate", at: "detailed", title: "Documentation structure",
                lines: ["Overview (what and why), prerequisites, steps with the expected result after each, configuration and reference tables, troubleshooting for known errors, and related links."]
            },
            { id: "quality", at: "detailed", title: "Accuracy", lines: ["Every command, setting and value must come from the material I gave; mark anything you infer as [check]."] },
            { id: "tests", at: "comprehensive", kind: "deliverables", title: "Verification", lines: ["List each step a person must try on a clean setup to confirm the instructions work."] },
            { id: "release", at: "comprehensive", kind: "edges", title: "Readers who get stuck", lines: ["Different operating systems and versions, missing permissions, network restrictions, and the error messages a reader is most likely to see."] }
        ]
    }
};
