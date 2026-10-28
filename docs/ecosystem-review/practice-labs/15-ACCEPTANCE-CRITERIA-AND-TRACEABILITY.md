# 15 Acceptance criteria and traceability

**PROPOSED — NOT APPROVED FOR IMPLEMENTATION**

**Owner decision recorded 2026-10-28:** the Option B scope baseline in doc 18 was approved with conditions. Only what doc 18 records as approved is approved; everything else in this document remains a proposal for Master Prompt 2 to develop. No implementation has started.

Practice Labs & Smart Flashcards ecosystem, Prompt 1 of 3 (research and requirements). Written 2026-10-28. Nothing here is a rule, a build queue or an approval; the rulebook is `docs/product-decision-rules.md`.

Evidence labels used throughout: **OBSERVED** (seen on a public page or in the repository this session), **CLAIMED** (stated by the source about itself, not verified), **INFERRED** (reasoned from observations), **UNKNOWN** (not established). **VERIFIED/HYPOTHESIS** follow rulebook 12.

## Counts (computed by the generator)

Functional requirements: **89** (CRN 6, FC 26, INT 9, JEF 6, JPC 6, LAB 14, LRN 14, TDL 8). Feature acceptance criteria: **91**. Cross-cutting acceptance criteria: **23** (security 8, accessibility 8, performance 7). Total acceptance criteria: **114**. Every requirement is P0 because the recommended scope (Option B) contains only P0 candidates; requirements for P1 and later candidates are deliberately not written.

Each criterion is written as Given, When, Then with an explicit Pass condition. Normal, boundary, negative and failure cases are all present (for example AC-FC-018 boundaries, AC-TDL-002 negatives, AC-FC-019 and AC-LRN-011 failures). None has been executed: nothing is built. Tests that need a real device or screen reader say so and may only be reported Pass if actually run.

## Feature acceptance criteria

| ID | Given (initial conditions) | When (input and action) | Then (expected output) and Pass condition | Covers |
|---|---|---|---|---|
| AC-FC-001 | Page loaded, nothing chosen | Read the deck list; click the HTTP and APIs deck | Three decks shown with counts equal to the data; the first card of the chosen deck is shown. Pass if counts match and no session started before the click. | FR-FC-001 |
| AC-FC-002 | A card whose prompt has a 120-character code line | View at 320 px | The code block scrolls inside its region; document scroll width equals viewport width. Pass if no page-level horizontal scroll. | FR-FC-002 |
| AC-FC-003 | Recall card shown | Press Show answer with the keyboard | Answer and explanation appear; focus is on the first grade button; one status announcement. Pass if all three hold. | FR-FC-003 |
| AC-FC-004 | Choice card shown | Select an incorrect option, press Check answer; then reset and select the correct one | Each time the result says Correct or Not yet in words, names the correct option and shows the explanation. Pass if the words and option are present in both cases. | FR-FC-004 |
| AC-FC-005 | Test deck with one card missing its explanation | Run the content test | The test fails and names the card id. Pass if the build fails. | FR-FC-005 |
| AC-FC-006 | Recall card revealed | Press I knew it, then try to press I did not know it | The card is recorded known; the second action is unavailable. Pass if the grade stays known. | FR-FC-006 |
| AC-FC-007 | Pass of 3 cards | Press Next after each grade | Cards appear in deck order; after card 3 the summary appears. With Shuffle on and a fixed seed the order equals the seeded order. Pass on both. | FR-FC-007 |
| AC-FC-008 | On card 2 after grading card 1 known | Press Previous | Card 1 shows read-only with result known; grade buttons are absent; Previous is disabled on card 1 with reason text. Pass if all hold. | FR-FC-008 |
| AC-FC-009 | Deck with topics A and B | Uncheck A; then uncheck B | After A is unchecked only B cards are shown; unchecking B is refused with a message and B stays checked. Pass if both hold. | FR-FC-009 |
| AC-FC-010 | Session with 2 cards graded not known | Press Review missed cards; then restart a fresh session | The pass contains exactly the 2 cards; in the fresh session the control is disabled with No missed cards. Pass if both hold. | FR-FC-010 |
| AC-FC-011 | Session finished with 5 known, 3 not known | Read the summary | Counts show 8 seen, 5 known, 3 not known and per-topic counts; no percentage, score or streak text. Pass if counts are exact and banned words are absent. | FR-FC-011 |
| AC-FC-012 | Deck data with an empty card list; and a filter matching no card | Open the deck | A plain message is shown and no card is displayed; the page still responds. Pass if no exception reaches the console as an uncaught error. | FR-FC-012 |
| AC-FC-013 | Deck with one card | Grade it; press Next; press Restart session | Summary after Next; Previous disabled; restart shows the card again. Pass if all hold. | FR-FC-013 |
| AC-FC-014 | Keyboard only | Complete a 3-card session using Tab, Enter, Space and arrows; press letters and digits | Every action is reachable; letters and digits do nothing; arrows work only with focus in the card region. Pass if all hold. | FR-FC-014 |
| AC-FC-015 | Fresh browser profile | Complete a session with the switch off; then turn it on and grade one card | With the switch off, local storage, session storage, cookies and IndexedDB are unchanged; with it on, exactly one key tz-learn-v1 exists. Pass if both hold. | FR-FC-015 |
| AC-FC-016 | Saving on; injected dates | A new card is graded known on days 100, 103, 110, 124 and 154 (each is a day it falls due), then graded not known on day 184 | After the five known grades the boxes are 2, 3, 4, 5, 5 with next due days 103, 110, 124, 154, 184; the not-known grade on day 184 puts it in box 1 with next due day 185. Pass if every value equals the table computed by an independent calculation. | FR-FC-016 |
| AC-FC-017 | Saving on; 4 cards due, 2 not due | Press Review due cards | The pass has the 4 due cards, lowest box first. With none due the message shows the next due date. Pass if both hold. | FR-FC-017 |
| AC-FC-018 | Review on 2028-02-28 with box 2 (3 days) | Check due on 2028-03-01, 2028-03-02; then set today earlier than the last review; then a DST change day | Due on 2028-03-02 not before (leap day counted); a future last review is due today; DST gives the same result. Pass if all hold. | FR-FC-018 |
| AC-FC-019 | Saved value edited by hand | Reload with: wrong version; unknown deck id; box 9; invalid date; 150 KB value; not JSON | Each case yields a notice and a working page; valid entries in the partial cases are kept. Pass if no exception and the notices appear. | FR-FC-019 |
| AC-FC-020 | Storage blocked or quota exceeded (simulated) | Load the page and try to turn saving on | The switch is disabled with the reason in text; the session works; no browser error text is shown. Pass if all hold. | FR-FC-020 |
| AC-FC-021 | Saved progress for 2 decks | Press Reset progress, cancel; press again and confirm for one deck | Cancel changes nothing; confirm removes that deck only; one announcement; focus returns to the opening control. Pass if all hold. | FR-FC-021 |
| AC-FC-022 | Saved progress exists | Press Export progress | A file with the stated name downloads; its content parses as JSON and lists only deck ids, versions, card ids, boxes and days. Pass if no other field is present. | FR-FC-022 |
| AC-FC-023 | Saving on | Import: a valid file; a file of 101 KB; a non-JSON file; a file with a script string in an id; a file with unknown deck | Valid file: summary then Apply import changes state; every failure shows a specific message and leaves state unchanged; the script string is never executed or shown as markup. Pass if all hold. | FR-FC-023 |
| AC-FC-024 | Saved progress for deck version 1 with ids a, b, c | Load deck version 2 that removes b and adds d | a and c keep their boxes; b is gone; d is box 1. Pass if exactly so. | FR-FC-024 |
| AC-FC-025 | A card with a tool link and one without | Open both | The first shows a plain link to a published tool with no query string; the second shows none. Pass if both hold and the link check passes. | FR-FC-025 |
| AC-FC-026 | Page loaded | Read the progress area | The fixed-interval statement and the words known and not known are present; banned words absent. Pass if so. | FR-FC-026 |
| AC-LAB-001 | Any lab | Open the exercise list | Every exercise shows title, difficulty label and objective; each label matches the rubric record in the data. Pass if no exercise lacks any of the three. | FR-LAB-001 |
| AC-LAB-002 | Any lab | Read the introduction and the worked example | Introduction is at most 80 words; the worked example has no submit control. Pass if both hold. | FR-LAB-002 |
| AC-LAB-003 | Exercise with starting text | Edit the text; press Reset exercise | The counter updates while typing; Reset restores the starting text exactly; nothing else changes the text. Pass if the restored text equals the data. | FR-LAB-003 |
| AC-LAB-004 | A checked answer showing Correct | Type one more character | The result disappears and a note says the earlier result no longer applies. Pass if so. | FR-LAB-004 |
| AC-LAB-005 | Fixed response and exercise | Check it 20 times in a fresh page each time | The verdict and findings are identical each time. Pass if all 20 results are equal. | FR-LAB-005 |
| AC-LAB-006 | Exercise open | Check an empty response; an over-limit response; a correct one; an incorrect one | Cannot check for the first two (own messages, no attempt counted); Correct; Not yet. Pass if all four verdicts are right. | FR-LAB-006 |
| AC-LAB-007 | Exercise open, incorrect response | Read feedback; press Show hint three times; press Show solution | Feedback names the failed condition without the answer; one hint appears per press, at most three; the solution shows with explanation and the exercise is marked Solution viewed. Pass if all hold. | FR-LAB-007 |
| AC-LAB-008 | Any exercise | Read the explanation | At least one sentence of reasoning is present; where a standard applies a reference is present. Pass by content test over all exercises. | FR-LAB-008 |
| AC-LAB-009 | Exercise 2 with typed text and feedback | Press Try again; type; go to exercise 3 and back; press Reset exercise | Try again clears feedback and keeps the text; the text is still there after navigation; Reset restores the start. Pass if all hold. | FR-LAB-009 |
| AC-LAB-010 | A response checked once | Press Check three times quickly without editing | Same result; the result region changed once; one announcement. Pass if so. | FR-LAB-010 |
| AC-LAB-011 | Lab with 3 exercises | Solve one directly, view the solution of one, leave one | Counts read 1 completed, 1 solution viewed, 1 not started. Reload: all back to not started. Pass if both hold. | FR-LAB-011 |
| AC-LAB-012 | Exercise open | Paste 20,001 characters; press Check | Check is refused with the limit stated; the evaluator is not called. Pass if the evaluator spy count is 0. | FR-LAB-012 |
| AC-LAB-013 | Exercise with a tool link | Click the link | The tool opens at its plain URL with no query string or fragment carrying text. Pass if the URL has none. | FR-LAB-013 |
| AC-LAB-014 | Evaluator forced to throw | Press Check | The fixed message appears; the response text is unchanged; no stack text. Pass if all hold. | FR-LAB-014 |
| AC-JEF-001 | Exercise data | Run the content test | At least 16 exercises, three levels, and every fault family of FR-JEF-001 present. Pass if the test passes. | FR-JEF-001 |
| AC-JEF-002 | Exercise with a trailing comma | Check: the corrected text; the text with deleted content; the text with different indentation | Corrected: Correct. Deleted content: valid but Not yet. Re-indented: Correct. Pass if all three verdicts are right. | FR-JEF-002 |
| AC-JEF-003 | Exercise with a missing brace | Check the unchanged starting text | Feedback shows the validator message with line and column and a hint. Pass if line and column equal the validator's own output for that text. | FR-JEF-003 |
| AC-JEF-004 | Exercise whose expected value has price 12.5 | Delete the decimal part so the JSON is valid but price is 12 | Feedback says valid but different and lists the path to price without the values. Pass if the path is listed and 12.5 is not shown. | FR-JEF-004 |
| AC-JEF-005 | Any exercise | Read the links and references | A plain link to the JSON Formatter and an RFC 8259 section are present. Pass if both present. | FR-JEF-005 |
| AC-JEF-006 | Exercise open | Paste 501 levels of nesting; paste 20,001 characters | Depth: the validator message is shown; length: refused. Pass if both hold. | FR-JEF-006 |
| AC-JEF-008 | Exercise with several correct fixes | Check three different correct fixes (single line, indented, keys reordered) | All three Correct. Pass if all three are Correct. | FR-JEF-002 |
| AC-JPC-001 | Exercise data | Run the content test | At least 16 exercises, three levels, all listed families present, expected paths equal an independent computation. Pass if so. | FR-JPC-001 |
| AC-JPC-002 | Exercise to select all book titles | Check $.store.book[*].title and $['store']['book'][*]['title'] | Both Correct. Pass if both Correct. | FR-JPC-002 |
| AC-JPC-003 | Any exercise | Check a query with a syntax error; a query using match(); a query with a script expression | Each gives Cannot check with the engine's message and position. Pass if all three do. | FR-JPC-003 |
| AC-JPC-004 | Exercise expecting 2 nodes | Check a query selecting 3 nodes including 1 wrong | Feedback lists the 1 extra path and no missing path. Pass if exactly so. | FR-JPC-004 |
| AC-JPC-005 | Any exercise | Enter 1,001 characters; enter a query that reaches the work bound on a large built-in document | The first is refused with the limit; the second shows the does-too-much-work message within 2 seconds. Pass if both hold. | FR-JPC-005 |
| AC-JPC-006 | Exercise marked ordered | Check a query returning the right nodes in the wrong order; then an unordered exercise with the same | Ordered: Not yet; unordered: Correct. Pass if both. | FR-JPC-002 |
| AC-JPC-007 | Any exercise | Try to type into the document region | It cannot be edited and scrolls inside its region. Pass if so. | FR-JPC-006 |
| AC-CRN-001 | Exercise data | Run the content test | At least 14 exercises, three levels. Pass if so. | FR-CRN-001 |
| AC-CRN-002 | Exercise: every weekday at 09:30 | Check 30 9 * * 1-5, 30 9 * * MON-FRI, 30 09 * * 1,2,3,4,5 and 30 9 * * * | The first three Correct; the last Not yet. Pass if so, with expected sets computed by an independent oracle. | FR-CRN-002 |
| AC-CRN-003 | A wrong valid expression | Check it | Three next run times from the fixed reference date are shown, plus the requirement in words; the target expression is not shown. Pass if so. | FR-CRN-003 |
| AC-CRN-004 | Any exercise | Check 5 fields with an invalid value; 6 fields; 257 characters | Cannot check with the engine's message; the third is refused with the limit. Pass if all hold. | FR-CRN-004 |
| AC-CRN-005 | Page loaded | Read the dialect note | It names Cronie, five fields, and that other schedulers differ. Pass if present. | FR-CRN-005 |
| AC-CRN-006 | The day-of-month and day-of-week exercise | Check expressions with both fields set | Verdicts follow the engine's stated rule and the explanation matches. Pass if equal to the engine's own matching for 3 sample dates. | FR-CRN-006 |
| AC-TDL-001 | Exercise data | Run the content test | At least 10 + 10 exercises, three levels, every limit says inclusive or exclusive, second-reviewer flag present. Pass if so. | FR-TDL-001 |
| AC-TDL-002 | Boundary exercise | Enter 1, 2, 9.5, abc; enter 31 values; enter 1000000001 | Each error names the token or the limit and nothing is checked. Pass if all three refuse. | FR-TDL-002 |
| AC-TDL-003 | Exercise: valid 10 to 99 inclusive, three-value | Enter 9,10,11,98,99,100; enter 10,99 only; enter all six plus 50 | First Correct; second Not yet with two missing roles named (not numbers); third Correct with 50 listed as extra. Pass if so. | FR-TDL-003 |
| AC-TDL-004 | Partition exercise with 6 sample values | Choose partitions for all values correctly; then change two | All correct: Correct with 6 of 6; with two changed: Not yet with 2 lines marked Not yet. Pass if so. | FR-TDL-004 |
| AC-TDL-005 | Generated corpus of 400 rules | Compare the evaluator's required sets with the independent Python oracle | No difference in any case. Pass if 400 of 400 equal. | FR-TDL-005 |
| AC-TDL-006 | Page loaded | Read the scope note | It states whole-number ranges only and that text, dates and field combinations are not assessed. Pass if present. | FR-TDL-006 |
| AC-TDL-007 | Any exercise | Read the explanation | It names the defect class; any code line is inside a code element and nothing is executed. Pass if the code search finds no eval or function construction. | FR-TDL-007 |
| AC-TDL-008 | Page loaded | Scan the text | No claim of certification, exam readiness or syllabus coverage. Pass if the banned-phrase test passes. | FR-TDL-008 |
| AC-LRN-001 | Every content module | Run the schema test; also load a module with a missing field in a page | The test passes for valid modules and fails for an invalid fixture; the page shows the plain message for the invalid one. Pass if both. | FR-LRN-001 |
| AC-LRN-002 | Every module | Run the id test; change an item's text without changing its id in a fixture | Duplicate ids fail; a changed item with an old id is detected through the version rule (version must change). Pass if so. | FR-LRN-002 |
| AC-LRN-003 | Every item | Run the provenance test | Every item has a source and a review record; a fixture without them fails. Pass if so. | FR-LRN-003 |
| AC-LRN-004 | Fixture content with <img onerror>, <script>, quotes and backslashes | Open pages showing it | The text appears as text; no element is created; no dialog. Pass if so. | FR-LRN-004 |
| AC-LRN-005 | Built pages | Measure raw and gzip sizes and the module requests on page load | Only the page's own modules and the first deck or set load; sizes are reported against the budgets. Pass if no other module loads; a budget miss is reported, not hidden. | FR-LRN-005 |
| AC-LRN-006 | Keyboard only | Tab through each page | Order follows reading order, focus is visible at every stop, focus moves only after explicit actions. Pass if so. | FR-LRN-006 |
| AC-LRN-007 | Screen-reader text log or live-region spy | Type in a response; press Check | No announcement while typing; one on Check. Pass if so. | FR-LRN-007 |
| AC-LRN-008 | Widths 320, 360, 390 px | Open each page with the longest content | No horizontal page scroll; controls at least 44 px; inputs at least 16 px. Pass if measured values meet these. | FR-LRN-008 |
| AC-LRN-009 | Reduced motion on | Use each page | No animation runs; the pages work. Pass if the computed transition and animation durations are 0. | FR-LRN-009 |
| AC-LRN-010 | Any state | Read the state text with colours ignored (grayscale emulation) | Each state is named in words. Pass if no state is distinguishable only by colour. | FR-LRN-010 |
| AC-LRN-011 | Module request blocked | Open each page | A plain message and a reload control appear; the rest of the page works; no raw error text. Pass if so. | FR-LRN-011 |
| AC-LRN-012 | Every page | Scan visible text and limits | Every input shows a numeric maximum; the word unlimited appears nowhere. Pass if so. | FR-LRN-012 |
| AC-LRN-013 | Built pages and content | Scan for the banned list and for streak, points, badge, ranking, notification | No match. Pass if no match. | FR-LRN-013 |
| AC-LRN-014 | Fresh profile, request log | Use each page fully, with saving off | Only the page's own files are requested; storage unchanged; no analytics event. Pass if so. | FR-LRN-014 |
| AC-INT-001 | Catalog | Run the catalog and capability tests | Five entries valid; capabilities only for built features. Pass if tests pass. | FR-INT-001 |
| AC-INT-002 | Both builds | Run inventory and link checks; open each page at the subpath and the root | No duplicates; all five load at both bases. Pass if so. | FR-INT-002 |
| AC-INT-003 | Existing tool test suites | Run the unit suites of the JSON formatter, JSONPath, cron and JSON Compare engines | All pass unchanged; the diff of those engine files is empty (or one reviewed export). Pass if so. | FR-INT-003 |
| AC-INT-004 | Built site | Run the link check; run a section-isolation test | All links resolve; no cross-section tool appears in a related list. Pass if so. | FR-INT-004 |
| AC-INT-005 | Search index | Query json, jsonpath, cron, flashcards, boundary value | The first three lead with their existing tools; the new tools lead the last two; budgets pass. Pass if so. | FR-INT-005 |
| AC-INT-006 | Built site | Diff the header, Home and other section pages | Only the Developer Tools listing and text changed. Pass if the diff is limited to those. | FR-INT-006 |
| AC-INT-007 | Built site | Read the sitemap; request a coming-soon URL | Sitemap contains the five new URLs and no unpublished one; the coming-soon URL returns the 404 page; canonicals use the production origin. Pass if so. | FR-INT-007 |
| AC-INT-008 | Identity ledger | Run the growth export check | The check passes with the five tool ids recorded. Pass if so. | FR-INT-008 |
| AC-INT-009 | Lab data and deck data | Run the topic-link test | Every topic id used by a lab exists in a deck. Pass if so. | FR-INT-009 |

## Cross-cutting acceptance criteria

| ID | Given | When | Then and Pass condition | Covers |
|---|---|---|---|---|
| AC-SEC-01 | New modules | Search for eval, new Function, setTimeout with a string, import of remote URLs | No match in the new code. Pass if no match. | FR-LRN-004, FR-LAB-005 |
| AC-SEC-02 | New modules | Search for innerHTML, insertAdjacentHTML and document.write fed by content or visitor text | None, or only with escaped fixed templates reviewed in the diff. Pass if none feed visitor text. | FR-LRN-004 |
| AC-SEC-03 | Browser run | Open all five pages and use them with a request log | No visitor code, no iframe, no worker, no remote script or stylesheet. Pass if none. | FR-LRN-014 |
| AC-SEC-04 | Malicious text in a response, a card fixture and a progress file | Submit script text, markup, quotes, backslashes, Unicode and NUL | Always shown as text, no dialog, no element created. Pass if so. | FR-LRN-004, FR-FC-023, FR-LAB-003 |
| AC-SEC-05 | Saved state | Set a stored value containing __proto__, constructor and very deep nesting | Validation rejects it; no prototype pollution (Object.prototype unchanged); no exception. Pass if so. | FR-FC-019 |
| AC-SEC-06 | Import | Import a file with 100 KB of nested arrays and one at exactly 100 KB | Over the limit is refused before parsing; the limit case parses and validates within 1 second. Pass if so. | FR-FC-023 |
| AC-SEC-07 | Labs | Maximum-length inputs for each lab; the engines' worst cases | Each check returns within 2 seconds on the reference laptop or reports its bound message. Pass if so. | FR-LAB-012, FR-JPC-005, FR-CRN-004 |
| AC-SEC-08 | Requests | Block all network after load | All five pages remain fully usable. Pass if so. | FR-LRN-014 |
| AC-A11Y-01 | Keyboard only | Complete one session or exercise on each page | Every function reachable, no keyboard trap. Pass if completed. | FR-FC-014, FR-LRN-006 |
| AC-A11Y-02 | Each page | Inspect labels, names and error associations | Every control has a visible label and an accessible name; errors are linked to their field. Pass if so. | FR-LAB-003, FR-LRN-007 |
| AC-A11Y-03 | Each page | Check the heading order and landmarks | One h1, ordered headings, one main region. Pass if so. | FR-LRN-006 |
| AC-A11Y-04 | Colour and contrast | Measure text, control and focus contrast | 4.5:1 for text and controls, 3:1 for outlines and focus. Pass if measured. | FR-LRN-010 |
| AC-A11Y-05 | Touch | Use at 320 px with touch emulation | No gesture is required; targets at least 44 px. Pass if so. | FR-LRN-008, FR-FC-014 |
| AC-A11Y-06 | Large text | Set the browser text size to 200 percent | No clipped or overlapping content; all functions reachable. Pass if so. | FR-LRN-008 |
| AC-A11Y-07 | Screen reader | Use NVDA or VoiceOver (real) on one deck and one lab | Result and state announcements are understandable. Pass only if a real screen reader was used; otherwise report Not run. | FR-LRN-007, FR-LRN-010 |
| AC-A11Y-08 | Reduced motion | Enable the preference | See AC-LRN-009. Pass as there. | FR-LRN-009 |
| AC-PERF-01 | Built page | Measure the module bytes of each page | Within the FR-LRN-005 budgets or the miss is reported. Pass if reported honestly. | FR-LRN-005 |
| AC-PERF-02 | A generated 500-card deck | Open it and run 100 grades | The DOM holds one card; session start under 300 ms of script time on the reference laptop; no growth in node count after 100 grades. Pass if so. | FR-FC-001, FR-LRN-005 |
| AC-PERF-03 | Long session | Run 1,000 grades and 200 Check actions with listeners counted | Listener count and heap do not grow with the number of actions. Pass if flat within noise. | FR-FC-006, FR-LAB-010 |
| AC-PERF-04 | Dependency list | Compare package files and vendored folders before and after | No new dependency. Pass if identical. | FR-INT-003 |
| AC-PERF-05 | Progress calculation | Calculate due cards for 2,000 saved cards | Under 50 ms. Pass if so. | FR-FC-017, FR-FC-018 |
| AC-PERF-06 | Rapid actions | Press Check or Next 50 times in 2 seconds | No duplicate results or announcements; final state correct. Pass if so. | FR-LAB-010, FR-FC-007 |
| AC-PERF-07 | Exercise transitions | Switch exercises 100 times | Each switch under 100 ms of script time; no leak. Pass if so. | FR-LAB-009 |

## Traceability: requirement to criteria

| Requirement | Priority | Acceptance criteria | Cross-cutting criteria |
|---|---|---|---|
| FR-FC-001 | P0 | AC-FC-001 | AC-PERF-02 |
| FR-FC-002 | P0 | AC-FC-002 | none |
| FR-FC-003 | P0 | AC-FC-003 | none |
| FR-FC-004 | P0 | AC-FC-004 | none |
| FR-FC-005 | P0 | AC-FC-005 | none |
| FR-FC-006 | P0 | AC-FC-006 | AC-PERF-03 |
| FR-FC-007 | P0 | AC-FC-007 | AC-PERF-06 |
| FR-FC-008 | P0 | AC-FC-008 | none |
| FR-FC-009 | P0 | AC-FC-009 | none |
| FR-FC-010 | P0 | AC-FC-010 | none |
| FR-FC-011 | P0 | AC-FC-011 | none |
| FR-FC-012 | P0 | AC-FC-012 | none |
| FR-FC-013 | P0 | AC-FC-013 | none |
| FR-FC-014 | P0 | AC-FC-014 | AC-A11Y-01, AC-A11Y-05 |
| FR-FC-015 | P0 | AC-FC-015 | none |
| FR-FC-016 | P0 | AC-FC-016 | none |
| FR-FC-017 | P0 | AC-FC-017 | AC-PERF-05 |
| FR-FC-018 | P0 | AC-FC-018 | AC-PERF-05 |
| FR-FC-019 | P0 | AC-FC-019 | AC-SEC-05 |
| FR-FC-020 | P0 | AC-FC-020 | none |
| FR-FC-021 | P0 | AC-FC-021 | none |
| FR-FC-022 | P0 | AC-FC-022 | none |
| FR-FC-023 | P0 | AC-FC-023 | AC-SEC-04, AC-SEC-06 |
| FR-FC-024 | P0 | AC-FC-024 | none |
| FR-FC-025 | P0 | AC-FC-025 | none |
| FR-FC-026 | P0 | AC-FC-026 | none |
| FR-LAB-001 | P0 | AC-LAB-001 | none |
| FR-LAB-002 | P0 | AC-LAB-002 | none |
| FR-LAB-003 | P0 | AC-LAB-003 | AC-SEC-04, AC-A11Y-02 |
| FR-LAB-004 | P0 | AC-LAB-004 | none |
| FR-LAB-005 | P0 | AC-LAB-005 | AC-SEC-01 |
| FR-LAB-006 | P0 | AC-LAB-006 | none |
| FR-LAB-007 | P0 | AC-LAB-007 | none |
| FR-LAB-008 | P0 | AC-LAB-008 | none |
| FR-LAB-009 | P0 | AC-LAB-009 | AC-PERF-07 |
| FR-LAB-010 | P0 | AC-LAB-010 | AC-PERF-03, AC-PERF-06 |
| FR-LAB-011 | P0 | AC-LAB-011 | none |
| FR-LAB-012 | P0 | AC-LAB-012 | AC-SEC-07 |
| FR-LAB-013 | P0 | AC-LAB-013 | none |
| FR-LAB-014 | P0 | AC-LAB-014 | none |
| FR-JEF-001 | P0 | AC-JEF-001 | none |
| FR-JEF-002 | P0 | AC-JEF-002, AC-JEF-008 | none |
| FR-JEF-003 | P0 | AC-JEF-003 | none |
| FR-JEF-004 | P0 | AC-JEF-004 | none |
| FR-JEF-005 | P0 | AC-JEF-005 | none |
| FR-JEF-006 | P0 | AC-JEF-006 | none |
| FR-JPC-001 | P0 | AC-JPC-001 | none |
| FR-JPC-002 | P0 | AC-JPC-002, AC-JPC-006 | none |
| FR-JPC-003 | P0 | AC-JPC-003 | none |
| FR-JPC-004 | P0 | AC-JPC-004 | none |
| FR-JPC-005 | P0 | AC-JPC-005 | AC-SEC-07 |
| FR-JPC-006 | P0 | AC-JPC-007 | none |
| FR-CRN-001 | P0 | AC-CRN-001 | none |
| FR-CRN-002 | P0 | AC-CRN-002 | none |
| FR-CRN-003 | P0 | AC-CRN-003 | none |
| FR-CRN-004 | P0 | AC-CRN-004 | AC-SEC-07 |
| FR-CRN-005 | P0 | AC-CRN-005 | none |
| FR-CRN-006 | P0 | AC-CRN-006 | none |
| FR-TDL-001 | P0 | AC-TDL-001 | none |
| FR-TDL-002 | P0 | AC-TDL-002 | none |
| FR-TDL-003 | P0 | AC-TDL-003 | none |
| FR-TDL-004 | P0 | AC-TDL-004 | none |
| FR-TDL-005 | P0 | AC-TDL-005 | none |
| FR-TDL-006 | P0 | AC-TDL-006 | none |
| FR-TDL-007 | P0 | AC-TDL-007 | none |
| FR-TDL-008 | P0 | AC-TDL-008 | none |
| FR-LRN-001 | P0 | AC-LRN-001 | none |
| FR-LRN-002 | P0 | AC-LRN-002 | none |
| FR-LRN-003 | P0 | AC-LRN-003 | none |
| FR-LRN-004 | P0 | AC-LRN-004 | AC-SEC-01, AC-SEC-02, AC-SEC-04 |
| FR-LRN-005 | P0 | AC-LRN-005 | AC-PERF-01, AC-PERF-02 |
| FR-LRN-006 | P0 | AC-LRN-006 | AC-A11Y-01, AC-A11Y-03 |
| FR-LRN-007 | P0 | AC-LRN-007 | AC-A11Y-02, AC-A11Y-07 |
| FR-LRN-008 | P0 | AC-LRN-008 | AC-A11Y-05, AC-A11Y-06 |
| FR-LRN-009 | P0 | AC-LRN-009 | AC-A11Y-08 |
| FR-LRN-010 | P0 | AC-LRN-010 | AC-A11Y-04, AC-A11Y-07 |
| FR-LRN-011 | P0 | AC-LRN-011 | none |
| FR-LRN-012 | P0 | AC-LRN-012 | none |
| FR-LRN-013 | P0 | AC-LRN-013 | none |
| FR-LRN-014 | P0 | AC-LRN-014 | AC-SEC-03, AC-SEC-08 |
| FR-INT-001 | P0 | AC-INT-001 | none |
| FR-INT-002 | P0 | AC-INT-002 | none |
| FR-INT-003 | P0 | AC-INT-003 | AC-PERF-04 |
| FR-INT-004 | P0 | AC-INT-004 | none |
| FR-INT-005 | P0 | AC-INT-005 | none |
| FR-INT-006 | P0 | AC-INT-006 | none |
| FR-INT-007 | P0 | AC-INT-007 | none |
| FR-INT-008 | P0 | AC-INT-008 | none |
| FR-INT-009 | P0 | AC-INT-009 | none |

## Traceability: candidate to requirements

| P0 candidate | Delivered by |
|---|---|
| 1, 2 JSON error fixing | FR-JEF-001 to 006, FR-LAB |
| 3 JSONPath lab | FR-JPC-001 to 006, FR-LAB |
| 23, 24 BVA and equivalence partitioning | FR-TDL-001 to 008, FR-LAB |
| 32 Cron lab | FR-CRN-001 to 006, FR-LAB |
| 35, 36, 40 flashcard engine, deck selection, mistake review | FR-FC-001 to 013 |
| 44 to 47 modes and content packs | FR-FC-004, FR-FC-024, FR-LRN-001 to 003 |
| 49, 51, 53 features | FR-FC-015 to 023, FR-LAB-007, FR-LRN |
