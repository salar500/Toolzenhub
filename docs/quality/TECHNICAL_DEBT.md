# Technical debt

Carried from `docs/release-readiness-checkpoint.md` (2026-10-29) and the QC records. "Not re-verified" means the item was recorded earlier and was not checked again at `f5a1df4`.

| ID | Item | Sev | Status |
|---|---|---|---|
| T-1 | Four asset or code files are unreachable from any live page (legacy) | P3 | Confirmed by the asset check at f5a1df4; informational |
| T-2 | Vendored jsPDF contains a cdnjs URL string for an output mode the site never calls | P3 | Not re-verified; no first-party use found earlier |
| T-3 | Google Fonts and Unsplash are external requests | P1 for production privacy wording | Not re-verified; decide to self-host or disclose |
| T-4 | Loan Comparison slider target size was 18 px | P2 | Not re-verified; shared sliders were reworked in later commits (`45fc888`), so measure again before acting |
| T-5 | Five tools had no related-tools list (`ppf`, `profit`, `margin`, `date-difference`, `image-compressor-resizer`) | P2 | Not re-verified; later curated lists may have fixed some |
| T-15 | The SQL, Excel and Power BI labs and their three flashcard decks have had no second reviewer, and the Excel and Power BI engines were never compared with Microsoft Excel or Power BI Desktop (expected values come from separate Python scripts and hand-worked values) | P1 before claiming independent validation | Open; each set keeps "No second reviewer yet" in its review record and on its page |
| T-6 | Topic-level flashcard deck links not built | P3 | Open |
| T-7 | No performance measurement of the newer pages (Lighthouse is informational and was last baselined earlier) | P2 | Open; no performance claim is made |
| T-8 | No screen-reader, Firefox, WebKit or real-device testing | P1 | Open; automated axe is clean on 126 pages at 390, 820 and 1280 px, which is not a WCAG compliance claim |
| T-9 | Four unit tests skip on this machine (3 symlink, 1 pypdf cross-check) | P3 | Environmental |
| T-10 | Related-cards limit of six hides Prepayment and Credit Card Payoff on some pages | P3 | Owner decision (see `DEFECT_LEDGER.md` O-3) |
| T-11 | Process: the memory-limited machine cannot run a full browser regression unattended; the checkpoint was done in groups and one orphaned wrapper process once outlived its stop | P2 | Mitigated by foreground, grouped runs; rule 10.14 |
| T-12 | Gratuity ceiling and legal-source verification; PPF official-source reading; second reviewer for the 163 learning items | P1 before production | Not re-verified |
| T-13 | No persistent category sidebar or tool workspace exists; rulebook 4.8 asks for related-tool navigation in small steps first. Labs is now its own section (4.10, Phase C) | P2 | Done (Phase 1, rule 4.8 amended): "More <section>" navigation on every tool page, a held-open left rail from 1400 px, the closed disclosure below. A separate slide-in drawer was not built: the disclosure is the phone pattern |
| T-14 | The labs no longer list the utilities (JSON Formatter, JSONPath Tester, Cron Explainer) as related tools, because related lists stay in one section (rule 4.2); the link now has to live in each lab's text | P3 | Open |
| T-16 | SEO (static audit of both builds, 2026-11-05): 28 page titles are over 70 characters and 64 meta descriptions over 170, mostly long article titles, so search results may shorten them; the home and articles index pages build their H1 in JavaScript (no static H1); six calculators (CAGR, FD, GST, Percentage and two more) go from H1 to H3 in their "more" block; the EMI and Personal Loan calculators both claim the alias "personal loan emi" | P3 | Open. Shortening titles changes pinned article identities and baselines, so it is a content decision for the owner. The two legal descriptions that were too short were fixed |
