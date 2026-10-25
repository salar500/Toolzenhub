# 17. Open-source reference register

Only references already **verified in a repository document** are listed. No new GitHub research was done in this phase, so there are no new entries; candidate tools in 02 name no libraries. Before any build, a feasibility audit must verify licence, version, maintenance, size, security record and browser support from the primary source (rulebook 12).

| Component | Role | Licence | Version / state | Source of the claim | Use | Limitations / notes |
|---|---|---|---|---|---|---|
| pdf-lib | Photos to PDF, Merge, Split, Extract/Reorder/Rotate | MIT | 1.17.1, vendored unmodified, SHA-256 in the notice | `assets/js/vendor/pdf-lib/NOTICE.txt`, spec 33 section 8 | Shipped | No release since 2022-05-12 (spec 33). Protected files refused; bookmarks lost on copy; forms and signatures untested. **The notice's "Used by: photos-to-pdf only" is stale**: the three PDF tools also use it (D8 in 14) |
| pypdf | Independent oracle for PDF output | BSD-3-Clause | 6.21.2 in a throwaway environment | spec 33 section 8 | Development only; not in the repository | Optional second reader; skipped when absent |
| PDF.js | Would render pages for thumbnails or PDF to Images | Apache-2.0 | not vendored | spec 33 section 8 | **Not used** | Large bundle and memory cost; any future use needs its own decision |
| Nayuki QR-Code-generator | Candidate encoder for the deferred QR tool | MIT (licence header; API field empty) | last push 2026-08-31 | spec 32 section 7, "VERIFIED" there | **Not used** (tool deferred) | Port, with attribution, only if the tool is approved |
| jsQR | Dev-only decoder oracle for the QR tool | Apache-2.0 | v1.4.0 | spec 32 section 7 | **Not used** | Apache-2.0 obligations apply only if redistributed |

Rules for additions: record URL, licence, version or commit, attribution requirement, dependency size, known limitations and the independent test that checks the output. Do not copy code from an unlicensed repository. A library is a dependency to maintain, not a shortcut: reuse the vendored pdf-lib before adding another PDF library.
