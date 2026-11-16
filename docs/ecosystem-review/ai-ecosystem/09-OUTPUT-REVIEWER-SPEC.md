# 09. AI Output Reviewer specification

Evolves the AI Answer Evidence Checklist (`ai-answer-checklist`, `/tools/ai-answer-checklist/`): id and URL kept; title "AI Output Reviewer" if the owner approves D3; the claim engine is kept as one part. Compare Two AI Answers stays a separate tool and is linked ("Got two answers? Compare them").

## 1. Problem and honest boundary

Answers are often "almost right" (S19) and citations often wrong (S26). A deterministic browser tool **cannot judge truth**. It can (a) check the answer against what the visitor asked, (b) find what needs checking and make the checking fast, and (c) write the follow-up prompt. Rulebook 4.11 holds: no score of correctness, no "verified", no "accurate".

## 2. Inputs

| Input | Required | Source |
| --- | --- | --- |
| The AI's answer | yes | paste (40,000 characters) |
| What you asked (the request) | optional, strongly suggested | paste; or arrives from the Workbench (task, deliverable, requirements, format, quality checks); or open a Work Pack file |
| What the answer is for | optional select | existing purposes (learning; money, law or health decision; code to run; publish or send) plus "a deliverable for work" |
| Review type | auto from the task, or chosen | General, Code, Test plan or cases, Article or copy, Research or report, Data analysis, Image or video prompt, Storyboard |
| Review dimensions | checkboxes, defaults per review type | section 3 |

## 3. Review dimensions: what the browser checks versus what it asks

| Dimension | Deterministic check in the browser | Framed as a question or prompt |
| --- | --- | --- |
| Requirement coverage | each requirement line: its key content words (at least two, stop words removed) found in the answer? Result "visibly addressed" or "not visibly addressed" (never "met") | the coverage-table prompt (existing FINAL_REVIEW wording) |
| Format compliance | requested headings present; table present (`|---|` row) when asked; valid JSON when "JSON only" (parse); fenced code when code asked; word count against a stated limit; number of items against a stated count | none |
| Leftovers | `[add:`, `TODO`, `TBD`, `lorem`, `XXX`, `<placeholder>`, "as an AI", unfinished last sentence | none |
| Claims to verify | existing claim engine: money, percentages, dates, other figures, named sources, absolute wording, hedges | "how to check" per kind (existing) |
| Links and citations | every URL and citation-like text listed with "open and confirm it says this"; duplicates flagged; never fetched | evidence refinement prompt |
| Internal contradictions | the same subject with two different figures in the answer (reuse compare-engine figure matching within one text) | "Which is correct?" prompt |
| Missing caveats | for money, law, health and code purposes: no assumption, no limitation, no date for figures (existing omissions) | ask-back questions (existing) |
| Technical quality (code) | language of fences versus the requested language; tests mentioned when asked; secrets-like strings | technical refinement prompt |
| Test plan or cases | ids present; expected results present per case (lines after "Expected"); requirement ids from the request referenced | completeness prompt |
| Article or copy | heading count, length, banned phrases from the request, figures listed | clarity and accuracy prompts |
| Image or video prompt | elements of the brief (subject, framing, lighting, text, keep-unchanged items) mentioned | visual and continuity prompts |
| Logical consistency, factual accuracy, quality of reasoning | not checked; the page says so | the accuracy and missing-information refinements |

## 4. Output

1. A one-line state: "Review ready. 3 requested items not visibly addressed, 7 statements to verify, format: 1 problem." (counts only; no score).
2. **Against your request**: each requirement with "visibly addressed" or "not visibly addressed" and the matching excerpt (first matched sentence) to check by eye.
3. **Format** findings, **Leftovers**, **Contradictions**.
4. **To verify** (existing checklist, with boxes).
5. **Follow-up prompt** (one editable text area): lists only the gaps found, in order, then "Give the corrected <deliverable> in full." Copy.
6. **What this review cannot tell you** (always shown, short): truth, quality of reasoning, whether sources say what is claimed.
7. Download review `.md` (metadata `kind: review`).

## 5. Wording rules

"Not visibly addressed" never "missing" (a paraphrase can address it without the words); "to verify" never "suspicious" or "wrong"; "looks like" for patterns. Counts are facts about the text, never a quality grade.

## 6. Limits

Answer 40,000 characters; request 12,000; work is synchronous and bounded (sentence splitting is linear; figure matching capped at 400 sentences, beyond which the page says only the first 400 sentences were compared).

## 7. Acceptance criteria

1. Fixtures per review type with hand-written expected findings (rule 8.2); a paraphrased requirement is reported as "not visibly addressed" and the excerpt column is empty, never "failed".
2. Invalid JSON when "JSON only" was asked is reported with the parser's position; valid JSON passes.
3. Leftover markers found in fixtures; none in clean fixtures.
4. No output says verified, accurate, correct, true, score or percentage.
5. From the Workbench in the same tab: the request arrives; after reload: paste still works.
6. Existing checklist tests keep passing.
