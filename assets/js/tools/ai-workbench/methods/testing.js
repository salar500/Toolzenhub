/* =========================================================
   ToolZen Hub
   AI Workbench methods: software testing (D19)

   The professional method of each testing task, written into the
   master prompt at the visitor's prompt detail (method.js). A
   section's `at` is the lowest level that includes it; its `kind`
   lets a visitor add it at a lower level. Terms follow established
   test practice (the ISTQB glossary's test design techniques, HTTP
   semantics, the OWASP API Security Top 10 2023); nothing here
   assumes a stack or a tool. Planned tests are never reported as
   run.
========================================================= */

export const FAMILY = {
    review: "Planned tests are not executed tests and expected results are not actual results: never report a test as passed, failed or run unless I give you its real result.",
    sections: [
        {
            id: "design", at: "detailed", title: "Test design techniques",
            lines: [
                "Choose the techniques per requirement and name them: equivalence partitioning for input classes, boundary value analysis at each limit (just below, on and just above), decision tables for combined rules, state transition testing for statuses and workflows, and error guessing from known failures.",
                "Cover positive, negative and boundary conditions for every rule, not only the main path."
            ]
        },
        {
            id: "traceability", at: "detailed", title: "Traceability",
            lines: [
                "Give each test an id and the requirement or acceptance criterion it covers; report any requirement with no test and any test with no requirement.",
                "Mark requirements that are ambiguous or cannot be tested, with the question that would make them testable."
            ]
        },
        {
            id: "data", at: "detailed", title: "Test data and environments",
            lines: [
                "Define the test data each test needs (valid, invalid, boundary and per role), how it is created and how it is reset; never use production data.",
                "Name the environment each test runs in and the dependencies it needs (services, accounts, feature flags); stub or isolate unstable dependencies."
            ]
        },
        {
            id: "entry-exit", at: "comprehensive", title: "Entry and exit criteria",
            lines: [
                "Entry: the build is deployed to the test environment, the test data and accounts exist, the requirements are agreed and the smoke tests pass.",
                "Exit: every high-priority test has been executed, no open critical or high-severity defects without an accepted decision, and the coverage of each requirement is reported.",
                "State who can accept a risk and close testing with known defects."
            ]
        },
        {
            id: "defects", at: "comprehensive", kind: "deliverables", title: "Defect report format",
            lines: [
                "Title naming the behaviour and the place; steps to reproduce from a clean start; expected and actual result; environment and build; severity (impact) and priority (urgency) as separate fields; evidence (request and response, logs, screenshots) with secrets and personal data removed; the requirement it breaks."
            ]
        },
        {
            id: "reporting", at: "comprehensive", kind: "deliverables", title: "Execution reporting",
            lines: [
                "Report counts as planned, executed, passed, failed, blocked and not run, from real results only, with the open defects by severity and the requirements still uncovered.",
                "End with the risks that remain for the release and a recommendation the release owner can accept or reject."
            ]
        }
    ]
};

export const METHODS = {

    "test-plan": {
        role: "Act as a senior test manager who writes risk-based test plans that a team can execute.",
        approach: [
            "Start from the requirements and the risks: what matters most to users and what is most likely to break.",
            "Decide the test levels and types in scope, and write out of scope explicitly.",
            "Plan effort by risk, with a fallback for when time runs short."
        ],
        sections: [
            {
                at: "detailed", kind: "deliverables", title: "The plan must contain",
                lines: [
                    "Objectives and scope, out of scope, test levels and types, approach per type, risks with likelihood, impact and mitigation, entry and exit criteria, environments and test data, roles and responsibilities, schedule and milestones, deliverables, and how defects and progress are tracked.",
                    "A traceability table: requirement, tests or test type that cover it, priority."
                ]
            },
            {
                at: "comprehensive", kind: "edges", title: "Risks to look for",
                lines: [
                    "Integrations and third parties, data migration, permissions and roles, concurrency, time zones and dates, localisation, accessibility, performance under realistic load, upgrades and backward compatibility, and recovery after failure.",
                    "Testing risks too: unstable environments, missing test data, late builds, unclear requirements, and people unavailable."
                ]
            },
            {
                at: "comprehensive", title: "Decision rules",
                lines: [
                    "If time is cut, drop low-risk testing first and say what is no longer covered.",
                    "If a requirement is unclear, record the question and the assumption used until it is answered.",
                    "If the environment is unstable, stop and report rather than record failures that are not product defects."
                ]
            }
        ]
    },

    "test-cases": {
        role: "Act as a senior test analyst who designs precise, executable test cases.",
        approach: [
            "List the scenarios first, each with the design technique and the requirement it covers.",
            "Then write cases with exact data and exact expected results.",
            "Finish with coverage: what each requirement has, and the gaps."
        ],
        sections: [
            {
                at: "detailed", kind: "deliverables", title: "Each test case contains",
                lines: ["Id, title, requirement, priority, preconditions, test data (actual values), steps, expected result for each check, and postconditions or clean-up."]
            },
            {
                at: "comprehensive", kind: "edges", title: "Edge cases to cover",
                lines: [
                    "Empty, minimum, maximum and just-over-maximum values; wrong types and formats; special characters, Unicode and very long text; leading and trailing spaces.",
                    "Roles and permissions, including a user acting on someone else's data; repeated submissions and double clicks; refresh, back and timeout in the middle of a flow; concurrent changes to the same record."
                ]
            },
            {
                at: "comprehensive", kind: "examples", title: "Example of the expected precision",
                lines: ["Not \"enter an invalid code and check the error\" but: data \"SAVE1\" (5 characters, below the 6-character minimum); expected: the message \"Enter a code of 6 to 12 characters\" and the total unchanged."]
            }
        ]
    },

    "api-testing": {
        role: "Act as a senior QA engineer specialising in API testing, who designs API test strategies and executable test cases.",
        approach: [
            "First analyse the API: list every endpoint with its method, purpose, authentication, inputs and documented responses, and the gaps in the contract.",
            "Then design tests per endpoint: positive, negative, boundary, authentication and authorisation, and error handling.",
            "Prioritise by risk and by what the endpoint does to data, and say what each test checks in the response."
        ],
        sections: [
            {
                at: "detailed", title: "Endpoint analysis",
                lines: [
                    "For each endpoint record: method and path, purpose, who may call it, path and query parameters, headers, request body and its rules, success and error responses, and whether it changes data.",
                    "Use HTTP semantics: GET, PUT and DELETE are expected to be idempotent and POST is not; test that repeating a request has the documented effect."
                ]
            },
            {
                at: "detailed", title: "Status codes, headers and validation",
                lines: [
                    "Check the documented status code for each case (for example 200, 201 or 204 for success; 400 for invalid input; 401 without valid credentials; 403 when authenticated but not allowed; 404 for a missing resource; 409 for a conflict; 429 when rate limited). Where the contract says otherwise, the contract wins; where it is silent, ask.",
                    "Check headers: Content-Type and Accept handling, the authentication header, caching headers where relevant, and pagination, filtering and sorting parameters.",
                    "Validate the response body, not only the status: required fields, types, formats (dates, ids, currency), enumerations, null handling, no unexpected fields that leak data, and the same error format on every failure."
                ]
            },
            {
                at: "detailed", title: "Authentication and authorisation",
                lines: [
                    "Test no token, a malformed token, an expired token and a token for another environment.",
                    "Test each role against each endpoint, and object-level access: user A must not read or change user B's resource by changing an id (OWASP API Security Top 10 2023, API1 Broken Object Level Authorization).",
                    "Test that clients cannot set fields they must not control, such as a role, price or owner (API3 Broken Object Property Level Authorization), and that limits on request size and rate exist (API4 Unrestricted Resource Consumption)."
                ]
            },
            {
                at: "comprehensive", kind: "edges", title: "Negative, boundary and edge cases",
                lines: [
                    "Missing required fields, extra unknown fields, wrong types, empty strings and nulls, values at and beyond each limit, very long values, special characters and Unicode, invalid dates and time zones.",
                    "Unknown ids, deleted resources, duplicate creation, concurrent updates to the same resource, pagination past the last page, and an empty collection.",
                    "Dependency failures: what the API returns when a downstream service is slow or down; timeouts and retries must not create duplicates."
                ]
            },
            {
                at: "comprehensive", kind: "steps", title: "Execution approach",
                lines: [
                    "Smoke: each endpoint answers in the test environment with valid credentials.",
                    "Functional: the positive cases for each endpoint and each documented rule.",
                    "Negative and boundary: invalid input, limits and error formats.",
                    "Security: authentication, roles, object-level access and input that must be rejected.",
                    "Flows: chained requests that create, read, update and delete the same data, with clean-up.",
                    "Regression: the high-priority set, run again on every new build."
                ]
            },
            {
                at: "comprehensive", kind: "deliverables", title: "Deliverables",
                lines: [
                    "The API test strategy: scope and out of scope, endpoints and risks, approach per test type, test data, environments, entry and exit criteria, tools, and how results and defects are reported.",
                    "The test case table: id, endpoint, requirement, preconditions, request (method, path, headers, body), expected status, checks on the body and headers, priority.",
                    "A coverage summary per endpoint and per requirement, and the open questions about the contract."
                ]
            },
            {
                at: "comprehensive", kind: "examples", title: "Example of a test case row",
                lines: ["API-012 | GET /orders/{id} | owner only | user B's token, order of user A | expect 403 or 404 as the contract says, no order data in the body, the standard error format | High."]
            },
            {
                id: "entry-exit", at: "comprehensive", title: "Entry and exit criteria",
                lines: [
                    "Entry: the API is deployed to a test environment, the contract or specification is available, test accounts exist for each role, and the smoke tests pass.",
                    "Exit: every high-priority case executed against the agreed build, no open critical defects without an accepted decision, and every endpoint's coverage reported."
                ]
            }
        ]
    },

    "test-automation": {
        role: "Act as a senior test automation engineer who writes reliable, maintainable automated tests.",
        approach: [
            "Agree the structure before writing code: files, fixtures or page objects, test data and locators.",
            "Write independent tests with user-facing locators and assertions that wait for conditions.",
            "Make the tests reliable before adding them to CI."
        ],
        sections: [
            {
                at: "detailed", title: "Reliability rules",
                lines: [
                    "No fixed sleeps; wait for a condition. Each test creates its own data and can run alone, in any order and in parallel.",
                    "Locators by role, label or test id, never by layout or generated class names; assertions check the business result, not only that a page loaded."
                ]
            },
            {
                at: "comprehensive", kind: "edges", title: "Failure scenarios to design for",
                lines: [
                    "Slow responses, animations and loading states; elements that appear late or move; sessions that expire; test data left by a failed run; time zone and locale differences between machines; network errors.",
                    "A flaky test is a defect in the test or the product: find the cause instead of adding retries."
                ]
            },
            {
                at: "comprehensive", kind: "deliverables", title: "Deliverables",
                lines: ["The test files with their paths, any helpers or fixtures, the configuration changes, the commands to run locally and in CI, and a list of what each test covers and what is not automated."]
            }
        ]
    },

    regression: {
        role: "Act as a senior QA lead who plans regression testing by impact and risk.",
        approach: [
            "Map each change to the areas it can affect directly and indirectly.",
            "Select tests by impact and user risk, and fit them to the time available.",
            "Write down what is not tested in this cycle."
        ],
        sections: [
            {
                at: "detailed", title: "Change-impact analysis",
                lines: [
                    "For each change, list the components it touches and what depends on them (shared code, data, interfaces, configuration), so the indirect impact is visible.",
                    "Mark the critical user journeys (the ones that earn money, hold data or are used most) and which changes cross them."
                ]
            },
            {
                at: "detailed", title: "Test selection",
                lines: [
                    "Select tests by impact and risk: everything on a critical journey a change crosses first, then directly affected areas, then indirect ones.",
                    "Use the existing coverage I described: say which selected tests are already automated, which are manual, and which are missing and must be written or run by hand.",
                    "Name the test data and environment each group needs (accounts, seeded data, feature flags, the build under test)."
                ]
            },
            {
                at: "comprehensive", title: "Execution and exit",
                lines: [
                    "Record for each test the build, the environment, the result and the evidence (a run report or screenshot); results come only from real runs.",
                    "Defects found: a severity, a decision to fix now or accept, and a retest after the fix.",
                    "Exit criteria for the cycle: every critical-journey test run against the release build, no open critical defects without an accepted decision, and the untested areas written down."
                ]
            },
            {
                at: "comprehensive", kind: "edges", title: "Indirect impact to consider",
                lines: ["Shared components and libraries, database changes, configuration and feature flags, integrations, permissions, reports and exports that read the changed data, and caches."]
            }
        ]
    },

    defect: {
        role: "Act as a senior QA engineer who writes defect reports a developer can act on immediately.",
        approach: [
            "Use only the facts in my notes; mark anything missing.",
            "Make the steps reproducible from a clean start, with expected and actual results.",
            "Keep likely causes apart from facts, as hypotheses."
        ],
        sections: [
            {
                at: "detailed", title: "Analysis method",
                lines: [
                    "Isolate the defect: the smallest set of steps and data that reproduces it, and what changes the outcome (another browser, role, data value, environment or build).",
                    "Assess the impact: which users and flows are affected, how often, whether data is lost or wrong, and whether a workaround exists.",
                    "Check whether it is a regression: did it work in an earlier build, and what changed in between."
                ]
            },
            {
                at: "comprehensive", kind: "edges", title: "Before raising it",
                lines: ["Rule out a test environment or test data problem, a known open defect (search the tracker), expected behaviour misread from the requirement, and an intermittent cause that needs several attempts to show."]
            },
            {
                at: "comprehensive", title: "Severity and priority",
                lines: ["Severity is the impact (critical: data loss, security or no workaround for a main flow; high: a main flow broken with a workaround; medium; low: cosmetic). Priority is how soon to fix. Give the reason for each; the team decides the final values."]
            }
        ]
    },

    "performance-test": {
        role: "Act as a senior performance engineer who plans load tests that give trustworthy numbers.",
        approach: [
            "Model realistic load from real figures where they exist, and mark every assumed number.",
            "Define the metrics and numeric pass criteria before writing scripts.",
            "Say what the test environment can and cannot tell about production."
        ],
        sections: [
            {
                at: "detailed", title: "Objectives and workload",
                lines: [
                    "State the question each test answers (for example: does checkout meet the target at the expected peak?) and use the targets I gave; where there are none, say they must be agreed and do not invent them.",
                    "Model the workload from real figures where they exist: the user journeys, their mix, think time, arrival rate and data volumes, with every assumed number marked."
                ]
            },
            {
                at: "detailed", title: "Test types and measures",
                lines: [
                    "Run a baseline first at low load, then the test types that answer the question: load at the expected peak, stress beyond it to find the breaking point, spike for sudden surges, endurance (soak) for leaks over hours.",
                    "Measure response-time percentiles (for example the 50th, 95th and 99th) rather than averages, throughput, error rate, and resource use (CPU, memory, connections, queues) on every tier."
                ]
            },
            {
                at: "comprehensive", kind: "steps", title: "Execution and diagnosis",
                lines: [
                    "Baseline: a short run to check the scripts, data and monitoring, and the numbers at low load.",
                    "Main tests: each type in turn, ramped up in steps, with the same data and settings for comparable runs.",
                    "Diagnosis: when a measure misses its target, follow the resource that saturates first and the slowest step of the journey, and propose a change.",
                    "Repeat: run again after each change to show the effect, and repeat each important run at least twice to show it is repeatable."
                ]
            },
            {
                at: "comprehensive", kind: "deliverables", title: "Deliverables",
                lines: ["The test plan, the workload model with its assumptions, the scripts, and a results template: each measure against its target as pass or fail, the bottlenecks found, and what the test environment cannot tell about production."]
            },
            {
                at: "comprehensive", kind: "edges", title: "What distorts results",
                lines: ["Caching and warm-up, test data that is too small or too uniform, the load generator itself becoming the bottleneck, shared environments with other traffic, and differences in size and configuration from production."]
            }
        ]
    }
};
