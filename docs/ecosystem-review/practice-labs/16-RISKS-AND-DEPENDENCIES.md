# 16 Risks and dependencies

**PROPOSED — NOT APPROVED FOR IMPLEMENTATION**

**Owner decision recorded 2026-10-28:** the Option B scope baseline in doc 18 was approved with conditions. Only what doc 18 records as approved is approved; everything else in this document remains a proposal for Master Prompt 2 to develop. No implementation has started.

Practice Labs & Smart Flashcards ecosystem, Prompt 1 of 3 (research and requirements). Written 2026-10-28. Nothing here is a rule, a build queue or an approval; the rulebook is `docs/product-decision-rules.md`.

Evidence labels used throughout: **OBSERVED** (seen on a public page or in the repository this session), **CLAIMED** (stated by the source about itself, not verified), **INFERRED** (reasoned from observations), **UNKNOWN** (not established). **VERIFIED/HYPOTHESIS** follow rulebook 12.

## Summary

25 risks. Those that need an owner decision: RISK 02 (only if SQL is ever pursued) and RISK 09 (progress storage, decision F). RISK 14 (unverified demand), RISK 11 (browser compatibility) and RISK 13 (accessibility until a real screen reader is used) stay open until measured or tested. No risk is accepted as closed in this phase because nothing is built.

| ID | Risk | Likelihood | Impact | Owner approval |
|---|---|---|---|---|
| RISK 01 | Unsafe JavaScript execution | High if built | High | No |
| RISK 02 | SQL execution isolation | Medium | High | Yes, if SQL is ever pursued |
| RISK 03 | HTML and CSS sandbox escapes | Medium | High | No |
| RISK 04 | Incorrect educational answers | Medium | High | No |
| RISK 05 | Ambiguous scoring | Medium | Medium | No |
| RISK 06 | Copyright and licensing | Medium | Medium | No |
| RISK 07 | Unsupported learning-effectiveness claims | Medium | Medium | No |
| RISK 08 | Spaced-repetition complexity | Low if simple | Medium | No |
| RISK 09 | Progress-storage rule conflict | Certain if saved without a decision | High | Yes |
| RISK 10 | Data loss or corrupted progress | Medium | Medium | No |
| RISK 11 | Browser compatibility | Medium | Medium | No |
| RISK 12 | Mobile performance | Low | Medium | No |
| RISK 13 | Accessibility barriers | Medium | High | No |
| RISK 14 | Unverified search demand | High | Medium | No |
| RISK 15 | Excessive content-maintenance burden | Medium | Medium | No |
| RISK 16 | Duplication of existing tools | Medium | Medium | No |
| RISK 17 | Thin or repetitive SEO pages | Medium | Medium | No |
| RISK 18 | Large JavaScript dependencies | Low | Medium | No |
| RISK 19 | Excessive memory usage | Low | Medium | No |
| RISK 20 | User-input injection | Medium | High | No |
| RISK 21 | Unbounded evaluation | Medium | Medium | No |
| RISK 22 | Misleading progress or mastery indicators | Medium | Medium | No |
| RISK 23 | Broken lab-to-tool integration | Medium | Medium | No |
| RISK 24 | Content becoming outdated | Medium | Low | No |
| RISK 25 | Inconsistent difficulty classification | Medium | Low | No |

## Register

### RISK 01 — Unsafe JavaScript execution

- **Description:** A lab that runs visitor JavaScript could be abused or hang the tab.
- **Likelihood:** High if built; **Impact:** High
- **Evidence:** OBSERVED: MDN says allow-scripts with allow-same-origin on a same-origin frame removes the sandbox protection; no CSP is present in the repository.
- **Mitigation:** No visitor code is executed anywhere in the recommended scope (JavaScript execution lab is REJECT).
- **Verification method:** Code search for eval, new Function and script injection in the new modules; security test cases AC-SEC-01 to AC-SEC-03.
- **Residual risk:** None in scope
- **Dependency:** None
- **Owner approval needed:** No

### RISK 02 — SQL execution isolation

- **Description:** A SQL lab would run a database engine on visitor-written statements.
- **Likelihood:** Medium; **Impact:** High
- **Evidence:** OBSERVED: sql.js is SQLite compiled to WebAssembly, MIT licensed, can run in a Web Worker; its database lives in memory and cannot be size-limited by the page (the page states no memory limit). MDN: a Worker can be killed with terminate().
- **Mitigation:** SQL is out of the recommended scope (P1). If approved later: Worker, terminate on timeout, SELECT-only statements, fixed datasets, size and row caps, a feasibility spike first.
- **Verification method:** Spike report before any approval; not applicable to the recommended scope.
- **Residual risk:** Deferred
- **Dependency:** New dependency approval (decision H)
- **Owner approval needed:** Yes, if SQL is ever pursued

### RISK 03 — HTML and CSS sandbox escapes

- **Description:** Rendering visitor HTML or CSS could leak data or load remote content.
- **Likelihood:** Medium; **Impact:** High
- **Evidence:** OBSERVED: MDN sandbox notes (same-origin warning, popups inherit restrictions). INFERRED: CSS can request remote files.
- **Mitigation:** No visitor HTML or CSS is rendered in the recommended scope (#17, #18, #20 DEFER).
- **Verification method:** AC-SEC-02; code search for innerHTML with visitor text.
- **Residual risk:** None in scope
- **Dependency:** None
- **Owner approval needed:** No

### RISK 04 — Incorrect educational answers

- **Description:** A wrong answer or explanation teaches the wrong thing and damages trust.
- **Likelihood:** Medium; **Impact:** High
- **Evidence:** HYPOTHESIS. The existing tools were verified against RFCs and independent oracles; content has no equivalent automatic check.
- **Mitigation:** Each item cites a primary source; deterministic evaluators are checked against an independent oracle; a second reviewer checks every item; an error-report path exists (existing report-issue component).
- **Verification method:** Content review log; AC-LRN-003; unit tests with an independent oracle for evaluators.
- **Residual risk:** Low to medium: review is human
- **Dependency:** Reviewer availability
- **Owner approval needed:** No

### RISK 05 — Ambiguous scoring

- **Description:** An answer that is right but rejected, or wrong but accepted.
- **Likelihood:** Medium; **Impact:** Medium
- **Evidence:** INFERRED from the tool design: free-form answers are ambiguous.
- **Mitigation:** Only answers that a pure function can check are assessed; every accepted form is covered by tests; open-ended exercises are excluded.
- **Verification method:** AC-LAB-006, AC-JEF-002, AC-JPC-006, AC-CRN-002, AC-TDL-003.
- **Residual risk:** Low
- **Dependency:** None
- **Owner approval needed:** No

### RISK 06 — Copyright and licensing

- **Description:** Copying competitor questions, W3C or ISTQB text, or RFC text verbatim.
- **Likelihood:** Medium; **Impact:** Medium
- **Evidence:** OBSERVED: ISTQB page states no licence terms for the syllabus; MDN content is Creative Commons (version not stated on the page); HTTP Cats credits an artist and states no licence.
- **Mitigation:** All content is original; sources are cited by reference, not copied; no third-party images are used.
- **Verification method:** Content review checks originality; link and asset checks.
- **Residual risk:** Low
- **Dependency:** Reviewer
- **Owner approval needed:** No

### RISK 07 — Unsupported learning-effectiveness claims

- **Description:** Wording that promises retention, mastery or exam success.
- **Likelihood:** Medium; **Impact:** Medium
- **Evidence:** OBSERVED: Brainscape's page calls its algorithm proven without evidence on the page. Rulebook 3.1 and 3.3 forbid unsupported claims.
- **Mitigation:** Fixed wording rules (FR-LRN-013) and a banned-word test.
- **Verification method:** AC-LRN-013 string scan of built pages.
- **Residual risk:** Low
- **Dependency:** None
- **Owner approval needed:** No

### RISK 08 — Spaced-repetition complexity

- **Description:** An advanced scheduler adds cost without a verified benefit here.
- **Likelihood:** Low if simple; **Impact:** Medium
- **Evidence:** OBSERVED: Anki documents say FSRS needs several reviews to tune and performs poorly with under a few hundred reviews.
- **Mitigation:** A fixed-interval box scheduler with a pure function; FSRS deferred.
- **Verification method:** Unit tests with injected dates (AC-FC-016, AC-FC-018).
- **Residual risk:** Low
- **Dependency:** None
- **Owner approval needed:** No

### RISK 09 — Progress-storage rule conflict

- **Description:** Rule 7.7 forbids persistence by default and the public pages promise nothing is stored.
- **Likelihood:** Certain if saved without a decision; **Impact:** High
- **Evidence:** OBSERVED in the rulebook (7.7, 8.8) and the privacy page.
- **Mitigation:** Saving is opt-in per tool, default off, one namespaced key, clearly disclosed; the owner decision F covers it; the alternative is export/import only, which needs no exception.
- **Verification method:** AC-FC-015, AC-LRN-014; privacy-page text check.
- **Residual risk:** Low once decided
- **Dependency:** Owner decision F
- **Owner approval needed:** Yes

### RISK 10 — Data loss or corrupted progress

- **Description:** A broken saved value could crash a page or silently wipe progress.
- **Likelihood:** Medium; **Impact:** Medium
- **Evidence:** INFERRED: any browser storage can be edited, cleared or corrupted.
- **Mitigation:** Strict schema validation on load; unreadable parts dropped with a notice; export as a backup; reset path.
- **Verification method:** AC-FC-019, AC-FC-020, AC-FC-023.
- **Residual risk:** Low
- **Dependency:** None
- **Owner approval needed:** No

### RISK 11 — Browser compatibility

- **Description:** Features may behave differently in Safari or Firefox.
- **Likelihood:** Medium; **Impact:** Medium
- **Evidence:** UNKNOWN: only system Chrome is available on the development laptop (Stage 3 finding).
- **Mitigation:** Plain DOM and standard APIs only; no experimental features; Firefox and WebKit checked at the consolidated checkpoint.
- **Verification method:** Checkpoint tests; honest report if not run.
- **Residual risk:** Medium until checked
- **Dependency:** Test browsers
- **Owner approval needed:** No

### RISK 12 — Mobile performance

- **Description:** Large content or scripts slow ordinary phones.
- **Likelihood:** Low; **Impact:** Medium
- **Evidence:** MEASURED: JSONPath Tester page module is 28 KB raw and 7 KB gzip, its engine 39 KB raw and 9 KB gzip.
- **Mitigation:** Lazy load per deck and per exercise set; budgets in FR-LRN-005; one card or exercise in the DOM at a time.
- **Verification method:** AC-PERF-01 to AC-PERF-03.
- **Residual risk:** Low
- **Dependency:** None
- **Owner approval needed:** No

### RISK 13 — Accessibility barriers

- **Description:** Cards or exercises that a keyboard or screen-reader user cannot complete.
- **Likelihood:** Medium; **Impact:** High
- **Evidence:** Common failure for flip cards and drag interfaces (INFERRED).
- **Mitigation:** No flip animation, no drag, no gesture-only control, no single-key shortcuts; real controls and labels.
- **Verification method:** AC-A11Y-01 to AC-A11Y-08; manual screen-reader pass at the checkpoint (not claimed until done).
- **Residual risk:** Medium until a real screen reader is used
- **Dependency:** Tester with a screen reader
- **Owner approval needed:** No

### RISK 14 — Unverified search demand

- **Description:** The audience may be small.
- **Likelihood:** High; **Impact:** Medium
- **Evidence:** UNKNOWN: Google Trends returned HTTP 429; no keyword volumes were obtained.
- **Mitigation:** Scores use conservative hypotheses; scope kept small; deck pages deferred until Search Console shows demand.
- **Verification method:** Search Console after launch (owner data).
- **Residual risk:** High until measured
- **Dependency:** Owner access to Search Console
- **Owner approval needed:** No

### RISK 15 — Excessive content-maintenance burden

- **Description:** Hundreds of items to keep accurate.
- **Likelihood:** Medium; **Impact:** Medium
- **Evidence:** INFERRED: about 108 cards and about 60 exercises in the recommended scope.
- **Mitigation:** Small first set; stable ids and versions; every item has a source; no volatile facts.
- **Verification method:** Content validation test (FR-LRN-001 to FR-LRN-003).
- **Residual risk:** Medium
- **Dependency:** Reviewer time
- **Owner approval needed:** No

### RISK 16 — Duplication of existing tools

- **Description:** A lab that only repeats a tool page.
- **Likelihood:** Medium; **Impact:** Medium
- **Evidence:** OBSERVED: the existing tools already format, query and explain.
- **Mitigation:** Every P0 lab teaches a skill and checks it, reusing the engine rather than re-implementing it.
- **Verification method:** Section 5 of doc 02; AC-INT-003.
- **Residual risk:** Low
- **Dependency:** None
- **Owner approval needed:** No

### RISK 17 — Thin or repetitive SEO pages

- **Description:** Many near-identical pages.
- **Likelihood:** Medium; **Impact:** Medium
- **Evidence:** Rulebook 6.2 and 6.5.
- **Mitigation:** Five pages, one per intent; no per-deck pages until demand is shown; unique intro text per page.
- **Verification method:** SEO check; manual review.
- **Residual risk:** Low
- **Dependency:** None
- **Owner approval needed:** No

### RISK 18 — Large JavaScript dependencies

- **Description:** A heavy library for little value.
- **Likelihood:** Low; **Impact:** Medium
- **Evidence:** OBSERVED: no vendored learning libraries; sql.js size not stated on its page.
- **Mitigation:** No new dependency in the recommended scope.
- **Verification method:** AC-PERF-04: dependency list unchanged.
- **Residual risk:** None
- **Dependency:** None
- **Owner approval needed:** No

### RISK 19 — Excessive memory usage

- **Description:** A 4 GB laptop and low-end phones.
- **Likelihood:** Low; **Impact:** Medium
- **Evidence:** Stage 3 evidence: a browser regression was killed for low memory.
- **Mitigation:** Pure modules; one card in the DOM; bounded inputs; no caching of full decks beyond the active one.
- **Verification method:** AC-PERF-02, AC-PERF-03.
- **Residual risk:** Low
- **Dependency:** None
- **Owner approval needed:** No

### RISK 20 — User-input injection

- **Description:** Visitor text or imported files reaching the page as markup.
- **Likelihood:** Medium; **Impact:** High
- **Evidence:** Rulebook 8.7.
- **Mitigation:** Content and visitor text are placed with textContent; imported data is validated and never executed.
- **Verification method:** AC-SEC-04 to AC-SEC-06.
- **Residual risk:** Low
- **Dependency:** None
- **Owner approval needed:** No

### RISK 21 — Unbounded evaluation

- **Description:** A very large input or pathological query stalls the tab.
- **Likelihood:** Medium; **Impact:** Medium
- **Evidence:** OBSERVED: the JSONPath engine already bounds work (4,000,000 steps) and input sizes; the cron engine bounds input to 256 characters.
- **Mitigation:** Keep those bounds, add per-lab input caps.
- **Verification method:** AC-SEC-07, AC-LAB-014.
- **Residual risk:** Low
- **Dependency:** None
- **Owner approval needed:** No

### RISK 22 — Misleading progress or mastery indicators

- **Description:** Counts mistaken for skill.
- **Likelihood:** Medium; **Impact:** Medium
- **Evidence:** INFERRED.
- **Mitigation:** Neutral counts only; no percentages labelled mastery; no streaks or points (rule 7.7).
- **Verification method:** AC-LRN-013, AC-FC-011.
- **Residual risk:** Low
- **Dependency:** None
- **Owner approval needed:** No

### RISK 23 — Broken lab-to-tool integration

- **Description:** An engine change breaks a lab, or a link goes dead.
- **Likelihood:** Medium; **Impact:** Medium
- **Evidence:** INFERRED: labs import the same engines as the tools.
- **Mitigation:** Labs import engines unchanged; the existing engine test suites run; lab tests include a fixed set of engine outputs; link check.
- **Verification method:** AC-INT-003, AC-INT-004.
- **Residual risk:** Low
- **Dependency:** Engine owners
- **Owner approval needed:** No

### RISK 24 — Content becoming outdated

- **Description:** Standards and tools change.
- **Likelihood:** Medium; **Impact:** Low
- **Evidence:** INFERRED.
- **Mitigation:** Cards state the standard and version they rest on; volatile facts are excluded; a content review date per deck.
- **Verification method:** AC-LRN-003.
- **Residual risk:** Medium over time
- **Dependency:** Reviewer
- **Owner approval needed:** No

### RISK 25 — Inconsistent difficulty classification

- **Description:** Beginner and advanced labels that do not mean the same thing across labs.
- **Likelihood:** Medium; **Impact:** Low
- **Evidence:** INFERRED.
- **Mitigation:** One written rubric in terms of concepts combined and faults present, applied by the evaluator of each lab.
- **Verification method:** AC-LAB-001 and the content review.
- **Residual risk:** Low
- **Dependency:** None
- **Owner approval needed:** No
