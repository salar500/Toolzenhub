# Production handoff: toolzenhub-production-3e5ce4cd.zip (2026-11-16)

The owner deploys this by hand. Nothing here has been uploaded, and Hostinger, DNS and `main` were not touched. Release records live in `docs/quality/RELEASE_LEDGER.md`; test evidence in `docs/site-audit-ledger.md` (phase "master prompt of 2026-11-15"). This package replaces `toolzenhub-production-ff74baf0.zip` and `toolzenhub-production-f994b41c.zip`, which are outdated.

## 1. The package

| Item | Value |
|---|---|
| File | `toolzenhub-production-3e5ce4cd.zip` |
| Location | `C:\Users\DELL\Documents\ToolZenHub-production-package\` |
| SHA-256 | `56589da8a5b5a369ec602b7816e0561e3cf91896354e30e55885e26793559ca6` |
| Size | 16,578,544 bytes (15.8 MB) |
| Entries | 1,304 files: 675 HTML pages, the assets, `.htaccess`, `robots.txt`, `sitemap.xml`, `favicon.svg`, `404.html` |
| Source | `3e5ce4cd` on `feature/unified-ecosystem-workspace`, built with `npm run build` from a clean tree |
| Built | 2026-11-16 |

Check the download before uploading (PowerShell): `Get-FileHash <path-to-zip> -Algorithm SHA256` must print the SHA-256 above.

What is new since `f994b41c`: the AI Directory (`/ai-tools/directory/`, shown as a tool card on the AI Tools page), the Photo Metadata Viewer and Remover (`/tools/image-metadata/`), "Learn and check" links on 49 tools and labs, the time-zone city and country search, lab exercise lists in number order, and the layout fixes (XIRR rows, calculator cards, footer gap, home spacing, timer finish sound, steady button hover). Details: `docs/site-audit-ledger.md`.

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

1. Upload `toolzenhub-production-3e5ce4cd.zip` to the web root with File Manager.
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

## 7. Test results on this code (all foreground, one worker)

- **Unit:** 3,987 tests, 3,983 passed, 0 failed, 4 skipped (structural).
- **subpath-desktop:** every spec file passes, including the axe accessibility scan and tablet layout of every page (1,348 tests) and the smoke test of every page (689).
- **subpath-mobile:** every spec file passes, including the same 1,348 and 689.
- **root-desktop (production paths):** 829 of 829 (140 portable tests and 689 smoke).
- **Visual:** desktop, mobile and tablet, light and dark: 145 baselines re-recorded only after each difference was compared with its old image; all differences trace to this release's intended changes or to the approved phone breadcrumb of `997990b0`.
- **SEO baseline and link crawl:** each is a single test longer than one foreground run on this laptop, and background runs are stopped by the system for low memory. Both were run with the specs' own checks in foreground chunks over every page: SEO facts unchanged on all 672 earlier pages except visible-text size on 54 (intended); the crawl visited all 678 entries with 0 failures, every link target answers 200, no orphan page. The two specs themselves were not run end to end (honest limitation, alternative evidence above).
- **Static:** URL inventory (674 live pages), links, assets with exact case, SEO, on both builds.

## 8. Known limitations

- `main` does not contain this release: production would be ahead of `main` until the branch is merged, which is a separate decision.
- Deferred, not part of this package: PDF to Images (a new dependency of about 1 MB, needs its own review), compress PDF, protect/unlock, OCR, WebP and HEIC metadata, theme palettes, saved lab progress. JSON Schema Validator stays unbuilt (a permission decision, recorded in its tool pack).
- Real-device checks (an Android phone, Safari/WebKit) were not done here; the browser tests use Chrome with phone and tablet emulation.
