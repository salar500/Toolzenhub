# Release ledger

Rules: `docs/product-decision-rules.md` section 11. GitHub Pages is the development preview; Hostinger production (`toolzenhub.in`) is manual and was not touched by any record here.

## Update after the Q3 cycle (2026-11-04)

Eight local commits after `f5a1df4` (`b342344` to `b714e57`, plus the closing records commit). Nothing is pushed: `origin/main` is behind HEAD. The Hostinger zip and its hash below were built from `f5a1df4` and no longer match the code, so they must NOT be deployed; rebuild `dist/` and regenerate the zip and hash at release time. The preview site still shows `f5a1df4`. Full regression was not run; the checks that were run are listed per change in `TEST_EXECUTION_LEDGER.md` (Q3-2 to Q3-9). A release checkpoint (unit suite, desktop and mobile browser groups, axe sweeps) is due before any push to the preview of this batch or any deployment.

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
