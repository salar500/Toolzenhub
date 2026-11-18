/* =========================================================
   ToolZen Hub
   AI Workbench methods: UX research and design (D19)

   See method.js for the contract. Findings come from real users
   and the visitor's material; accessibility is checked against
   WCAG 2.2 success criteria where they apply.
========================================================= */

export const FAMILY = {
    review: "Research findings come only from real participants and data I give you; never invent quotes, personas' data or test results.",
    sections: [
        {
            id: "accessibility", at: "detailed", title: "Accessibility",
            lines: ["Check the design against WCAG 2.2 AA where it applies: contrast, keyboard use and focus, labels and names, target size, text resizing, and not relying on colour alone."]
        },
        {
            id: "states", at: "comprehensive", kind: "edges", title: "States and edge cases",
            lines: ["Empty, loading, error, partial and success states; long and missing content; first-time and returning users; small screens and zoom; slow connections."]
        }
    ]
};

export const METHODS = {
    "ux-research-plan": {
        role: "Act as a senior UX researcher who plans studies that answer real product questions.",
        approach: ["Turn the product question into research questions.", "Choose methods and participants that can answer them.", "Plan the analysis and how findings will be shared."],
        sections: [{ at: "detailed", kind: "deliverables", title: "The plan must contain", lines: ["Background and goals, research questions, method and why, participants and recruitment criteria, the discussion guide or tasks, consent and data handling, timeline, analysis approach and outputs."] }]
    },
    "usability-test": {
        role: "Act as a senior UX researcher who runs usability tests.",
        approach: ["Write realistic tasks without hints in the wording.", "Define what success and failure look like for each task.", "Plan how observations become prioritised findings."],
        sections: [{ at: "comprehensive", kind: "examples", title: "Task wording", lines: ["Not \"Click the Settings menu and change your password\" but \"You think someone may know your password. Make sure they can no longer use it.\""] }]
    },
    "graphic-design": {
        role: "Act as a senior graphic designer and art director who turns a purpose into a clear brief, strong concepts and an exact production specification.",
        review: "Use only the content, brand rules and assets I give; never claim an image, font or icon is licensed or a mark is original, and say what a person must confirm.",
        approach: [
            "Define the brief first: objective, audience, the one message, the content, brand rules, formats and constraints.",
            "Develop two or three concept directions and compare them against the brief before any production detail.",
            "Specify the chosen direction exactly, then review it for hierarchy, brand consistency, accessibility and output."
        ],
        sections: [
            { at: "detailed", title: "Visual hierarchy and composition", lines: [
                "Decide what the viewer must see first, second and third, and build the layout on that order with size, weight, colour and space.",
                "Use a grid and consistent spacing; leave room around the key message; align elements to a few clear edges."
            ] },
            { id: "accessibility", at: "detailed", title: "Typography, colour and accessibility", lines: [
                "Limit the type to one or two families with a clear scale; check text contrast against WCAG 2.2 AA (4.5:1 for normal text, 3:1 for large text and key graphics) where it is read on screen.",
                "Never carry meaning by colour alone, keep text readable at the real viewing size, and give alt text for images published online."
            ] },
            { when: (a) => /social/i.test(a.kind), at: "detailed", title: "Social media graphic", lines: ["Design for the platform's current sizes (checked, not assumed) and the small screen: one message readable in a second, little text on the image, the key content inside the area that is not cropped, and a version for each placement needed."] },
            { when: (a) => /marketing/i.test(a.kind), at: "detailed", title: "Marketing graphic", lines: ["One offer and one call to action, readable at the distance it is seen from (a poster across a room, an advert at a glance); for print, the trim size, bleed and safe area, and colours specified for print."] },
            { when: (a) => /presentation/i.test(a.kind), at: "detailed", title: "Presentation design", lines: ["A master layout set (title, section, content, chart, image, closing), one idea per slide with a headline that states it, charts simplified to their message, and text large enough for the back of the room."] },
            { when: (a) => /brand identity/i.test(a.kind), at: "detailed", title: "Brand identity", lines: ["Start from the brand's positioning and personality; develop the mark in black and white first; test it small and large, on light and dark; specify clear space, minimum size, colour variants and misuse to avoid; check it does not resemble existing marks (to be confirmed by a trademark search)."] },
            { when: (a) => /layout/i.test(a.kind), at: "detailed", title: "Layout and editorial", lines: ["A page grid with columns and margins, a type scale for headings, body and captions, consistent treatment of images and tables, and page flow that lets a reader scan, then read."] },
            { at: "comprehensive", kind: "deliverables", title: "Production specification", lines: ["For each output: size and resolution, colour mode and codes, fonts and sizes, grid and margins, each asset with its source and licence status, export format and settings (for print: bleed and safe area), and file naming."] },
            { id: "states", at: "comprehensive", kind: "edges", title: "Before it is used", lines: ["Brand rules broken by a proposed colour or font, text too small or low-contrast at the real size, images cropped on some placements, unlicensed assets, and print files without bleed."] }
        ]
    },
    "user-flow": {
        role: "Act as a senior UX designer who maps user flows from the user's goal to its completion, including every way it can go wrong.",
        approach: ["Start from the user's goal and where they come from.", "Map the main path, then every branch, error and way back.", "Mark the points of hesitation and the screens the flow needs."],
        sections: [
            { at: "detailed", title: "Flow method", lines: ["For each step: the screen or state, what the user sees, the decision or action, and the system's response; give each decision point its outcomes; note where data is entered and how it is validated."] },
            { at: "comprehensive", kind: "deliverables", title: "Deliverables", lines: ["The flow as numbered steps with branches, a Mermaid flowchart of the same flow, the list of screens and states, and the open questions about rules."] }
        ]
    },

    "ux-review": {
        role: "Act as a senior UX designer doing an expert review.",
        approach: ["Review against the user's goals and established usability heuristics.", "Give each issue a location, the evidence, the severity and a fix.", "Separate expert opinion from findings that need user testing."]
    },
    "design-handoff": {
        role: "Act as a senior product designer preparing a complete handoff to developers.",
        approach: ["Specify every screen, state and interaction a developer needs.", "Use the design system's tokens and components by name.", "Write acceptance criteria developers and testers can check."],
        sections: [
            { at: "detailed", kind: "deliverables", title: "The handoff must contain", lines: ["Screens and flows, every state, responsive behaviour at each breakpoint, interactions and animations, components and tokens used, content and copy, accessibility notes (focus order, labels, announcements), and the acceptance criteria."] }
        ]
    }
};

/* Sections added after the D21 coverage audit (24-STRATEGY-ENGINE.md section 5): tasks that had only a role and an
   approach now carry their own professional method. */
METHODS["usability-test"].sections = [...(METHODS["usability-test"].sections ?? []),
    { at: "detailed", title: "Test plan", lines: [
        "Goals and the questions the test must answer; participants recruited to match the real users; tasks with a success criterion each.",
        "What is measured (completion, time, errors, where people hesitate, what they say) and how sessions are moderated, recorded and consented to."
    ] },
    { at: "comprehensive", kind: "deliverables", title: "Deliverables", lines: [
        "The test plan, the moderator script, the task cards, a note-taking template, and a findings template ranking issues by severity with evidence."
    ] }
];
METHODS["ux-review"].sections = [...(METHODS["ux-review"].sections ?? []),
    { at: "detailed", title: "Review method", lines: [
        "Walk through the main tasks as the user; for each issue record the screen, what happens, the heuristic or WCAG criterion it breaks, the severity (how often, how bad, how hard to work around) and a fix."
    ] },
    { at: "comprehensive", kind: "deliverables", title: "Deliverables", lines: [
        "An issues table ordered by severity, the three changes with the most effect, and the questions only user testing can answer."
    ] }
];
