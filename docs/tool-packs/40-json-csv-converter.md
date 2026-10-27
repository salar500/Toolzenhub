# Tool Pack 40: JSON and CSV Converter

STATUS: IMPLEMENTED locally (not pushed, not deployed)
TIER: MEDIUM (fast tool pack, factory section 2a). Pure text transforms with an independent oracle.
REQUIREMENTS: owner authorization of 2026-10-27 (the 13-tool Balanced scope, C5); RFC 4180 for CSV, RFC 8259 for JSON (through the shared `json-tree` reader). This file is the specification and records what was built.

## Decision

One Developer Tools page, two directions. Route `/tools/json-csv-converter/`, id `json-csv-converter`, section `developer-tools`. It reads and writes text only (no Excel files).

## Files

- `assets/js/tools/json-csv/json-csv-engine.js`: pure engine (header states every rule). Reads JSON with `json-tree` so numbers keep their exact text and duplicate keys are detected.
- `assets/js/tools/json-csv/index.js`, `assets/css/tools/json-csv.css`, `src/_data/toolStyles.json`, catalog entry, Growth ledger entry.
- `tests/unit/json-csv.test.mjs` (21 tests), `tests/fixtures/json-csv-golden.py` + `.json` (Python `csv` module, 150 seeded tables, four delimiters), `tests/browser/json-csv.spec.js` (14 tests, desktop and mobile).

## Rules as built

- JSON to CSV: needs a non-empty array of objects; columns in first-seen order; missing key = empty cell; numbers verbatim; null = empty cell (counted in the notes); RFC 4180 quoting; delimiter comma, semicolon, tab or pipe; line ends LF or CRLF.
- Nested values: refused naming row and column by default; option writes compact JSON text into one cell. Never flattened into extra columns.
- Formula guard (default on; owner-visible option): string cells and header names starting with `= + - @ tab CR` get a leading `'`; real numbers are untouched; the count is reported. Documents the CSV-injection risk (SEC-011).
- CSV to JSON: RFC 4180 reader (quoted fields, `""`, line breaks in quotes, CRLF/LF/CR), BOM removed, empty lines skipped and counted (a quoted empty field is a record), every record must match the first record's width (refused with the record number), header names non-empty and unique, errors carry line and column. Output is built as text so `__proto__` stays a plain key. Values are strings; the option converts exact JSON numbers (at most 15 significant digits, no leading zeros or plus sign) and `true`/`false` only; empty stays `""`.
- Limits: 1,000,000 characters, 50,000 rows, 1,000 columns. Up to 20,000 characters convert as you type.

## Known limits

- The JSON input limit is the same 1,000,000 characters as CSV, so a CSV that is under the limit can produce JSON that is too large to convert back.
- Numbers longer than 15 significant digits stay strings when converting CSV to JSON, by design.
- No type inference beyond numbers and booleans; no dates.
