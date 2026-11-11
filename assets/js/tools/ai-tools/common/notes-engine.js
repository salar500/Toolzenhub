/* =========================================================
   ToolZen Hub
   AI Tools: the meeting-notes engine (pure)

   Raw meeting notes become an action plan: the decisions, the
   actions (each with its owner and due date when the notes name
   them, and a flag when they do not), the open questions, and the
   risks and blockers; then a short follow-up message for the
   attendees and the lines to give an assistant to refine it. It
   reads the notes line by line with word patterns; what it did
   not recognise stays in the notes, and the page says so.
========================================================= */

import { tidy, lines } from "./brief-engine.js";


const DECISION = /\b(?:decided|decision|agreed|agree|approved|confirmed|we will go with|go with|settled on|chose|choose to|final(?:ised|ized)?)\b/i;
const ACTION_VERB = /\b(?:will|to|should|needs? to|must|action|todo|to-do|follow up|follow-up|send|prepare|draft|write|schedule|book|review|update|check|confirm|share|set up|create|fix|investigate|contact|call|email|arrange|finish|complete|test|deploy|publish|collect|gather|ask)\b/i;
const QUESTION = /\?|\b(?:unclear|tbd|tbc|to be decided|open question|not decided|need to decide|undecided|pending decision|unknown)\b/i;
const RISK = /\b(?:risk|risky|blocked|blocker|blocking|concern|worried|worry|depends on|dependency|delay|delayed|slipping|at risk|issue)\b/i;
const DUE = /\b(?:by|before|due|until|on|deadline)\s+(?:(?:end of|eod|eow|eom)\s*)?((?:mon|tue|wed|thu|fri|sat|sun)[a-z]*|today|tomorrow|tonight|next (?:week|month|monday|tuesday|wednesday|thursday|friday)|this (?:week|month|friday)|\d{1,2}[/.-]\d{1,2}(?:[/.-]\d{2,4})?|\d{1,2}(?:st|nd|rd|th)?(?:\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*)?(?:\s+\d{4})?|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+\d{1,2}(?:st|nd|rd|th)?|q[1-4]|end of (?:day|week|month|quarter)|eod|eow|eom)\b/i;
const NOTE_PREFIX = /^(?:action|todo|to-do|decision|decided|risk|question|q|note|follow[- ]?up)\s*[:\-–]\s*/i;


/* The owner named in a line: "@Priya", "Priya to…", "Priya will…", "Priya:", "(Priya)", "owner: Priya", or any attendee's name. */
export function ownerOf(line, attendees = []) {

    const at = line.match(/@([A-Z][\w.-]+)/);
    if (at) return at[1];

    const explicit = line.match(/\bowner\s*[:\-]\s*([A-Z][\w.-]+)/i);
    if (explicit) return explicit[1];

    const lead = line.match(/^(?:[-*•]\s*)?(?:action\s*[:\-]\s*)?([A-Z][a-z]+(?: [A-Z][a-z]+)?)\s*(?::|\s(?:to|will|should|is going to|has to|must)\b)/);
    /* a capitalised first word followed by "to" or "will" is a name unless it is a pronoun, a note prefix, a verb (Agreed to, Need to) or a vague subject */
    if (lead && !/^(?:We|I|They|He|She|It|The|This|That|Next|Also|Then|Team|Action|Decision|Risk|Question|Note|Everyone|Someone|Nobody|Need|Needs|Plan|Try|Going|Want|Wants|Remember|Able|Unable|Time|Budget)\b/.test(lead[1]) && !/ed$/.test(lead[1].split(" ")[0])) return lead[1];

    const bracket = line.match(/\(([A-Z][a-z]+)\)\s*$/);
    if (bracket) return bracket[1];

    const named = attendees.find((name) => name && new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(line));
    return named ?? null;

}


export function dueOf(line) {

    const m = line.match(DUE);
    return m ? m[1].replace(/\s+/g, " ") : null;

}


/* The task text of an action line, without the prefix, the owner lead-in and the due phrase. */
function taskOf(line, owner, due) {

    let task = line.replace(NOTE_PREFIX, "").replace(/^@[\w.-]+\s*[:\-]?\s*/, "");

    if (owner) {
        task = task.replace(new RegExp(`^${owner}\\s*(?::|\\s(?:to|will|should|is going to|has to|must)\\s)\\s*`, "i"), "").replace(new RegExp(`\\s*\\(${owner}\\)\\s*$`), "").replace(/\bowner\s*[:\-]\s*[\w.-]+\s*/i, "");
    }

    if (due) {
        task = task.replace(DUE, "").replace(/\s{2,}/g, " ").replace(/[\s,;:]+$/, "");
    }

    task = task.trim().replace(/^[-–:,]\s*/, "");
    return task ? task[0].toUpperCase() + task.slice(1) : line;

}


/* One line, classified: decision, action, question, risk or note. */
export function classifyLine(line, attendees = []) {

    const text = line.trim();
    const prefixed = text.match(NOTE_PREFIX)?.[0].toLowerCase() ?? "";
    const owner = ownerOf(text, attendees);
    const due = dueOf(text);
    const body = () => { const t = text.replace(NOTE_PREFIX, "").trim(); return t ? t[0].toUpperCase() + t.slice(1) : t; };

    /* a question mark decides before anything else: "Is the budget approved?" is a question, whatever words it holds */
    if (/^(?:question|q)/.test(prefixed) || (text.includes("?") && !owner)) {
        return { kind: "question", text: body() };
    }

    if (/^(?:decision|decided)/.test(prefixed) || (DECISION.test(text) && !/^(?:action|todo)/.test(prefixed) && !owner)) {
        return { kind: "decision", text: body() };
    }

    if (/^(?:risk)/.test(prefixed) || (RISK.test(text) && !owner && !/^(?:action|todo)/.test(prefixed))) {
        return { kind: "risk", text: body() };
    }

    if (QUESTION.test(text) && !owner) {
        return { kind: "question", text: body() };
    }

    if (/^(?:action|todo|to-do|follow)/.test(prefixed) || owner || (ACTION_VERB.test(text) && due)) {
        return { kind: "action", text: taskOf(text, owner, due), owner, due };
    }

    return { kind: "note", text };

}


export function extract(notes, attendeesText = "") {

    const attendees = lines(attendeesText.replace(/,/g, "\n")).map((a) => a.split(/\s+/)[0]);
    const items = lines(notes).map((line) => classifyLine(line, attendees));

    return {
        attendees,
        decisions: items.filter((i) => i.kind === "decision"),
        actions: items.filter((i) => i.kind === "action"),
        questions: items.filter((i) => i.kind === "question"),
        risks: items.filter((i) => i.kind === "risk"),
        notes: items.filter((i) => i.kind === "note"),
        total: items.length
    };

}


/* The action plan in Markdown, for the brief page. */
export function actionPlan({ notes, meeting, date, attendees, deliver }) {

    const output = deliver; // "both" | "plan" | "message"

    const r = extract(notes, attendees);
    const title = tidy(meeting) || "Meeting";
    const when = tidy(date);
    const parts = [];
    const action = (a, i) => `${i + 1}. [ ] ${a.text}${a.owner ? ` — owner: ${a.owner}` : " — owner needed"}${a.due ? ` — due: ${a.due}` : " — no date"}`;
    const unowned = r.actions.filter((a) => !a.owner).length;
    const undated = r.actions.filter((a) => !a.due).length;

    if (output !== "message") {
        parts.push(`# Action plan: ${title}${when ? ` (${when})` : ""}`);
        if (r.attendees.length) parts.push(`Attendees: ${r.attendees.join(", ")}`);
        parts.push(`## Decisions\n\n${r.decisions.length ? r.decisions.map((d) => `- ${d.text}`).join("\n") : "No decision was recorded. If something was decided, write it in the notes as \"Decided: …\"."}`);
        parts.push(`## Actions\n\n${r.actions.length ? r.actions.map(action).join("\n") : "No action was recorded. An action is a line with an owner (\"Priya to …\", \"@Priya\") or a due date."}${unowned || undated ? `\n\n${[unowned ? `${unowned} action${unowned === 1 ? " has" : "s have"} no owner` : "", undated ? `${undated} ${undated === 1 ? "has" : "have"} no date` : ""].filter(Boolean).join("; ")}. An action without both is a wish; settle them before the message goes out.` : ""}`);
        parts.push(`## Open questions\n\n${r.questions.length ? r.questions.map((q) => `- ${q.text}`).join("\n") : "None recorded."}`);
        parts.push(`## Risks and blockers\n\n${r.risks.length ? r.risks.map((x) => `- ${x.text}`).join("\n") : "None recorded."}`);
        if (r.notes.length) parts.push(`## Other notes (not sorted)\n\n${r.notes.slice(0, 15).map((n) => `- ${n.text}`).join("\n")}${r.notes.length > 15 ? `\n- and ${r.notes.length - 15} more lines` : ""}`);
    }

    if (output !== "plan") {
        const message = [
            `Hi all,`,
            ``,
            `Thanks for ${title === "Meeting" ? "today's meeting" : title}${when ? ` on ${when}` : ""}. Here is what we decided and who is doing what.`,
            ``,
            r.decisions.length ? `Decisions:\n${r.decisions.map((d) => `- ${d.text}`).join("\n")}` : "",
            r.actions.length ? `Actions:\n${r.actions.map((a) => `- ${a.text}${a.owner ? ` (${a.owner}${a.due ? `, by ${a.due}` : ""})` : a.due ? ` (owner to confirm, by ${a.due})` : " (owner to confirm)"}`).join("\n")}` : "",
            r.questions.length ? `Still open:\n${r.questions.map((q) => `- ${q.text}`).join("\n")}` : "",
            ``,
            `Reply if anything above is wrong or missing.`
        ].filter((l, i, arr) => l !== "" || arr[i - 1] !== "").join("\n");
        parts.push(`## Follow-up message to the attendees\n\n${message}`);
    }

    parts.push(`## To refine it with an assistant\n\nPaste the plan and ask: "Rewrite each action as one sentence starting with a verb, keep every owner and date exactly as given, list the actions with no owner first, and tell me which decisions have no action behind them."`);
    parts.push(`## About this plan\n\nSorted by word patterns in your browser from ${r.total} line${r.total === 1 ? "" : "s"} of notes: a decision is a line that says one was made, an action is a line with an owner or a due date, a question has a question mark or says it is open. A line it did not recognise is under "Other notes"; nothing was invented.`);

    return parts.filter(Boolean).join("\n\n") + "\n";

}
