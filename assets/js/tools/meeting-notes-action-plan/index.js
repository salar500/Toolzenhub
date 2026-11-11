/* =========================================================
   ToolZen Hub
   Meeting Notes to Action Plan (AI Tools)

   Paste rough meeting notes; get the decisions, the actions with
   owners and due dates (and which ones lack them), the open
   questions, the risks, a follow-up message for the attendees and
   the line to give an assistant to refine it. The sorting is the
   notes engine (notes-engine.js); the page is the shared brief page.
========================================================= */

import { createBriefTool } from "../ai-tools/common/brief-tool.js";
import { actionPlan } from "../ai-tools/common/notes-engine.js";


export const showRelatedCalculators = true;
export const showRelatedArticles = false;


const OUTPUT = [
    { value: "both", label: "The plan and a follow-up message" },
    { value: "plan", label: "The plan only" },
    { value: "message", label: "The follow-up message only" }
];


export const CONFIG = {

    toolId: "meeting-notes-action-plan",
    prefix: "mn",
    outputName: "action plan",
    fileName: "action-plan",
    pasteLine: "Settle the actions marked \"owner needed\" or \"no date\", then send the follow-up message; paste the plan into an assistant only to polish the wording.",
    intro: "Paste the notes you typed during a meeting, as rough as they are, and get the decisions, the actions with their owners and dates (and which ones lack them), the open questions and the risks, plus a follow-up message ready to send. Sorted in your browser; nothing is invented.",
    sectionTitle: "Paste the notes",
    sectionText: "One field is essential. Naming the attendees helps the plan find owners. The plan is written as you type.",

    fields: [
        { key: "notes", label: "Meeting notes", required: true, rows: 12, maxlength: 20000, hint: "One point per line works best. \"Priya to send the deck by Friday\", \"Decided: launch on the 20th\", \"Is the budget approved?\"", placeholder: "Decided: launch on 20 Nov\nPriya to send the revised deck by Friday\nRahul will book the venue (next week)\nIs the budget for the event approved?\nRisk: the vendor contract is not signed yet" },
        { key: "attendees", label: "Who was there", rows: 2, hint: "First names, separated by commas. Any line that names one of them becomes that person's action.", placeholder: "Priya, Rahul, Meera, Arjun" },
        { key: "meeting", label: "Meeting", kind: "text", hint: "What the meeting was.", placeholder: "Launch planning" },
        { key: "date", label: "Date", kind: "text", hint: "As you want it written.", placeholder: "11 Nov 2026" },
        { key: "deliver", label: "What you need", kind: "select", options: OUTPUT, hint: "The plan for you, the message for the others, or both." }
    ],

    compose: (v) => actionPlan(v),

    example: {
        values: {
            notes: "Decided: the launch date is 20 Nov, no further slip\nAgreed to drop the referral feature from this release\nPriya to send the revised deck to the sales team by Friday\nRahul will book the venue next week\n@Meera: update the pricing page before 18 Nov\nArjun to confirm the vendor can deliver by the 15th\nIs the event budget approved? Finance has not replied\nRisk: the vendor contract is not signed yet, which could delay the stands\nMarketing wants the press note two days earlier\nNext meeting Thursday",
            attendees: "Priya, Rahul, Meera, Arjun",
            meeting: "Launch planning",
            date: "11 Nov 2026",
            deliver: "both"
        }
    },

    howTo: [
        "During or after the meeting, type one point per line: what was decided, who does what by when, what is still open.",
        "Paste the notes, name the attendees, and read the plan: decisions, actions, open questions, risks.",
        "Settle the actions marked \"owner needed\" or \"no date\" while the meeting is fresh; an action without both rarely happens.",
        "Copy the follow-up message and send it, or download the plan and keep it with the project.",
        "To polish the wording, paste the plan into an assistant with the line under \"To refine it with an assistant\"."
    ],

    parts: [
        { title: "Decisions", text: "Lines that say a decision was made (decided, agreed, approved, go with). Writing them out is what makes a meeting worth having had; the follow-up message leads with them." },
        { title: "Actions, with owner and date", text: "A line with an owner (\"Priya to…\", \"@Priya\", \"Rahul will…\") or a due date. Each is written with its owner and date, or flagged \"owner needed\" and \"no date\": the two gaps that turn an action into a wish." },
        { title: "Open questions and risks", text: "Lines with a question mark or that say something is undecided, and lines that mention a risk, a blocker or a dependency. They go into the plan and the open questions into the message, so they are not lost between meetings." },
        { title: "The follow-up message", text: "A short message to the attendees: thanks, the decisions, who is doing what by when, what is still open, and an invitation to correct it. Sent within the hour, it is the most reliable way to make the actions real." }
    ],

    useWith: [
        "Send the follow-up message first; polishing can wait, the owners cannot.",
        "To turn the plan into tickets, paste the Actions section into your tracker or ask an assistant to format them for it, keeping owners and dates exactly as given.",
        "Keep the plan in the project folder; the next meeting starts by reading its actions back.",
        "Nothing in the plan was invented: if a decision or an owner is missing, it is missing from the notes."
    ],

    faq: [
        { q: "How does it know which line is an action?", a: "A line with an owner (a name followed by \"to\" or \"will\", an @name, a name from the attendees) or a due phrase (\"by Friday\", \"before 18 Nov\"). A line it cannot place goes under \"Other notes\"; it never guesses an owner." },
        { q: "Can I write the notes in my own way?", a: "Yes. One point per line is all it needs. Prefixes such as \"Decided:\", \"Action:\", \"Risk:\" and \"Q:\" make the sorting exact when you want it." },
        { q: "Why does it flag actions with no date?", a: "Because an action with an owner but no date is the one that quietly slips. The flag asks you to settle it while everyone still remembers the conversation." },
        { q: "Is anything sent or stored?", a: "No. The notes stay in your browser and nothing is kept when you leave the page. Download the plan if you want to keep it." }
    ]

};


const tool = createBriefTool(CONFIG);

export const markup = tool.markup;
export const render = tool.render;
export const init = tool.init;
export const build = tool.build;
