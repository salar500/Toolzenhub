# 13 Security and privacy requirements

**PROPOSED — NOT APPROVED FOR IMPLEMENTATION**

**Owner decision recorded 2026-10-28:** the Option B scope baseline in doc 18 was approved with conditions. Only what doc 18 records as approved is approved; everything else in this document remains a proposal for Master Prompt 2 to develop. No implementation has started.

Practice Labs & Smart Flashcards ecosystem, Prompt 1 of 3 (research and requirements). Written 2026-10-28. Nothing here is a rule, a build queue or an approval; the rulebook is `docs/product-decision-rules.md`.

Evidence labels used throughout: **OBSERVED** (seen on a public page or in the repository this session), **CLAIMED** (stated by the source about itself, not verified), **INFERRED** (reasoned from observations), **UNKNOWN** (not established). **VERIFIED/HYPOTHESIS** follow rulebook 12.

## Starting facts

- ToolZenHub is static and browser-local; there is no backend, no paid API and no run-time AI (rulebook 1.5, 8.8).
- **No Content-Security-Policy is configured in the repository**, so nothing below relies on a CSP that is not there. Whether production sends any security headers was not inspected.
- User text is data, never markup (rule 8.7). Input is never sent anywhere (rule 8.8).

## Feasibility of security-sensitive candidates

| Candidate type | Safe approach researched | Evidence | Remaining risk | Verdict for this ecosystem |
|---|---|---|---|---|
| **SQL execution** (items 14, 15, 16) | SQLite compiled to WebAssembly (sql.js) running in a Web Worker, terminated on timeout, with SELECT-only statements, fixed datasets and row and size caps | OBSERVED: sql.js is MIT licensed, runs SQLite via Emscripten, can run in a Worker; its database lives in memory and is not persisted; the page states no size limit for the files or for memory. OBSERVED: a Worker cannot touch the DOM and `terminate()` kills it immediately; the page says nothing about CPU limits or infinite loops | New dependency of unstated size; the page cannot cap the engine's memory; the 4 GB laptop and low-end phones; content volume | **DEFER to P1 behind a separately approved feasibility spike and dependency decision (H)**. A restricted parser would reimplement SQL semantics (NULL, joins) and is rejected as a correctness risk |
| **JavaScript execution** (item 19) | Worker or iframe sandbox | OBSERVED: MDN says using `allow-scripts` with `allow-same-origin` on a same-origin frame lets the document remove its own sandbox; sandboxing is useless if the frame can be opened outside; same-origin parents can reach a frame's DOM | Infinite loops cannot be bounded inside a frame; a Worker can be killed, but a sandbox escape through an unexpected API is not ruled out; no CSP | **REJECT.** Code-output prediction is delivered as static choice cards with the output worked out in advance |
| **HTML rendering** (item 17) | `sandbox` iframe with `srcdoc`, no scripts | OBSERVED: MDN example uses a bare `sandbox` to render user content | Markup can still request remote files (INFERRED); no CSP to limit it; checking results needs DOM access | **DEFER**: no rendering of visitor HTML in this scope |
| **CSS rendering** (items 18, 20) | Same, plus reading computed styles | OBSERVED: a same-origin parent can read the frame's DOM even without scripts (MDN) | CSS can reference remote URLs (INFERRED), leaking the visit to a third party | **DEFER** |
| **HTTP simulation** (items 8 to 13) | Static scenario content, no request made | n/a | none: nothing is sent; real requests to visitor-chosen hosts would send data off the device, which rulebook 8.8 forbids | **Feasible as static scenarios (cards)**; live requests rejected |
| **Terminal and repository simulation** (items 30, 31) | A bounded command parser over an in-memory model | n/a | large to build faithfully; a shallow model teaches wrong habits and may imply commands are safe to run elsewhere | **DEFER** |
| **User-authored text** (all labs) | Treat as data: place with `textContent`, parse only with the existing strict engines, cap length | OBSERVED: the existing engines bound input and work (JSONPath: 1,000-character query, 4,000,000 steps, 100,000 nodes; cron: 256 characters; JSON: depth 500) | An engine regression; very large pastes | **Feasible with the caps in FR-LAB-012 and the tests AC-SEC-07** |

If a feature cannot be made acceptably safe in this architecture the recommendation is a bounded simulation, a guided exercise, deferral or rejection, as stated above; no approach that bypasses a restriction is proposed.

## Threat controls for the recommended scope

| Threat | Control | Test |
|---|---|---|
| Script or markup in content or responses | textContent only; content is data | AC-SEC-04, AC-LRN-004 |
| Injection through an imported progress file | strict JSON parse, schema validation, size limit before parsing, nothing executed | AC-SEC-05, AC-SEC-06, AC-FC-023 |
| Prototype pollution through stored data | reject keys such as `__proto__` and `constructor`; plain-object schema | AC-SEC-05 |
| Oversized input and slow evaluation | stated caps; engine work bounds | AC-SEC-07, AC-LAB-012 |
| Corrupt or hand-edited storage | validate on read; drop and notify | AC-FC-019 |
| Network exfiltration | no network call by the new code; no iframe or worker | AC-SEC-03, AC-SEC-08 |
| Unsafe execution requests | none exist: no `eval`, no `Function`, no visitor code | AC-SEC-01 |
| Clipboard or download misuse | explicit actions only; downloads built locally from validated state | AC-FC-022 |

## Progress storage: options and the one decision needed

| | A: none | B: opt-in localStorage | C: IndexedDB | D: downloaded file | E: URL state |
|---|---|---|---|---|---|
| Privacy | best | good if opt-in, one key, disclosed | good | best (learner holds the file) | poor: data in the address (against 8.8) |
| Convenience | poor: schedule is meaningless | best | best | middling: manual | poor |
| Cross-device | none | none | none | works by moving the file | by sharing a link (a privacy problem) |
| Data loss | total at reload | clearing site data | same | none if the file is kept | none |
| Quota | n/a | about 5 MB typical; 100 KB cap used | large | n/a | very small |
| Complexity | none | low | higher (asynchronous, versioned) | low-moderate | low |
| Security | none | validate on read | validate on read | validate on import | high risk |
| Accessibility | n/a | switch plus explanation | same | file chooser and download | n/a |
| User control | n/a | reset, export | reset | full | poor |
| Rule 7.7 exception needed? | no | **yes** | **yes** | no | would conflict with 8.8 |

**Recommendation (decision F, one decision):** B plus D. Saving is **opt-in per tool, off by default**, uses one namespaced key, states exactly what it stores, can be reset, and can be exported and imported; labs save nothing. The documented reason required by rule 7.7: a spaced-repetition schedule has no meaning without memory across days, and an export file would make it manual. **Alternative:** D only (no browser storage and so no exception), accepting that the learner loads a file each visit. Either way no account, no cloud database and no synchronisation service is assumed.

What changes if approved (to be done in Prompt 2, not now): a lasting exception recorded in rulebook 7.7 for the learning tools; the privacy page states the learning key; each tool states what it stores. **This phase does not modify the rulebook, the storage rules or the privacy page.**

## Privacy requirements summary

No visitor text leaves the browser; no analytics event is sent by the new code (the existing consent-based analytics is unchanged and, per rule 8.8, sends only the page address); no third-party images or fonts are used on the new pages (the Stage 3 calculator work found third-party article thumbnails on shared pages; these new pages add none); the only storage is the opt-in key. Wording on each page must be factual and narrow ("Your answers are checked in your browser").
