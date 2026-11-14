# Release ledger

Rules: `docs/product-decision-rules.md` section 11. GitHub Pages is the development preview; Hostinger production (`toolzenhub.in`) is manual and was not touched by any record here.

## Update 2026-11-14 (release candidate f994b41c, built, not deployed)

| Item | Record |
|---|---|
| File | `C:\Users\DELL\Documents\ToolZenHub-production-package\toolzenhub-production-f994b41c.zip`, 16,598,797 bytes, 1,297 entries |
| SHA-256 | `c809ab2b21baeb5261f409a19a67ee2f1bbc81effb40e638e93e569f26ada93d` |
| Source | `f994b41c`, branch `feature/unified-ecosystem-workspace` (application code identical to `997990b0`); `npm run build`, clean tree, 2026-11-14 19:36 IST |
| Checks | byte-identical to `dist/`, zip test clean, production canonicals and sitemap (671 URLs) and robots, static checks passed, browser smoke on 11 pages at 1280 and 390 px; full projects in `docs/site-audit-ledger.md` Batch 27 |
| Open | browser link crawl not passed on this code (timeouts, then stopped for low memory) |
| Superseded | `toolzenhub-production-a395fb0.zip`, `-794cf6a`, `-a3b498d` (kept, stale) |

Migration steps, smoke checklist and rollback: `docs/production-handoff.md`. Hostinger, DNS and `main` untouched.

## Update 2026-11-07 (preview current, production package ready, not deployed)

Pushed `8fa60fd..f743d72` to `origin/main`, fast-forward, no force; 6 commits. Preview `https://salar500.github.io/Toolzenhub/` serves that build: `date-field.js`, `section-switcher.css` and `index.html` are byte-identical (SHA-256) to the tested `dist-ghpages/`; home, tool, calculator, article, category, robots, favicon and sitemap routes return 200, an unknown path returns the 404 page, the sitemap lists 131 production URLs. The `gh` CLI is unavailable, so the check is by direct requests (rule 11.3). Regression evidence: Q3-19 in `TEST_EXECUTION_LEDGER.md`.

| Item | Record |
|---|---|
| File | `C:\Users\DELL\Downloads\ToolZenHub-hostinger-dist-20261107-f743d72.zip`, 6,704,220 bytes |
| SHA-256 | `b53c948989c82d6b54c4ac4729862ea1c5934233f50d553ebe994b53f37e628c` |
| Contents | 666 files (the whole of `dist/`, including `.htaccess`), `index.html` at the root, forward-slash paths, no `.map`, `.spec.js` or `.env`; every entry byte-identical to `dist/`; `zipfile.testzip()` clean; canonical and sitemap use `https://toolzenhub.in/`, 131 sitemap URLs |
| Source | built from the sources of `f743d72` (the later commit changes documentation only); `/Toolzenhub/` appears in `dist/` only in router, header and footer path comparisons and the GitHub issues link, not in any asset or page URL |
| Not touched | Hostinger / `toolzenhub.in`; the earlier archives `20261103-1428`, `20261105-9d1c984` and the 2026-11-02 backup are preserved and stale |

Staging verification (2026-11-07, HEAD `637ae76`, details in Q3-20): the Pages workflow succeeded on `637ae76` and every served file equals a fresh preview build of it; 131 of 131 sitemap pages are clean on desktop and mobile; the live smoke specs pass except harness artifacts and one timing finding (F-1). ZIP against the final commit: a fresh `npm run build` of `637ae76` gives 666 files with 0 content differences from the ZIP, and the ZIP hash is unchanged, so the filename's `f743d72` is only the label of the last code commit (`637ae76` changes this ledger only). Line endings: this machine's `dist/` uses CRLF in 189 text assets where the CI-built preview uses LF; browsers treat both alike, the content is otherwise identical, and the earlier archives were built the same way.

Deploy only this exact artifact, manually, without deleting unrelated hosting content (for example `.htaccess` rules on the server or other sites); take or confirm a backup of the live site first. Production has not been assessed after deployment.

## Update after the Q3 cycle (2026-11-04)

Eight local commits after `f5a1df4` (`b342344` to `b714e57`, plus the closing records commit). Nothing is pushed: `origin/main` is behind HEAD. The Hostinger zip and its hash below were built from `f5a1df4` and no longer match the code, so they must NOT be deployed; rebuild `dist/` and regenerate the zip and hash at release time. The preview site still shows `f5a1df4`. Full regression was not run; the checks that were run are listed per change in `TEST_EXECUTION_LEDGER.md` (Q3-2 to Q3-9). A release checkpoint (unit suite, desktop and mobile browser groups, axe sweeps) is due before any push to the preview of this batch or any deployment.

## Update 2026-11-05

HEAD `8daef8f`, 29 local commits after `f5a1df4`, nothing pushed. The Hostinger zip `ToolZenHub-hostinger-dist-20261103-1428.zip` (SHA-256 `A12191702E...DBE42`, re-checked 2026-11-05, still matches this record) is built from `f5a1df4` and is STALE: do not deploy it. It and `ToolZenHub-backup-20261102-2311.zip` are preserved. No fresh archive has been made: the mobile and root-desktop regression for this HEAD is incomplete (see Q3-17), so the archive preconditions are not met.

### GitHub Pages staging (2026-11-05)

| Item | Value |
|---|---|
| Pushed | `f5a1df4..1d5adec` to `origin/main`, fast-forward, no force; 34 commits, 175 files; secret, size and archive scan clean first |
| Workflow | "Deploy GitHub Pages preview" run 41962927706: completed, success, head `1d5adec943e672bdeffc2c525a2466f43dcfc036` |
| Preview | https://salar500.github.io/Toolzenhub/ |
| Content check | all 131 inventory URLs fetched live: status 200, title, canonical and `noindex` equal to the local `dist-ghpages/` build; `robots.txt` and `sitemap.xml` equal to the build. Four pages differ by carriage returns only (identical once stripped) |
| Browser check on the live site | 26 of 26 passed with system Chrome (Chromium engine) at desktop 1280x800 and an iPhone 13 emulation: home, a slider, Date Difference, JSON Formatter and Compare, the SQL lab (ATTACH leaves nothing behind), the Excel and Power BI labs, both new articles, Countdown, back/forward, mobile menu, no horizontal scroll. No console or network errors were recorded |
| Not tested | Firefox, Safari/WebKit, real phones, screen readers; most Time Tools and Developer Tools pages beyond the ones named; Image and PDF tools beyond their build and local specs |
| Production | Hostinger / toolzenhub.in NOT touched; the 2026-11-05 zip is not deployed. Final status: GITHUB-PREVIEW-VALIDATED |

### Fresh release archive (2026-11-05, not deployed)

| Item | Value |
|---|---|
| File | `C:\Users\DELL\Downloads\ToolZenHub-hostinger-dist-20261105-9d1c984.zip` |
| Source commit | `9d1c984` (working tree clean; `dist/` rebuilt by `npm run build:all` at that commit, base `/`, canonical `https://toolzenhub.in`) |
| Contents | 661 files (the whole of `dist/`), `index.html` at the root, forward-slash paths, no `.map`, `.spec.js` or `.env` files; every entry byte-identical to `dist/`; `zipfile.testzip()` clean |
| Size / SHA-256 | 6,683,584 bytes / `9312C56F60FC0AC90489F2C02D3ACE0660CAEF3D0F586D80F6D0FF5EF8E09F6B` |
| Note | a first attempt with PowerShell `Compress-Archive` wrote backslash separators, so it was discarded (this session's own file) and the zip was rebuilt with Python. Earlier archives were not touched |
| Regression behind it | Q3-17 and Q3-18 in `TEST_EXECUTION_LEDGER.md`. The full browser suite was NOT re-run on this HEAD; see "NOT RUN" there |
| Deployment | NOT DONE. Needs the owner's approval; Hostinger was not touched |

## State at 2026-11-04 (as first recorded, for `f5a1df4`)

| Item | State | Evidence |
|---|---|---|
| Branch / commit | `main` at `f5a1df4`, clean, `origin/main` equal (0 ahead, 0 behind) | `git rev-list --left-right --count origin/main...HEAD` |
| Production build (`dist/`, base `/`) | PASS at f5a1df4: 127 HTML pages, canonical `https://toolzenhub.in`, `index.html` at root, no `.map`, `.spec.js` or `.env` files found | Q3-1 |
| Preview build (`dist-ghpages/`, base `/Toolzenhub/`) | PASS at f5a1df4: 127 pages | Q3-1 |
| Static checks | links, assets, SEO, inventory pass on both bases | Q3-1 |
| Preview site | Reachable: `/`, a Pack 53 calculator, a Pack 53 article, its cover image, `sitemap.xml`, `robots.txt` return 200 | HTTP GET only; the Pages workflow run result was not read (`gh` unavailable), so "deployed by workflow" is NOT confirmed here |
| Hostinger package | `C:\Users\DELL\Downloads\ToolZenHub-hostinger-dist-20261103-1428.zip`, 610 files, 5.9 MB, SHA-256 `A12191702E2E228180B6A1EF09C9D77526A647FD3D560D9AE8FD387826FDBE42` (matches RELEASE-1). Every file exists in a fresh f5a1df4 `dist/` with the same size | Q3-1 |
| Recovery asset | `C:\Users\DELL\Downloads\ToolZenHub-backup-20261102-2311.zip` (240 MB, 2026-11-02). It predates Pack 53 and is a backup of the live site at that time; whether it still equals live production is NOT verified | file listing |
| Production deployment | NOT DONE; not authorised in this session; no credentials | |
| Live verification | NOT DONE | |

Status words: DEVELOPMENT COMPLETE, TESTING COMPLETE (at the checkpoint and scope in `TEST_EXECUTION_LEDGER.md`), PRODUCTION BUILD VERIFIED, GITHUB SYNCED. Not reached: PREVIEW VERIFIED IN A BROWSER, PRODUCTION DEPLOYED, LIVE VERIFICATION COMPLETE.

## Before production (checklist)

1. Owner completes the critical items in `MANUAL_QA_GUIDE.md` on the preview, on a phone.
2. Read the Pages workflow result for the f5a1df4 push (Actions tab) and confirm green.
3. Check live production now: download its current files or confirm the 2026-11-02 backup still matches; take a fresh backup if the site changed since.
4. Rebuild `dist/` if any commit lands after f5a1df4 and regenerate the zip and hash; deploy only that exact artifact, `index.html` at the zip root, without deleting unrelated hosting content (for example `.htaccess`, other sites).
5. Upload through the established Hostinger process, then verify live: home, one page per section, `sitemap.xml`, `robots.txt`, a 404, and a hard refresh on a deep link.
6. Record the deployment time, artifact hash and verification here.

## Rule changes

None.
