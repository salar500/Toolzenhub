# Tool Pack 57: Photo Metadata Viewer and Remover

Status: built 2026-11-15 under the owner's master prompt of that day (image expansion "only reliable, useful additions"). Section: Image Tools. Route `/tools/image-metadata/`.

## The job and why it earns its place (rules 1.3, 1.4, 14)

1. **Recurring pain.** Before posting or sending a photo, people want to know whether it gives away where it was taken, on which phone, and when, and to remove that without spoiling the picture. The Image Compressor already says "check the downloaded file if that matters to you" and the site had no way to check.
2. **AI era and browser.** The answer must be exact (which blocks are in this file, which were removed), the photo is private by nature, and the work is local and instant. An assistant would need the photo uploaded.
3. **Different job (rule 1.6).** The compressor re-encodes (lossy) and removes metadata as a side effect, unverified. This tool shows what a file carries and removes it **without re-encoding**: the picture data is copied byte for byte.
4. **Where.** Image Tools, `/tools/image-metadata/`. Not created: a category, a header item, a Featured entry, an article.

## Contract

- **Input:** JPEG and PNG files, one or several (at most 20, each at most 25 MB). Other types (WebP, HEIC, GIF, AVIF) are refused with a message naming the supported types; a file that is not what its extension says is read by its bytes.
- **View** (per file): location (latitude, longitude, altitude, as decimal degrees), camera make and model, software, date and time, date taken, orientation, and the other metadata blocks found: XMP, IPTC, comment, thumbnails, multi-picture index, data after the picture (JPEG); text chunks with their keywords, eXIf, tIME (PNG). Values are shown as text, never as HTML (rule 8.7). Coordinates are not linked to any map service (nothing leaves the page).
- **Remove (JPEG):** `stripJpegMetadata` (shared with Photos to PDF): removes Exif and XMP (APP1), IPTC and vendor segments, comments, thumbnails, the MPF index and trailing data; keeps the picture data, tables, JFIF header, the colour profile (ICC, APP2) and Adobe (APP14). **Orientation:** a photo stored sideways (orientation 2 to 8) would display sideways once Exif is gone, so by default a 34-byte Exif block with only the orientation is put back (an option turns this off).
- **Remove (PNG):** removes tEXt, iTXt, zTXt, eXIf and tIME chunks; keeps every critical chunk and the colour and density chunks (iCCP, sRGB, gAMA, cHRM, sBIT, pHYs). Other chunks are kept. Each kept chunk is copied with its own CRC.
- **Verify:** every output is read again with the same reader; the result lists what was removed and confirms no location, camera, date or text remains. A file that cannot be read safely is never offered as "cleaned".
- **Output:** a download per file named `<name>-no-metadata.<ext>`; nothing is uploaded or stored.
- **Not claimed:** that a photo is anonymous. It can still show a face, a sign or a place in what it draws; the page says so.

## Deliberate exclusions

WebP and HEIC (container rewriting, deferred until it can be verified as carefully); editing individual fields; batch ZIP download (no archive dependency); map links.

## Tests

- Unit (`tests/unit/image-metadata.test.mjs`): the reader against Pillow's readings of synthetic fixtures (`tests/fixtures/images/make-image-metadata-fixtures.py`, `md-expected.json`); JPEG and PNG removal; the orientation block; refusal of truncated and unsupported files; nothing identifying remains after removal (marker strings absent).
- Browser (`tests/browser/image-metadata.spec.js`): upload, findings, download, the downloaded file decodes to the same pixels as the original (the browser's own decoder as the oracle) and shows upright.
