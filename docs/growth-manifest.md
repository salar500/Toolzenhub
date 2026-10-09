# Growth manifest export: operating guide

The Growth manifest is a read-only, local snapshot of the **published** ToolZenHub tools and articles, in the format the
separate Growth OS project reads (manifest schemaVersion 1). This page says how to produce, check and reason about it. The
durable policy lives in `docs/product-decision-rules.md` section 6 (items 6 and 7); this page is the procedure and does not
restate or override it.

## Purpose and boundaries

- It describes content that already exists on the site: identity, route, title, description, section and category,
  capabilities, curated relationships, a hero image descriptor and dates. It adds nothing new and invents nothing.
- Producing a manifest **does not import it, publish it, post anything or approve any marketing**. `marketingEligible` in the
  file only means "published, with a valid page, and a valid item"; it is not a decision to promote anything.
- A Growth OS operator reviews and approves every import, every categoryless section and every destination origin, separately,
  in Growth OS. A passing `--check` authorizes none of that.
- Nothing here touches the live website, its build, its routes or its deployment. The code is not imported by any page.

## Prerequisites

- Node 20 or later and Git, run from the repository root of the website (the folder with `package.json`).
- The checked-out branch is `main`, at a commit that has its full history (a shallow clone is refused).
- Everything that can influence the manifest is committed (see "Dirty-input refusal").
- No dependencies are installed or needed for the export.

## Commands

```
node scripts/growth-manifest/export.mjs --check
node scripts/growth-manifest/export.mjs --write
```

Exactly one flag is required. There is no default action, no option to choose a path, and no option to skip or weaken a check.
Exit status: `0` success, `1` the export was refused, `2` the command line was wrong.

- **`--check`** runs every validation, builds the exact file bytes in memory and prints the facts (source revision, counts,
  manifest fingerprint, file SHA-256, size and the output path it would use). It writes nothing and creates no directory.
- **`--write`** runs the same checks, then writes `growth-export/toolzenhub-manifest.json`. **Do not run `--write` without the
  owner's explicit authorization for a real export.** The first real export is a separately approved step.

## What the file says about its source

- `source.revision` is the full 40-character id of the commit at `HEAD`, and `source.dirty` is always `false`: a dirty source is
  refused before a file exists.
- `generatedAt` is that commit's **committer time** in UTC with milliseconds, never the time the command ran. The same commit
  therefore always produces the same bytes. (Git cannot record a commit before 1970, and epoch 0 is accepted.)
- The manifest fingerprint depends only on the content, so it is the same for two commits that publish the same content. The
  file hash depends on the revision and time too, so it changes with every new commit. Do not copy either value into a document
  as if it were permanent; read it from a fresh `--check` of the commit you mean.

## Dirty-input refusal

The export refuses unless every file that can influence the manifest is tracked, unmodified, unstaged, reached through no
symbolic link, and holds exactly the bytes of its blob at `HEAD` (compared directly, not only through `git status`, with the
repository's own line-ending rules applied, so an ordinary Windows checkout is not a false alarm). The set of files is **traced
from the code**, not listed by hand:

- the export's own modules (`scripts/growth-manifest/`), the four catalogs under `assets/js/data/`, and every module the catalog
  loaders execute (static imports, re-exports and literal dynamic imports, transitively);
- the data files the producer reads by path (`package.json`, `src/_data/toolStyles.json`, the identity ledger), the hero images
  the manifest describes, and the implementation file of each published tool (the identity ledger anchors a tool to it);
- any `package.json` above a traced module, because it changes how the module loads.

Anything the tracer cannot see through, such as a computed import, `require`, `import.meta`, file-system or network APIs in a
traced module, makes the export refuse instead of guessing. Unrelated files, including the drafts under `docs/tool-packs/`,
never block an export. If a refusal names a file, commit or revert it, then run `--check` again.

The files are verified again immediately before anything is written, and `HEAD` must not have moved. If something changed in
between, the export refuses and writes nothing.

## The identity ledger

`scripts/growth-manifest/identity-ledger.json` is the permanent record that stops a content identity from being reused or
lost. The catalogs remain the source of truth for what exists now; the ledger only remembers what must never be reused. It is
**never rewritten by a script or by the export**: every change is a deliberate, reviewed edit committed together with the
catalog change. The header of `scripts/growth-manifest/ledger.mjs` has the full rules. In short:

- **New article:** take `nextArticleId`, add a record with provenance `allocated`, and advance `nextArticleId`. A gap below
  that number is reserved forever.
- **Newly published tool:** add a record with provenance `added` and its implementation module.
- **Rename an article's topic/slug:** set the new `key` and append `{ from: <old key>, reason }` to `keyChanges`.
- **Move a published tool's implementation:** set the new `module` and append `{ from: <old path>, reason }` to
  `moduleChanges`.
- **Retire:** set `state` to `retired` with a `retired.reason`. The id and every key it ever had stay reserved. Only then may
  the item leave the catalog. Retirements appear in the manifest as informational `retired` advisories; they are not
  instructions to delete, unpublish or market anything.
- Refused: removing a record, reviving a retired one, editing history, provenance or the verified window, reusing a retired id
  or key, and giving a published tool's id to a different implementation.

Every export compares the committed ledger with **every earlier committed version** along the branch (the first committed
version is validated on its own; it is the bootstrap boundary). That proves a legitimate evolution of the committed history.
It cannot protect against someone deliberately rewriting Git history itself.

## Output

`growth-export/toolzenhub-manifest.json` under the repository root is the only place a manifest is ever written, and Git ignores
the folder (the export refuses if it does not). The write goes to a temporary file in the same folder, is read back and
verified, then replaces the old file in one step; on any failure the temporary file is removed and the previous output is left
as it was. A symbolic link, or anything that is not a plain folder or file there, is refused. Never commit, serve or deploy the
file.

## When the export refuses

The report names a stage, a code and the file or identity concerned. Nothing is written.

| Stage | Meaning | What to do |
| --- | --- | --- |
| `usage` | wrong flags | give exactly `--check` or `--write` |
| `identity` | not the website repository, not `main`, no usable commit time, or a commit more than 24 hours in the future | run from the repository root on `main`; check the clock and the commit |
| `tracing` | a dependency is missing or cannot be classified | restore the file, or remove the construct the tracer cannot see through |
| `dirty-source` | a guarded file is modified, staged, deleted, renamed, untracked, hidden from Git, aliased by a link, or differs from `HEAD` | commit or revert it |
| `ledger` | the ledger's committed history is not a legitimate evolution, or the history is incomplete | fix it through a reviewed ledger commit; fetch the full history |
| `mapping` | a published item is invalid, or the catalogs disagree with the ledger | fix the catalog or record the change in the ledger; nothing is silently left out |
| `recheck` | a guarded file or `HEAD` changed while the export ran | run it again without touching the repository |
| `manifest` | the finished file failed validation | this is a producer defect; report it |
| `output` | the destination is unsafe, not ignored, or could not be written | fix the folder; the previous output is intact |
| `stale-modules` | (library use only) the source changed inside one process | start a new process; the command line always does |

## Determinism

The same commit gives byte-identical output: keys and items have a fixed order, there is no clock, locale, random value or
machine path in the file, and the format is the consumer's canonical one (UTF-8, no BOM, two-space indent, LF, one trailing
newline, at most 4 MiB and 1000 items). The imported Growth golden vectors in `tests/fixtures/growth-manifest/` pin the
serialization and must never be edited to make code pass (see the `PROVENANCE.md` beside them).

## Consumer compatibility and approvals

- The envelope is `schemaVersion` 1, site `toolzenhub`, generator `toolzenhub-growth-manifest` version `1.0.0`. No
  `declaredCanonicalOrigin` is written: the destination origin is a Growth-side owner decision.
- The sections whose tools have no category are reported by `--check` for review. Growth OS rejects such tools unless the
  operator lists the section in its own trusted configuration; the producer never works around that. They are not approved by
  this repository.
- Before a first real import, Growth OS must be started with its **global stop engaged** (its default), and the operator
  previews, reviews and approves the plan there. The website side never releases or alters the stop.

## Known limitations

- The dependency trace reads source text, not a full parser. It is built to refuse rather than miss, but it is not a proof for
  arbitrary future code.
- Verified bytes cannot be pinned between the check and the module load: a process with write access to the working tree can
  change a file in that gap. The final re-verification turns a detected change into a refusal; it cannot stop a malicious
  local actor.
- The ledger lineage cannot detect a rewrite of Git history, and a shallow clone is refused because it cannot prove one.
- A hero image must currently be a PNG under `assets/Images/` (an implementation detail, not product policy); others make the
  export fail closed.
- Windows may skip tests that need symbolic links; the matching checks are still enforced in the code.
