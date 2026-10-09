# Vendored Growth OS golden vectors

These two files are **reference data**, copied byte for byte from the Growth OS repository. They are not a dependency:
the producer in `scripts/growth-manifest/` is an independent implementation that must reproduce every value, and no
test reads the Growth repository.

| Item | Value |
| --- | --- |
| Source repository | ToolZenHub-Growth (separate local repository, no remote) |
| Source paths | `tests/fixtures/toolzenhub-manifest/golden-vectors.json`, `tests/fixtures/toolzenhub-manifest/golden-vectors.sha256` |
| Growth commit at copy time | `112a7e97240ac2f74cb757037dc8aea97757aee0` |
| Commit that last changed the fixture | `1af2b472a814e9e17545235a08a189d5b124bebd` (categoryless amendment, manifest schemaVersion 1) |
| SHA-256 of `golden-vectors.json` | `f2990df78c0d3c3c247f73463050d2b46af8bf21def7fc641ad82d70cf20e9e6` |
| Contract | Growth `docs/09-INTEGRATION.md` section 12a, `docs/adr/0004-manifest-consumer-and-atomic-sync.md` and Amendment 1 |
| Data | Entirely synthetic (the fixture contains ASCII only; every other character is a `\u` escape) |

Rules:

- Never edit these files to make code pass. A mismatch is a defect in the producer, or the contract changed.
- To refresh after a contract change: re-copy both files from Growth, update the commit and hash above, and review
  every changed expectation in `tests/unit/growth-manifest-*.test.mjs`. `tests/unit/growth-manifest-vectors.test.mjs`
  fails if the pin, this record or the fixture bytes disagree.
- `.gitattributes` marks this folder `-text` so a Windows `core.autocrlf` checkout cannot rewrite the line endings
  and break the byte-exact pin.
