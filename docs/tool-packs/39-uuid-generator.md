# Tool Pack 39: UUID Generator

STATUS: IMPLEMENTED locally (not pushed, not deployed)
TIER: MEDIUM (fast tool pack, factory section 2a). Pure byte layouts; randomness and the clock are injected.
REQUIREMENTS: owner authorization of 2026-10-27 (the 13-tool Balanced scope, C6); layouts checked against RFC 9562 (sections 4, 5.4, 5.7, 5.9, 6.2, 8). This file is the specification and records what was built.

## Decision

A Developer Tools page that generates UUIDs. Route `/tools/uuid-generator/`, id `uuid-generator`, section `developer-tools`. Versions: 4 (random), 7 (time-ordered) and nil. It does not validate, parse or look up UUIDs on the page (the engine has an `inspect` helper used by tests).

## Files

- `assets/js/tools/uuid-generator/uuid-engine.js`: pure engine; it never reads the clock or a random source (a unit test scans for `Date.now`, `Math.random`, `crypto.`).
- `assets/js/tools/uuid-generator/index.js`: page; the only place that touches `crypto.getRandomValues` and `Date.now`.
- `assets/css/tools/uuid-generator.css`, `src/_data/toolStyles.json`, catalog entry, Growth ledger entry.
- `tests/unit/uuid-generator.test.mjs` (13 tests), `tests/browser/uuid-generator.spec.js` (14 tests, desktop and mobile).

## Rules as built

- v4: 16 random bytes; version nibble forced to 0100 and variant bits to 10 (RFC 9562 section 5.4).
- v7 (section 5.7): 48-bit big-endian millisecond timestamp, version 0111, 12-bit `rand_a`, variant 10, 62 random bits. `rand_a` is the fixed-length counter of section 6.2 method 1: seeded at random below 2048 for each new millisecond, +1 per further UUID in that millisecond; on overflow past 4095 the timestamp moves one millisecond ahead and the counter is seeded again (the "increment the timestamp" option the RFC permits). So a batch sorts in creation order; a very large batch can run slightly ahead of the clock; ordering between separate batches in one millisecond is not guaranteed (stated on the page).
- nil: 128 zero bits.
- Count: a whole number from 1 to 1000 (default 5), refused with a message beside the field.
- Display options: uppercase, hyphens (default on), braces. They change only the text, never the bits.
- No secure random source means no UUIDs and a stated reason; there is no `Math.random` fallback (browser-tested).
- The page states that a UUID is an identifier, not a secret (RFC 9562 section 8: must not be used as a security capability) and that v7 reveals its creation time.

## Known limits

- Uniqueness is statistical; nothing is checked against the user's existing identifiers.
- UUID versions 1, 3, 5, 6 and 8 are not offered.
