# 08. AI Context Bridge specification

Evolves the Project Context Pack Builder (`context-pack-builder`, `/tools/context-pack-builder/`). The id, URL and the existing fields' meaning are kept; the title becomes "AI Context Bridge" if the owner approves D2 (otherwise the capability ships under the current title). The old name stays an alias.

## 1. Problem and honest boundary

Projects, memory and reusable instructions live inside each AI product (`03` section 1). Moving a project means retyping it or pasting a summary (S6). The Bridge makes that summary **structured, short, updatable and product-neutral**. It never claims to import, read or synchronise conversations: the only ways in are what the visitor types, pastes or opens from a file.

## 2. Data structure (one Context Pack)

| Section | Field key | Kind | Short handoff | Notes |
| --- | --- | --- | --- | --- |
| Identity | `project` | text 120 | yes | required for a ready pack |
| Objective | `purpose` (existing) | 1-3 sentences | yes | |
| Current status | `state` (existing) | text | yes | dated by the pack date |
| My role and level | `role` | text | yes | optional |
| Technical or working context | `stack` (existing) | list | yes | |
| Requirements and constraints | `rules` (existing, widened) | list | yes | |
| Decisions | `decisions` (new) | list of "decision — reason" | yes (latest 5) | |
| Rejected approaches | `rejected` (new) | list | no | prevents re-proposals |
| Terminology | `terms` (new) | list "term: meaning" | no | |
| Files and references | `files` (existing) | list "name — what it is — where" | names only | never file contents |
| Work completed (do not redo) | `done` (existing) | list | last 5 | |
| Open issues and risks | `issues` (existing) | list | yes | |
| Next task | `task` (existing) | text | yes | |
| How it will be checked | `verify` (existing) | text | yes | |
| Instructions for the next AI | `reply` (existing select) + free text | select + text | yes | |

Lists are one item per line; markers stripped and re-rendered (existing engine behaviour). Limits: list item 300 characters, section 2,000, whole pack 12,000; the counter shows words.

## 3. Modes (one radio group at the top)

1. **Project brief**: everything, for the first message of a new project or the project instructions field of a product.
2. **Hand off to another AI**: the short handoff (marked columns above) plus "Start by confirming your understanding in three lines, then wait" (existing reply option). Target: under 400 words.
3. **Continue a session**: status, decisions since the last pack, done, open issues, next task; for a new chat in the same product after a limit or a long thread.
4. **Coding agent file**: Markdown headings in the AGENTS.md style (project, stack, commands to verify, rules, where things are, do-not list); a note: "Save it in your repository under the file name your coding assistant reads." No claim about which tools read which name (S15 sources conflict).

All modes render from the same fields; switching mode never loses a field.

## 4. Getting context out of an AI product (the extraction prompt)

"Bring context from an AI conversation" offers a fixed prompt to paste at the end of the old conversation: it asks the AI to answer under the Bridge's exact headings, to write "none" where it has nothing, not to invent, and to quote decisions as they were agreed. The visitor pastes the reply into "Paste the reply here"; the parser fills fields by heading (case-insensitive, tolerant of `#`, `**`, numbering); text under unknown headings goes to a "Notes to sort" field; empty sections are listed ("The reply had nothing for: Decisions, Next task"). The visitor reviews every field before use; the page says the AI's summary may be wrong or incomplete.

## 5. Updating instead of rewriting

- **Open a saved pack** (file or paste): fields restored from the metadata block, or by heading parse for older packs without one.
- On restore the pack shows "Version 3, 2026-11-10". Any edit marks the field "changed"; download writes version 4 with today's date and a **"Changed since version 3"** list (section names only) at the top of the pack, so the next AI sees what is new.
- **Staleness hints** (deterministic, wording "check"): the pack is more than 14 days old; a line appears in both Done and Next task; Next task is empty while Open issues has items; a decision line contradicts a rejected line with the same leading words.
- **Compress**: the Short handoff keeps the latest five items in long lists, and the page says how many were left out.

## 6. Output format

Markdown: `# Project context: <project>`, a metadata block (`14` section 3) with `kind: context-pack`, `version`, `date`, `mode`; then the sections in the table's order, only non-empty ones; then the instruction line for the chosen mode. Copy, Download `.md` (`context-<project-slug>-v<version>.md`), Reset (asks for confirmation when anything is filled).

## 7. Hand-offs

"Use in the Workbench" sends the pack text in memory (`14` section 4). The Workbench can start a pack: "Start a context pack from this task" fills project (task title), objective (the goal line), requirements (the task's answers) and next task (stage 1).

## 8. Privacy

Nothing is stored; the page says: "Remove passwords, keys and personal data before you paste this into any AI product." A deterministic warning appears when a field contains something that looks like a secret (patterns: `sk-`, `AKIA`, `-----BEGIN`, `password=`, long hex or base64 strings over 32 characters); it never alters the text (rule 8.5).

## 9. Acceptance criteria

1. Every mode renders from the same fields; switching modes back and forth changes no field.
2. Extraction round trip: a reply using the headings fills every field; a reply with extra or missing headings is handled as in section 4; nothing is invented.
3. Open, edit, download: version +1, today's date, the changed list correct; a pack without metadata parses by headings.
4. Short handoff stays under 400 words for the fixture "large project" and states how many items were left out.
5. Secret-like text warns without changing the field.
6. Existing Context Pack tests keep passing (field meaning unchanged).
