# Production handoff: toolzenhub-production-f994b41c.zip (2026-11-14)

The owner deploys this by hand. Nothing here has been uploaded, and Hostinger, DNS and `main` were not touched. Release records live in `docs/quality/RELEASE_LEDGER.md`; test evidence in `docs/site-audit-ledger.md` (Batches 26 and 27).

## 1. The package

| Item | Value |
|---|---|
| File | `toolzenhub-production-f994b41c.zip` |
| Location | `C:\Users\DELL\Documents\ToolZenHub-production-package\` |
| SHA-256 | `c809ab2b21baeb5261f409a19a67ee2f1bbc81effb40e638e93e569f26ada93d` |
| Size | 16,598,797 bytes (16.6 MB) |
| Entries | 1,297 files: 673 HTML pages, the assets, `.htaccess`, `robots.txt`, `sitemap.xml`, `favicon.svg`, `404.html` |
| Source | `f994b41c` on `feature/unified-ecosystem-workspace` (application code identical to `997990b0`), built with `npm run build` from a clean tree |
| Built | 2026-11-14 19:36 IST |

Check the download before uploading (PowerShell): `Get-FileHash <path-to-zip> -Algorithm SHA256` must print the SHA-256 above.

## 2. What was verified on this package

- Integrity: `zipfile` test clean; every entry byte-identical to `dist/`; forward-slash paths; `index.html` and `.htaccess` at the top level, no `dist/` folder prefix.
- Production content: all 673 pages carry a canonical on `https://toolzenhub.in/`; no page links into `/Toolzenhub/`; `sitemap.xml` lists 671 URLs, all on `https://toolzenhub.in/`, each with a file in the package; `robots.txt` allows everything and names `https://toolzenhub.in/sitemap.xml`. The only `/Toolzenhub/` and `github.io` strings are the scripts' run-time base-path detection and the public "report an issue" links to the GitHub repository (two calculator pages).
- No secrets or development files: no `.map`, test, `.env` or log file; the only "password" strings are lesson sample code, the practice shop's made-up `example.com` accounts and the URL parser's field names.
- Static checks on this build: URL inventory (672 live pages), links, assets with exact case, SEO, all passed.
- Browser smoke test against this exact build served from the root: 11 representative pages (home, All Tools, EMI, JSON Formatter, Merge PDF, Image Compressor, World Clock, SQL Practice Lab, Prompt Builder, a home-loan article, an AI article) at 1280 and 390 px: status 200, a heading, a production canonical, no console error, no horizontal overflow; an unknown URL shows the site's 404 page; the theme toggle switches and survives a reload.
- Full test projects on this application code: see section 7.

## 3. Before you start

1. **Confirm the web root.** On Hostinger shared hosting the site's files are normally in `public_html` (hPanel, File Manager). Confirm which folder `toolzenhub.in` serves before changing anything. (Not verified from here: there is no Hostinger access in this environment.)
2. **Back up the live site.** In File Manager select everything in the web root and compress it to one archive, then download it, or use hPanel's own Backups page if your plan has it. Keep the archive until the new site has been checked. Note the date in the archive's name.
3. **Look at the live `.htaccess` first.** The package brings its own `.htaccess` (the site's 404 page, and the `.mjs` and `.wasm` types that the Python and SQL lessons need). If the live file holds lines this one does not (for example an HTTPS redirect or rules added by Hostinger), keep those lines and add the package's lines below them; do not lose either set.

## 4. Replace the site

1. Upload `toolzenhub-production-f994b41c.zip` to the web root with File Manager.
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
- [ ] One article opens with its image and related links.
- [ ] The moon/sun button switches to dark and back, and stays after a reload.
- [ ] On a phone: the Menu bar opens the drawer, nothing scrolls sideways.
- [ ] A made-up address such as `https://toolzenhub.in/nothing-here/` shows the site's own "Page not found".
- [ ] Browser console (F12) on the home page shows no red errors.
- [ ] View source of the home page: `<link rel="canonical" href="https://toolzenhub.in/">`; `https://toolzenhub.in/sitemap.xml` and `/robots.txt` open.

## 6. Roll back

If a check fails and cannot be fixed at once: remove the new files from the web root, extract your backup archive (section 3, step 2) back into it, restore the old `.htaccess`, purge the cache, and open the home page to confirm the old site is back. Nothing outside the web root was changed by the steps above, so nothing else needs undoing.

## 7. Known limitations of this release candidate

- **Browser link crawl not passed on this code.** The crawl (`tests/browser/links.spec.js`, one test that opens all 680 pages, about 17 minutes) timed out twice at its old budget after about 89 % of the pages (1.65 to 1.70 s a page on the 4 GB laptop against 1.5 s; no page hung), and the run with the corrected budget was stopped by the system for low memory. Links are covered meanwhile by the static link check (passed on this build), the 4,104-test desktop and 4,053-test mobile projects and the root-desktop project, all of which navigate the site. Running the crawl to completion needs a machine with more free memory, or Claude Code started with `CLAUDE_CODE_DISABLE_BG_SHELL_PRESSURE_REAP=1`.
- **Test results on this application code:** unit 3,967 of 3,971 passed, 0 failed, 4 skipped; `subpath-desktop` 4,073 passed, 28 skipped, 3 failed (two fixed and re-run; one is the crawl); `subpath-mobile` 4,025 passed, 27 skipped, 1 failed (fixed and re-run; the crawl was not run there); `root-desktop` 827 of 828 passed, the one failure being the crawl; dark visuals 51 passed, 3 skipped by design; light visuals as in Batch 26.
- `main` does not contain this release: production would be ahead of `main` until the branch is merged, which is a separate decision.
- JSON Schema Validator stays unbuilt (a permission decision, recorded in its tool pack).
