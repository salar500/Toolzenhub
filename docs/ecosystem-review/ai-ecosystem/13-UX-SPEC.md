# 13. Micro-level UX specification (AI Tools only)

Uses the existing design layer (rule 7.5): `calculator-*` layout classes, shared buttons, tokens in `variables.css`, `ai-tools.css` and `ai-workbench.css`. No new global tokens. Standards: rulebook 7.2, 7.3, 7.6, 7.9.

## 1. Wording

| Element | Wording | Avoid |
| --- | --- | --- |
| AI Home heading | What do you want to do with AI? | "Ask anything", "Chat" |
| Launcher label / placeholder | Describe it in a few words / e.g. test plan for a checkout coupon feature | "Ask me…" |
| Launcher button | Find the right start | "Send", "Generate" |
| Match heading | Closest matches. Choose one: / Several could fit. Choose one: | "I think you want" |
| No match | No close match. Choose what you want to accomplish: | "Sorry, I didn't understand" |
| Optional fields | "(optional)" in the label; essentials "(essential)" | asterisks alone |
| Missing essential | Almost ready. Missing: X. It is marked [add: x] in the prompts. | "Error" |
| Conflict | Check this first: … | "Invalid" |
| Copy feedback (status) | Copied. / Your browser blocked copying: the text is selected, press Ctrl+C or Cmd+C. | toasts that vanish |
| Download | Download .md (a text file you can open again here) | "Export" alone |
| Open file | Open a saved pack | "Import" alone |
| Privacy line | Prepared in your browser. No AI service is called. Nothing is stored. | "100 % private", "secure" |
| Product line | Listed in the AI Directory for this task (not a ranking). | "Recommended", "best" |
| Not verified | Tool suitability not verified. Choose your preferred AI tool. (existing) | |
| Reviewer limits | What this review cannot tell you: whether statements are true… | "Verified", "accurate" |
| Completion | Ready. Standard pack, 3 stages. | "Perfect prompt" |

Plain words for beginners; professional terms only inside the task they belong to (traceability inside testing).

## 2. Hierarchy and layout

- The primary action is visually first in each part (one primary button per part); secondary actions use the secondary style; Reset/Start again sits apart from Copy and Download (rule 7.6).
- Workbench and Reviewer: form and output side by side from 1200 px (existing shared layout), one column below; the output card is the reading column, max line length about 75 characters for prose; prompts in read-only text areas that wrap, monospace not used for prose prompts.
- Long packs: stage navigation list; collapsed stages at Multi-stage; "Prompts only" view; a "Back to the questions" link at the end of the pack.
- Warnings use the existing alert style with a word label ("Check this first"), never colour alone.
- No sticky element other than the existing site header and phone section bar; nothing covers the output on phones.

## 3. Interaction

| Interaction | Rule |
| --- | --- |
| Live update | pack updates after a short pause; never moves focus; one announcement per state change (existing) |
| Show my Work Pack | moves focus to the pack heading (existing) |
| Copy | per prompt and whole pack; status message; fallback selects the text |
| Open file | file input with a visible label; errors in words beside it; focus to the restored Details heading on success |
| Mode and view switches | native radio groups; no content loss on switching |
| Back navigation | the query string (`?task=`) restores the task on Back; answers are not in history |
| Reset | confirms with a native `confirm` only when a field has text; focus to the first control after reset (existing pattern) |
| Expand/collapse | native `details`; "Expand all" toggles all and its label |
| Hand-off links | ordinary links (workspace navigation); the receiving page announces "Brought from the Workbench: requirements for <task>." |

## 4. Accessibility

Semantic headings per part (h2 page parts, h3 sections, h4 stages: existing); fieldsets with legends for choice groups; labels and linked hints; errors linked with `aria-describedby`; one polite status region per tool; visible focus (shared); 44 px targets; reduced motion respected (no animation added); colour contrast from tokens; text areas usable at 200 % zoom without horizontal page scroll; the launcher results are a list of links with the score not exposed; copy buttons have accessible names including what they copy ("Copy stage 2 prompt").

## 5. Mobile

320, 360, 390 px: one column; buttons wrap to full width; the 16 px input text rule (no zoom on focus); long tokens wrap (`overflow-wrap: anywhere`, existing); file input reachable; the pack's stage navigation becomes a short list at the top of the stages.
