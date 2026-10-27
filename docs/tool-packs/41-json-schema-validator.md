# Tool Pack 41: JSON Schema Validator

STATUS: NOT BUILT. Blocked at the library gate (see "Blocker"). Nothing is registered in the catalog, the build or the Growth ledger, and no page exists.
REQUIREMENTS: owner authorization of 2026-10-27 (C3, conditional on the technical gates: licence and provenance audit, browser compatibility, supported spec versions, dependency size and maintenance risk, security and reference-loading behaviour).

## Gate audit of the one candidate examined

Candidate: `@cfworker/json-schema` 4.1.1 (chosen over Ajv because Ajv compiles schemas with `new Function`, which conflicts with the site's no-eval rule, and over Hyperjump because of its dependency tree and size).

| Gate | Result | Evidence |
| --- | --- | --- |
| Licence | PASS | MIT. `LICENSE.md` (copyright 2020 Jeremy Danyow) and `THIRD_PARTY_NOTICES.md` (punycode.js MIT, ajv MIT) fetched from the upstream repository. The npm tarball itself carries no LICENSE file, so the upstream copies are what is kept. |
| Provenance | PASS | npm tarball downloaded to its own directory and handled as data. sha256 `f3a8076b...0610203`; the sha512 integrity matches the registry value. The ES modules are vendored byte for byte (verified with `cmp`) in `tests/fixtures/candidates/cfworker-json-schema-4.1.1/` with `PROVENANCE.md`. |
| Size and dependencies | PASS | 50,591 bytes of unminified ES modules across 9 files; no dependencies. |
| No code execution, network or storage | PASS (static read) | No `eval`, `new Function`, `fetch`, `XMLHttpRequest`, dynamic `import`, `document`, `window`, storage or timers in `dist/esm`. |
| Reference loading | PASS (static read) | `$ref` is looked up only in schemas supplied in the same document (`lookup[uri]`); an unknown reference throws "Unresolved $ref". Nothing is fetched. Relative `$id` values resolve against the page URL, which only produces keys. |
| Spec versions | AMBER | Drafts 4, 7, 2019-09 and 2020-12 are declared. There is no draft 6. `$dynamicRef` and `$dynamicAnchor` do not occur in the source, so 2020-12 dynamic references are not supported; the page would have to say so. |
| Maintenance | AMBER | Last npm release 2025-01-31; the repository was still receiving commits in 2026 (not archived). The code would be vendored and pinned, so the risk is slow upstream fixes, not breakage. |
| Hostile schemas | CONDITION | `pattern` and `patternProperties` call `new RegExp(pattern, "u")` on text the user pastes. A pattern such as `^(a+)+$` can freeze the tab. The planned mitigation is to validate inside a module Worker (the Image tool already uses one) with a time limit and `terminate()`, and to refuse when no Worker exists. |
| Browser compatibility | NOT TESTED | Not run in any browser. Only Chromium would be tested; Safari and Firefox would not be claimed. |
| Conformance evidence | NOT OBTAINED | The official JSON-Schema-Test-Suite (MIT, commit `76b529ff69fa6f284d3e8916cb82cb2e93f82557`, drafts 4, 7, 2019-09 and 2020-12, 164 files) is kept as data in `tests/fixtures/json-schema-test-suite/` to be the independent oracle. It has not been run against the library. |

## Blocker

The remaining gates cannot be closed without executing the vendored third-party code: running the conformance suite, the hostile-pattern timeout test and the browser checks. The permission classifier refused the first command that would have run the vendored library (a Node script importing it), because it is downloaded external code. That was not worked around. The static audit above found nothing disqualifying.

Decision needed from the owner: allow running the vendored library in tests (the conformance run is a data-only Node script plus a Chromium page), or choose another route. Until then no validator page is shipped and no substitute (for example a hand-written partial validator) is offered: a tool that claims to validate against JSON Schema but implements part of it would mislead.

## If approved, the build plan

1. Run the suite per draft; record pass and fail counts per file and list the unsupported keywords on the page.
2. Pure engine `schema-engine.js`: parse both texts with the shared strict reader, choose the draft from `$schema` (default 2020-12, shown, changeable), call the library with `shortCircuit` off, list errors with instance pointer, keyword and message (first 200, counted).
3. `schema-worker.js` runs the engine; the page terminates it after a few seconds and says which input to suspect.
4. Page, CSS, catalog entry (tools 60, Developer Tools 13), tests and baselines as for the other packs.

## Files currently in the working tree for this pack (uncommitted)

- `tests/fixtures/candidates/cfworker-json-schema-4.1.1/` (the candidate library, licence, notices, provenance). It is kept outside `assets/` so that nothing unreferenced ships in `dist/`; if the gate is approved it moves to `assets/js/vendor/cfworker-json-schema/`.
- `tests/fixtures/json-schema-test-suite/` (conformance data, licence, source note)
