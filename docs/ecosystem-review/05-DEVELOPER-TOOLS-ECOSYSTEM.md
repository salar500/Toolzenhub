# 05. Developer Tools ecosystem

Scope: the 6 published Developer Tools: JSON Formatter & Validator, Unix Timestamp Converter, Text Diff, JWT Decoder, Cron Expression Explainer, Base64 Encoder/Decoder. All answer 200 on production. None has an article, and none renders a related-tools section.

## Links today

| Tool | Text links in its module | Curated `relatedTools` |
|---|---|---|
| JSON Formatter | Unix Timestamp Converter | Unix Timestamp Converter |
| Unix Timestamp Converter | JSON Formatter | JSON Formatter |
| Text Diff | JSON Formatter | JSON Formatter |
| JWT Decoder | JSON Formatter, Unix Timestamp Converter | JSON Formatter, Unix Timestamp Converter |
| Cron Expression Explainer | Unix Timestamp Converter | Unix Timestamp Converter |
| Base64 Encoder/Decoder | JWT Decoder, JSON Formatter | JWT Decoder, JSON Formatter |

## Workflows evaluated

| Workflow | Does the same user need both? | Verdict |
|---|---|---|
| Debug a token: JWT Decoder, then Unix Timestamp Converter for `exp`/`iat` | Yes: JWT claims are Unix seconds | EXISTING (link both directions? only JWT to Unix exists). An explanatory link is enough; **never transfer the token or claims automatically** (secrets) |
| Inspect a payload: Base64 decode, then JSON Formatter | Yes | EXISTING (Base64 links JSON Formatter) |
| Debug JSON then compare: JSON Formatter, then Text Diff | Plausible | PARTIAL: Text Diff links to JSON Formatter, JSON Formatter does not link back |
| Understand a cron schedule, then check its time implications: Cron Explainer, then Unix Timestamp Converter or Time Zone Converter | Weak: cron is time-zone sensitive, the explainer's text covers the caveat (not re-read) | A Time Zone Converter link would cross sections (rulebook 4.2): text-only if at all, owner decision |

## Findings

| ID | Current problem | Evidence | Recommendation | Priority | Approval |
|---|---|---|---|---|---|
| D1 | Related tools are never rendered on these pages | modules export `showRelatedCalculators = false` | See N1 in 08 | High for shared UX | Owner (shared UX phase, rulebook 4.8) |
| D2 | The graph is uneven (JWT to Unix exists; Unix to JWT does not) | table above | Add reciprocal curated relations only where the same person needs both | Low cost | Phase A |
| D3 | No explanatory content for common mistakes | no articles | See 09: troubleshooting guides drawn from real tool behaviour (seconds vs milliseconds, `exp` meaning, cron time zones) are candidates; demand is a hypothesis | Medium | Per guide |
| D4 | Candidate tools in the lists (JSON Schema/JSONPath, JSON Diff, Regex, UUID, hashes, URL encoding, YAML/CSV converters and so on) | 02 | JSON Schema & JSONPath is the only one in an authoritative list (P1, Developer Tools); the Regex Tester exclusion stands. Others are unevaluated commodities | Needs section-12 evaluation | Owner |

## Boundaries

No automatic data transfer between tools for JWTs, secrets or arbitrary text. Processing stays browser-local (existing claim: "processed in your browser"). Any new tool must keep that claim narrow and true. No code execution, no network probing.

## Not verified

Correctness of the six engines was not re-tested; per-tool accessibility, mobile and Safari behaviour not audited.
