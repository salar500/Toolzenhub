# ToolZenHub: instructions for Claude Code

The permanent product, testing and delivery rules live in `docs/product-decision-rules.md`. That file is the single source; this one only points to it and does not restate it.

In every development phase:

1. Read `docs/product-decision-rules.md` first (at least sections 10, 11 and 15) and follow it, together with the procedure document that owns the topic at hand (`docs/tool-pack-factory.md`, `docs/tool-pack-template.md`, `docs/content-clusters.md`, `docs/shared-tool-ux.md`, `tests/README.md`, or the tool's spec in `docs/tool-packs/`).
2. Follow the maintenance process in section 15 ("Maintenance process"): record every durable decision the user approves in the document that owns it, in the same phase; replace changed wording instead of adding beside it; never record a proposal as approved; report conflicts instead of silently overriding a rule; and name every rule change (or "none") in the phase's final report.
3. Commit, push and deployment approvals are as set in section 11. Never touch Hostinger production (`toolzenhub.in`).
