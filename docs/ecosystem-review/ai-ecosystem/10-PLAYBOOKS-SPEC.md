# 10. Reusable Playbook specification

## 1. Decision: a playbook is a file, not a stored object

Vendors offer reuse inside their own product (custom GPTs, Gems, Skills, project instructions, Runway's workflow library; S10, S30). ToolZenHub's reuse is **provider-neutral and storage-free**: a playbook is a Work Pack file the visitor keeps, plus a small set of curated starters on the page. This satisfies rulebook 7.7 without an exception. Browser-local saving remains a later, opt-in option (section 6).

## 2. Two kinds

| Kind | What it is | Where |
| --- | --- | --- |
| **Starter** (curated by ToolZenHub) | a task id, prefilled non-personal answers, a depth, and for multi-task starters an ordered list of steps (each a task id with answers) | data file `ai-workbench/playbooks.js`; shown in the Workbench "Start from a playbook" |
| **Personal playbook** (the visitor's) | a downloaded Work Pack `.md` with its metadata block; reopened, edited, downloaded again | the visitor's own files |

## 3. Starter set for the first release (each must pass rule 1.3 on its own value)

| Starter | Steps (existing task ids) | Who (context) |
| --- | --- | --- |
| Weekly article or newsletter | `article` (detailed), `repurpose` | content |
| YouTube video from idea to upload | `video-concept`, `script`, `thumbnail` | creators |
| Release testing | `test-plan`, `test-cases`, `regression`, `defect` | QA |
| API test cycle | `api-testing`, `test-automation` | QA, SDET |
| Bug investigation | `debug` (multi), then Bug Report tool for a single defect | developers |
| Feature from requirements to review | `requirements`, `code-feature`, `code-review` | developers |
| Research report | `research-plan`, `literature-review`, `report` | research |
| Monthly business report | `data-analysis`, `report`, `presentation` | business |
| Meeting follow-up | Meeting Notes tool, then `email-message` | business |
| Consistent image series | `image-series` with the consistency sheet | creators |

Prefilled answers are generic (format, depth, scope choices); never invented project facts. Each starter shows "Last reviewed: <date>" and is reviewed with the blueprints (every six months with the directory).

## 4. Playbook file structure

A Work Pack `.md` (`07` section 9) whose metadata block (`14` section 3) holds: `kind: work-pack` or `playbook`, `format` version, `task`, `answers`, `role`, `experience`, `depth`, `product`, `consistency`, `context` (optional), `steps` (for multi-task playbooks: list of `{ task, answers }`), `created`, `version`, `title` (visitor's own name for it, optional).

## 5. Reuse operations

| Operation | Behaviour |
| --- | --- |
| Open | file input or paste; validates the block (known keys, task exists, answer keys belong to the task, sizes); unknown keys are ignored and listed; a removed task gives "This pack's task is no longer offered" and keeps the text readable |
| Adapt | any answer edited; changed answers are marked until download |
| Duplicate | "Save as a new playbook" = download with version 1 and a new title |
| Version | download increments `version` and sets today's date |
| Export | the `.md` itself (works as a readable document in any editor or AI product) |
| Import from someone else | the same as Open; the page notes that a shared file may contain their project details |
| Stale detection | a pack with `format` older than the current one is migrated by a pure function with tests; a pack older than six months shows "Blueprints may have changed since <date>; check the answers." |

## 6. Later, opt-in browser saving (Experimental, not in initial production)

Only after owner approval and a Privacy page change (Stage 11 of Tool Pack 58, now generalised): off by default; one key; titles, task ids, answers and context profiles only; edit, duplicate, export, import, delete and "delete everything"; validated before use; size limit stated. Not to be built in Phase 2 unless the owner approves D6.

## 7. Acceptance criteria

1. Every starter compiles; every step opens the Workbench at the right task with its answers.
2. Open → download → open gives identical answers and master prompt for every task's example (round trip).
3. A tampered block (unknown task, extra keys, oversize, invalid JSON) is refused or trimmed with a specific message; the page never executes or renders it as HTML.
4. No starter contains personal or invented project facts.
