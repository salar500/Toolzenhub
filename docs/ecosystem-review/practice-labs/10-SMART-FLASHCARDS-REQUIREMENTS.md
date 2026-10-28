# 10 Smart Flashcards requirements

**PROPOSED — NOT APPROVED FOR IMPLEMENTATION**

**Owner decision recorded 2026-10-28:** the Option B scope baseline in doc 18 was approved with conditions. Only what doc 18 records as approved is approved; everything else in this document remains a proposal for Master Prompt 2 to develop. No implementation has started.

Practice Labs & Smart Flashcards ecosystem, Prompt 1 of 3 (research and requirements). Written 2026-10-28. Nothing here is a rule, a build queue or an approval; the rulebook is `docs/product-decision-rules.md`.

Evidence labels used throughout: **OBSERVED** (seen on a public page or in the repository this session), **CLAIMED** (stated by the source about itself, not verified), **INFERRED** (reasoned from observations), **UNKNOWN** (not established). **VERIFIED/HYPOTHESIS** follow rulebook 12.

## What is recommended

One reusable flashcard engine and one page, **Smart Flashcards**, with **three launch decks**: JSON and data formats, HTTP and APIs, Software testing. 3 decks of about 36 cards each (a planning minimum). The engine, not the deck, is the unit of work (doc 12).

### Card formats

| Format | In scope? | Reason |
|---|---|---|
| Basic question and answer with reveal and self-grade | Yes ("recall" card) | the simplest retrieval practice |
| Multiple choice (single answer) | Yes ("choice" card) | automatic, unambiguous grading |
| Code-output prediction | Yes, as a **choice** card with the answer worked out ahead of time; no code is run | executes nothing |
| Scenario-based reasoning and true/false with explanation | Yes, as **choice** cards | same engine |
| Find the bug | Not as a card; it is the labs | free-form |
| Fill in the missing concept (typed) | No | typed answers are ambiguous without a lab-style checker |
| Multiple-answer questions | No in this scope | partial credit is a scoring decision that is not needed yet |

### Capabilities included and excluded

| Capability | Included? | Where |
|---|---|---|
| Question, reveal, explanation, self-assessment | Yes | FR-FC-002 to 006 |
| Difficulty rating | No: a two-grade known / not known scale only | FR-FC-006 |
| Next and previous card, topic filter | Yes | FR-FC-007 to 009 |
| Incorrect-answer (mistake) review | Yes, works with no storage | FR-FC-010 |
| Revision scheduling and daily practice | Yes, only when the learner opts in to saving | FR-FC-015 to 018 |
| Progress summary | Yes, plain counts only | FR-FC-011 |
| Reset, export, import | Yes | FR-FC-021 to 023 |
| Keyboard controls | Yes, Tab, Enter, Space and arrows in the card region; no single-key shortcuts | FR-FC-014 |
| Offline | Pages work after loading; no service worker (candidate 54 DEFER) | doc 14 |
| Streaks, points, badges, leaderboards, reminders | **No**: rulebook 7.7 | FR-LRN-013 |

### Single engine, subject decks: the tradeoff

One engine with decks avoids dozens of near-identical pages and keeps maintenance in content rather than code, but one page ranks for fewer specific searches than several. Recommended: one page now, decide on per-deck pages from measured demand later (doc 09).

### Lab-to-flashcard loop

After a lab explanation, a plain link opens the Smart Flashcards deck at a topic. The topic is a static id in the link; no visitor data is passed. With saving on, the learner's own session continues as normal; there is no cross-page automatic feeding of missed items in this scope (that would require labs to save state, which is deliberately not done).

## Requirements

### Smart Flashcards (tool id smart-flashcards)

- **Intended learner:** Developers, testers and students who want short, repeatable revision of technical concepts.
- **User input:** Deck choice, topic filter, option choice, self-grade, optional progress file.
- **Accessibility (applies to every requirement below):** Real buttons and radio groups, visible focus, answer text and result words (never colour alone), no flip animation, no single-key shortcuts, arrow-key navigation only inside the card region.
- **Privacy (applies to every requirement below):** Nothing is stored unless the learner turns on saving; no network request carries card or progress data; the progress file is created and read in the browser.


| ID | Requirement (interaction, expected behaviour, output, validation, error handling) | Priority | Depends on | Acceptance |
|---|---|---|---|---|
| FR-FC-001 | The page lists three decks (JSON and data formats, HTTP and APIs, Software testing), each with title, card count and topic names taken from the deck data. Choosing a deck starts a session on that deck; nothing starts automatically. | P0 | FR-LRN-001 | AC-FC-001 |
| FR-FC-002 | A card shows its prompt as text. Code in a prompt is shown in a code block that scrolls inside its own region; long prompts wrap; the page never scrolls sideways at 320 px. | P0 | FR-LRN-004 | AC-FC-002 |
| FR-FC-003 | A recall card has a Show answer button. Pressing it shows the answer and the explanation and moves focus to the first self-grade button; the reveal is announced once; there is no flip animation. | P0 | FR-FC-002 | AC-FC-003 |
| FR-FC-004 | A choice card has two to five options in a radio group and a Check answer button. Checking states in words whether the choice was correct, names the correct option, and shows the explanation. Only single-answer cards exist in this scope. | P0 | FR-FC-002 | AC-FC-004 |
| FR-FC-005 | Every card has an explanation of at least one sentence that says why the answer is right. A deck whose card lacks one is rejected by the content test and cannot be published. | P0 | FR-LRN-001 | AC-FC-005 |
| FR-FC-006 | A recall card is graded by the learner with two buttons, I knew it and I did not know it. A choice card is graded by the result of Check answer. A card is graded once per pass; the grade cannot be changed afterwards in the same pass. | P0 | FR-FC-003, FR-FC-004 | AC-FC-006 |
| FR-FC-007 | Next card shows the following card in deck order (or in the order produced by the optional Shuffle setting, which is off by default). After the last card the session summary is shown. | P0 | FR-FC-006 | AC-FC-007 |
| FR-FC-008 | Previous card shows the earlier card read-only with its recorded result; grades cannot be changed there. Previous is disabled on the first card and says why in text. | P0 | FR-FC-006 | AC-FC-008 |
| FR-FC-009 | Topic checkboxes filter the session. At least one topic must stay selected; unchecking the last one is refused with a message. Changing the filter starts a new pass over the matching cards. | P0 | FR-FC-001 | AC-FC-009 |
| FR-FC-010 | Review missed cards starts a pass over the cards graded not known in the current session. With none missed the control is disabled and says No missed cards. It works without saved progress. | P0 | FR-FC-006 | AC-FC-010 |
| FR-FC-011 | The session summary shows plain counts: cards seen, known, not known, and the same per topic. It shows no percentage labelled as mastery, no score and no streak. | P0 | FR-FC-006 | AC-FC-011 |
| FR-FC-012 | A deck that fails validation, or a topic filter that matches no card, gives a plain message and leaves the page usable; no card is shown from invalid data. | P0 | FR-LRN-001 | AC-FC-012 |
| FR-FC-013 | A deck of one card works: Previous is disabled, Next goes to the summary, and Restart session starts again from that card. | P0 | FR-FC-007 | AC-FC-013 |
| FR-FC-014 | Every function works with Tab, Enter and Space. Left and Right arrows move between cards only while the card region has focus; no single printable key triggers an action. | P0 | FR-FC-007, FR-FC-008 | AC-FC-014 |
| FR-FC-015 | Saving progress is off by default. A labelled switch, Save my progress on this device, turns it on after a plain-language explanation of what is stored. While it is off, no browser storage is written (local storage, session storage, cookies, IndexedDB). | P0 | Owner decision F | AC-FC-015 |
| FR-FC-016 | When saving is on, each card has a box from 1 to 5. A new card is in box 1. Known moves a card up one box (maximum 5); not known returns it to box 1. The review interval in days for boxes 1 to 5 is 1, 3, 7, 14 and 30. The scheduler is a pure function of the saved state, the grade and the local calendar date. | P0 | FR-FC-015 | AC-FC-016 |
| FR-FC-017 | Review due cards starts a pass over the cards due today in the chosen deck, lowest box first, then deck order. With none due, the page says so and shows the next due date. | P0 | FR-FC-016 | AC-FC-017 |
| FR-FC-018 | Dates are local calendar days held as whole day numbers. A card is due when today is at least the last review day plus the interval. A last review in the future (the device date was set back) makes the card due today. Month ends, leap days and clock changes do not alter the result. | P0 | FR-FC-016 | AC-FC-018 |
| FR-FC-019 | Saved state is validated when read: schema version, known deck ids, existing card ids, boxes from 1 to 5, valid dates, total size at most 100 KB. Invalid entries are dropped with a notice; a wholly invalid state is discarded with a notice; reading never throws. | P0 | FR-FC-016 | AC-FC-019 |
| FR-FC-020 | If storage is unavailable or full, the page works for the session, the switch is disabled with the reason in text, and no error text from the browser is shown. | P0 | FR-FC-015 | AC-FC-020 |
| FR-FC-021 | Reset progress asks for confirmation in a dialog (the existing dialog helper), then removes the saved state of the chosen deck or of all decks, announces the result once and returns focus to the control that opened it. | P0 | FR-FC-015 | AC-FC-021 |
| FR-FC-022 | Export progress downloads a versioned JSON file made in the browser, containing only deck ids, deck versions, card ids, boxes and review days. The file name is toolzenhub-flashcards-progress-YYYY-MM-DD.json. | P0 | FR-FC-016 | AC-FC-022 |
| FR-FC-023 | Import progress reads one file of at most 100 KB, parses it as strict JSON, validates it like FR-FC-019, shows a summary (decks and card counts) and applies it only after an explicit Apply import. Any failure names the problem and leaves the current state unchanged. Nothing in the file is executed or shown as markup. | P0 | FR-FC-019 | AC-FC-023 |
| FR-FC-024 | Each deck has a version and each card a stable id. When a deck version changes, saved progress for ids that still exist is kept, removed ids are dropped and new ids start in box 1. | P0 | FR-LRN-002 | AC-FC-024 |
| FR-FC-025 | A card may name published tools to link to. The link is a plain anchor with no values in the address; a card with no tool shows no link; link targets are checked by the link check. | P0 | FR-INT-004 | AC-FC-025 |
| FR-FC-026 | The page states, near the progress controls, that the schedule is a simple fixed-interval rule and not a guarantee of memory, and uses the words known and not known (never mastered). | P0 | FR-LRN-013 | AC-FC-026 |

## Content notes for the three decks (proposals)

- **JSON and data formats:** what strict JSON allows and rejects (RFC 8259), common errors, Base64 and percent-encoding concepts, how JSONPath and JSON Pointer differ (RFC 9535 and RFC 6901 are the sources).
- **HTTP and APIs:** status code classes and everyday codes (RFC 9110), idempotence and safe methods, headers, scenario cards ("which code fits this response").
- **Software testing:** test design techniques, test levels, defect and failure terms, regression and retest; the ISTQB syllabus is publicly downloadable but its licence is not stated on the page read, so content must be original and the syllabus is a reference for terminology only.
- Each card: stable id, topic, prompt, answer or options, explanation, source, review record (FR-LRN-001 to 003).
