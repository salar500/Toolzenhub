# 11. Risks and dependencies

PROJECT: ToolZenHub
ECOSYSTEM: Image & PDF Tools
STATUS: PROPOSED — NOT APPROVED FOR IMPLEMENTATION
PHASE: Research and requirements, 2026-10-27

Research and planning only. No application code, test, baseline, rulebook, roadmap or Tool Pack was changed. Evidence labels follow rulebook 12.4: **VERIFIED** (read or observed in this session), **PUBLIC** (a cited external page, not independently verified), **HYPOTHESIS**, **UNKNOWN**.

## 1. Risk register

Severity is the harm if it happens. Likelihood is labelled where it is unknown.

| Risk ID | Description | Affected | Severity | Likelihood or uncertainty | Detection | Mitigation | Fallback | Release implication |
|---|---|---|---|---|---|---|---|---|
| R-IP-001 | Browser memory exhaustion or tab kill during a batch or a cropped large image | IP-1 IP-2 | High | Likely on low-memory phones (UNKNOWN) | Instrumented counters; measure on a real phone | One decode at a time; limits; Cancel | Lower the file limit per measured result | Do not release with a claim of capacity |
| R-IP-002 | Total size limit too low or too high for real photos | IP-1 | Medium | UNKNOWN | Measure with 12 MP camera photos | Provisional 100 MB, stated on the page | Adjust after measurement | Limit is recorded in the pack, not as a promise |
| R-IP-003 | A size target or total is misreported | IP-1 | High | Low | Compare every figure with the Blob size and Pillow | Report real Blob sizes only | Remove the figure | Blocks release |
| R-IP-004 | Crop or rotation produces the wrong pixels (rounding, EXIF double-rotation, stretch) | IP-2 | High | Medium | Pillow oracle fixtures incl. EXIF 1-8 and asymmetric images | Pure geometry functions, one rounding rule | Ship crop only in numeric mode | Blocks release |
| R-IP-005 | A cropped output exceeds output limits or builds a large intermediate | IP-2 | Medium | Low | Instrumented canvas sizes | Source-rect draw straight to output size | Refuse with the existing message | - |
| R-IP-006 | PDF page rotation differs between viewers | IP-3 | Medium | Medium | Render in a real decoder; pypdf; test more than one viewer path where possible | Redraw instead of placement rotation | Redraw only | Safari/phone viewers unverified |
| R-IP-007 | Photos to PDF may carry Exif/GPS inside the PDF (INFERRED, untested) | IP-3 | High (privacy) | Unknown until AC-PP-004 | AC-PP-004 first | Segment strip with byte-identity check | Disclose plainly if the strip is not built | Decide copy before release |
| R-IP-008 | PDF.js bundle size and memory cost on phones | PDF to Images | High | Likely | Spike: size on disk, peak memory, time per page | Render one page at a time; cap scale and pages | Defer the tool | Spike gates entry |
| R-IP-009 | Running third-party code for the spike is refused by permission policy | PDF to Images | High | Occurred once (Tool Pack 41) | Ask in the normal way once | Static audit only until permitted | Stay deferred | Not a failure of the product |
| R-IP-010 | Rendered output differs from the PDF (fonts, transparency, forms) | PDF to Images | Medium | Medium | Compare against an independent renderer (pdftoppm) on fixtures | State limits; no fidelity promise | Defer | - |
| R-IP-011 | A PDF 'compressor' that does not help or enlarges files | PDF compression | High | Likely | Measure on scanned, text and mixed PDFs | Do not build | Defer | Excluded from this programme |
| R-IP-012 | Redundant pages or scope creep toward an editor | C07 C11 C19 C23 C24 | Medium | Medium | Candidate review each pack | Consolidate into existing tools | Reject | - |
| R-IP-013 | PDF text drawing and metadata edits are partial (fonts, XMP) | C08 C09 | Medium | Medium | Reader tests | Not in the programme | Defer | - |
| R-IP-014 | HEIC decoder licence, size and runtime unknown | C10 | Medium | UNKNOWN | Audit | Deferred | Stay deferred | - |
| R-IP-015 | OCR and background removal need large model downloads | C12 C18 | High | Certain | Spike | Deferred | Stay deferred | - |
| R-IP-016 | Features whose results cannot be promised (editing, signing, protection, conversion, repair) | C13-C17 | High | Certain | Gate review | Rejected or deferred | - | - |
| R-IP-017 | Accessibility failure in the file list, crop control or announcements | IP-1 IP-2 IP-3 | High | Medium | Keyboard and live-region tests at 320/390 px | Numeric fields always present; one announcement per phase | Fix before release | Blocks release |
| R-IP-018 | Privacy leakage through a request, storage or URL | all | High | Low | Request-capture and storage tests | No network code in engines | Remove the feature | Blocks release |
| R-IP-019 | Hard-coded institution sizes become wrong or imply endorsement | IP-2 | Medium | Medium | grep test | User-entered sizes only | Remove | - |
| R-IP-020 | Image and PDF journeys are broken by section isolation (rule 4.2) | all | Low | Certain | Review | Body-text mentions only (D5) until the owner decides | Keep sections separate | Owner decision |

## 2. Dependency relationships

IP-1, IP-2 and IP-3 depend only on IP-0 and are independent of each other. IP-4 depends on a separate owner decision (running the candidate library). IP-5 depends on IP-1..3. Nothing depends on IP-4.

## 3. Unresolved technical decisions

1. Whether pdf-lib's `embedJpg` keeps Exif/XMP/IPTC inside the PDF (R-IP-007). Settled by AC-PP-004, a single test, before any design.
2. Page-placement rotation versus redraw for kept JPEGs (R-IP-006).
3. Whether a ZIP of batch results is worth its own writer (C22), after a real-phone download check.
4. Whether the renderer for PDF to Images fits phones (R-IP-008), and permission to run it (R-IP-009).
