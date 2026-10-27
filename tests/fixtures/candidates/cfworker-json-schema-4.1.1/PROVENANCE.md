# @cfworker/json-schema (candidate, not shipped)

Kept here as an unreferenced candidate while the JSON Schema Validator gates are open (docs/tool-packs/41-json-schema-validator.md). Nothing imports it.

- Package: `@cfworker/json-schema` 4.1.1 (npm), repository https://github.com/cfworker/cfworker
- Licence: MIT (`LICENSE.md`, copyright 2020 Jeremy Danyow). Contains code derived from punycode.js (MIT) and ajv (MIT); their notices are in `THIRD_PARTY_NOTICES.md`.
- Obtained 2026-10-27 from the npm registry tarball `https://registry.npmjs.org/@cfworker/json-schema/-/json-schema-4.1.1.tgz`, handled as untrusted data (extracted into its own directory, never run, never installed).
  - tarball sha256: `f3a8076b450505f0671fa78a6efb5e7726883e2c6dfb13b29261872803610203`
  - tarball integrity (sha512, matches the registry): `sha512-gAmrUZSGtKc3AiBL71iNWxDsyUC5uMaKKGdvzYsBoTW/xi42JQHl7eKV2OYzCUqvc+D2RCcf7EXY2iCyFIk6og==`
- Files: the compiled ES modules of `dist/esm/*.js`, copied unmodified (type declarations and the CommonJS build are not included). No dependencies.
- Audit (see docs/tool-packs/41-json-schema-validator.md): no `eval`, `new Function`, network access, storage, DOM or timers in these files; `$ref` is resolved only against schemas supplied in the same document; user-supplied `pattern`/`patternProperties` run through `new RegExp(..., "u")`, which is why the page validates inside a Worker with a time limit.
- Do not edit these files. To update, repeat the download and checks and replace the whole directory.
