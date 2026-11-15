# Production handoff: toolzenhub-production-ff74baf0.zip (2026-11-15)

The owner deploys this by hand. Nothing here has been uploaded, and Hostinger, DNS and `main` were not touched. Release records live in `docs/quality/RELEASE_LEDGER.md`; test evidence in `docs/site-audit-ledger.md` (phase "master prompt of 2026-11-15"). This package replaces `toolzenhub-production-f994b41c.zip`, which is outdated.

## 1. The package

| Item | Value |
|---|---|
| File | `toolzenhub-production-ff74baf0.zip` |
| Location | `C:\Users\DELL\Documents\ToolZenHub-production-package\` |
| SHA-256 | `daf13ee0d97ff7e34631c32b19e7f5499e216183ef4504e38f3e2b4977d022c0` |
| Size | 16,578,682 bytes (15.8 MB) |
| Entries | 1,304 files: 675 HTML pages, the assets, `.htaccess`, `robots.txt`, `sitemap.xml`, `favicon.svg`, `404.html` |
| Source | `ff74baf0` on `feature/unified-ecosystem-workspace`, built with `npm run build` from a clean tree |
| Built | 2026-11-15 |

Check the download before uploading (PowerShell): `Get-FileHash <path-to-zip> -Algorithm SHA256` must print the SHA-256 above.

What is new since `f994b41c`: the AI products directory (`/ai-tools/directory/`), the Photo Metadata Viewer and Remover (`/tools/image-metadata/`), "Learn and check" links on 49 tools and labs, the time-zone city and country search, lab exercise lists in number order, and the layout fixes (XIRR rows, calculator cards, footer gap, home spacing, timer finish sound, button hover). Details: `docs/site-audit-ledger.md`.

## 2. What was verified on this package

- Integrity: `zipfile` test clean; every entry byte-identical to `dist/`; forward-slash paths; `index.html` and `.htaccess` at the top level, no `dist/` folder prefix.
- Production content: every page except the practice shop (`/practice-labs/shoplite/`, `noindex, nofollow` by design) carries a canonical on `https://toolzenhub.in/`; no page links into `/Toolzenhub/`; `sitemap.xml` lists 673 URLs, all on `https://toolzenhub.in/`, each with a file in the package; `robots.txt` names `https://toolzenhub.in/sitemap.xml`. The only `github.io` strings are the public "report an issue" links on two calculator pages.
- No secrets or development files: no `.map`, `.env`, key, test-result or `node_modules` file.
- Static checks on this code: URL inventory (674 live pages), links, assets with exact case, SEO, all passed on both builds.
- Browser smoke test against this exact build served from the root: 13 pages (home, All Tools, EMI, XIRR, JSON Formatter, Merge PDF, Image Compressor, Photo Metadata, World Clock, SQL Practice Lab, Prompt Builder, the AI directory, an article) at 1280 and 390 px: status 200, a heading, a production canonical, no console error, no horizontal overflow; the theme toggle survives a reload.
- Tests on this code: see section 7.

## 3. Before you start

1. **Confirm the web root.** On Hostinger shared hosting the site's files are normally in `public_html` (hPanel, File Manager). Confirm which folder `toolzenhub.in` serves before changing anything. (Not verified from here: there is no Hostinger access in this environment.)
2. **Back up the live site.** In File Manager select everything in the web root and compress it to one archive, then download it, or use hPanel's own Backups page if your plan has it. Keep the archive until the new site has been checked. Note the date in the archive's name.
3. **Look at the live `.htaccess` first.** The package brings its own `.htaccess` (the site's 404 page, and the `.mjs` and `.wasm` types that the Python and SQL lessons need). If the live file holds lines this one does not (for example an HTTPS redirect or rules added by Hostinger), keep those lines and add the package's lines below them; do not lose either set.

## 4. Replace the site

1. Upload `toolzenhub-production-ff74baf0.zip` to the web root with File Manager.
2. Remove the old site files from the web root (they are in your backup), keeping anything that is not the site: the `.htaccess` you are merging, `.well-known` if present, and any other folder you know belongs to something else. Removing the old files avoids leftovers from the previous release, which had fewer pages.
3. Extract the zip **into the web root itself**. Afterwards `index.html`, `assets/`, `tools/`, `calculators/`, `practice-labs/`, `sitemap.xml` and `robots.txt` must sit directly in the web root, not inside an extra folder.
4. Put the merged `.htaccess` in place (section 3, step 3).
5. Delete the uploaded zip from the server.
6. If Hostinger's cache (LiteSpeed or CDN) is on, purge it in hPanel so visitors get the new files.

## 5. Check it (about 15 minutes)

Open each in a normal and in a private window; on a phone for the last few.

- [ ] `https://toolzenhub.in/` opens; header and footer links work.
- [ ] All Tools, Calculators, Time Tools, Developer Tools, Image Tools, PDF Tools, Practice Labs and AI Tools open from the header or footer.
- [ ] Search on All Tools finds "emi" and the result opens.
- [ ] EMI Calculator: change the loan amount and the result updates.
- [ ] JSON Formatter: paste `{"a":1}` and format it.
- [ ] Merge PDF or Image Compressor: choose a file and download a result.
- [ ] World Clock or Countdown Timer shows and updates the time.
- [ ] SQL Practice Lab: run the first exercise's query and see a result table.
- [ ] Prompt Builder: fill two fields and copy the prompt.
- [ ] AI products directory (`/ai-tools/directory/`): choose QA testers and the list narrows; an Official site link opens in a new tab.
- [ ] Photo Metadata Viewer: choose a phone photo and see what it carries; Remove metadata and download the copy.
- [ ] Time Zone Converter: type "japan" in Add a time zone and Tokyo is offered.
- [ ] One article opens with its image and related links.
- [ ] The moon/sun button switches to dark and back, and stays after a reload.
- [ ] On a phone: the Menu bar opens the drawer, nothing scrolls sideways.
- [ ] A made-up address such as `https://toolzenhub.in/nothing-here/` shows the site's own "Page not found".
- [ ] Browser console (F12) on the home page shows no red errors.
- [ ] View source of the home page: `<link rel="canonical" href="https://toolzenhub.in/">`; `https://toolzenhub.in/sitemap.xml` and `/robots.txt` open.

## 6. Roll back

If a check fails and cannot be fixed at once: remove the new files from the web root, extract your backup archive (section 3, step 2) back into it, restore the old `.htaccess`, purge the cache, and open the home page to confirm the old site is back. Nothing outside the web root was changed by the steps above, so nothing else needs undoing.

## 7. Known limitations of this release candidate

- **The full browser regression is incomplete on this code.** The sequential `subpath-desktop` run was stopped by the system for low memory after 4 of 22 batches (447 passed, 2 failed; both failures were caused by this phase, fixed in `ff74baf0` and their files re-run, 52 of 52). `subpath-mobile`, `root-desktop`, the visual projects and the browser link crawl were NOT run on this code. Instead, every spec touched by this phase was run and passes (time-zone converter 45, lab workspace 18 desktop and mobile, lab specs 142, Test Design Lab 21, image metadata 12 desktop and mobile, Image Tools and navigation counts 25, base64 and wide tables 52), with static checks and the root smoke test above. Visual baselines of the home page, calculators and labs are expected to differ (intended layout changes) and were not re-recorded. Finishing the regression needs more free memory, or Claude Code started with `CLAUDE_CODE_DISABLE_BG_SHELL_PRESSURE_REAP=1`.
- **Unit tests:** 3,987 tests, 3,980 passed, 4 skipped, 3 failed on deliberate pins of the new tool and page; those were updated and their files pass 41 of 41.
- `main` does not contain this release: production would be ahead of `main` until the branch is merged, which is a separate decision.
- Deferred, not part of this package: PDF to Images (a new dependency of about 1 MB, needs its own review), compress PDF, protect/unlock, OCR, WebP and HEIC metadata, theme palettes, saved lab progress. JSON Schema Validator stays unbuilt (a permission decision, recorded in its tool pack).
