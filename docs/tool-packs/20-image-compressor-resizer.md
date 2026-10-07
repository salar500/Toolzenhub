# Tool Pack 20: Image Compressor & Resizer (the first Image Tools tool)

Status: built and verified (Android and Safari gates still open, see below)      Base commit: 170ed31
Id and slug: `image-compressor-resizer` (route `/tools/image-compressor-resizer/`)
Section: **Image Tools** (`image-tools`, landing `/image-tools.html`), new in this pack, flat, no subcategory.
Evidence: the read-only feasibility spike that preceded this pack (measured in Chrome 154 only; Safari, Firefox and a real phone were not available).

## Does it earn its place?

Yes, narrowly. A photo is too big for a form, an email, a chat or a page, and the usual answer is a website that uploads it. Here the file never leaves the device, the dimensions are exact, the result is reported honestly (including when it got bigger), and "up to N KB" is available for the common form-upload job. It is **not** an editor, a converter suite or an AI tool.

## Section decision

New major section **Image Tools**. Not "Utilities" (a dumping ground that would overlap Developer Tools) and not several sections at once. One real tool is enough to open it: Developer Tools opened with one, the landing page is derived from the central metadata, and users looking for an image tool get a clear destination. No placeholders, no Coming Soon cards. Image Tools is flat; no subcategory. Only image tools belong here.

Hierarchy: Home → All Tools → Image Tools → Image Compressor & Resizer. Nothing under `/calculators/`.

## V1 scope (hard)

One image at a time. Input JPEG, PNG, WebP. Output: same format, JPEG (where safe), WebP (where this browser encodes it), PNG. Resize by width and height with an aspect lock and a short preset list. JPEG/WebP quality presets and a bounded quality control, and an approximate "up to N KB" mode. A scaled preview, honest before and after numbers, and a download.

**Excluded:** batch, HEIC/HEIF, GIF, AVIF, SVG, crop, rotate, flip, filters, annotations, AI anything, clipboard paste, history, accounts, any backend or upload, URL state, persistence of images, automatic Featured placement, a codec or image library dependency (a Cancel button was added after benchmarking, see the notes).

## Input rules

- **Type is decided by the file's bytes, never the name or the label.** JPEG `FF D8 FF`, PNG `89 50 4E 47 0D 0A 1A 0A`, WebP `RIFF....WEBP`. A PNG named `.jpg` is treated as a PNG (the browser decodes by content too). The browser's decode must also succeed; a file that sniffs as JPEG but will not decode fails cleanly.
- **Targeted refusals** by sniffing: HEIC/HEIF ("HEIC/HEIF isn't supported in this version. Export or save the image as JPEG, PNG or WebP first."), GIF ("GIF isn't supported because this tool does not preserve animation."), AVIF, SVG (text containing `<svg`; never rendered), anything else ("This file could not be decoded as a supported image.").
- One file only: a second file selected replaces the first completely; dropping several files is refused ("Please add one image at a time.").
- **Limits (guardrails, not targets):** 25 MB file; 40,000,000 input pixels; 16,384 px on an input side; output at most 8,192 px per side and 16,777,216 pixels. The file size is checked before anything is read; the pixel count is read from the file **header** (JPEG start-of-frame, PNG IHDR, WebP chunk) and checked **before the image is decoded**, so a 100-megapixel file is refused without allocating its bitmap; the decoded size is checked again after decode and the requested output size before any output canvas is allocated. Limits are lowered, never raised, if real-device testing shows them unsafe.

## Resize model

Width and height in whole pixels, at least 1, inside the output limits; text, empty, decimals, negatives, exponents (`1e3`), zero and infinity are refused with a message on the field. The aspect ratio is **locked by default**: changing the width sets the height to `round(width x originalHeight / originalWidth)` (at least 1) and the reverse. Unlocking is allowed with "Changing width and height independently may stretch the image." Sizes above the original are allowed only when the user types them, with "Enlarging an image does not create new detail." Presets: Original, 75%, 50%, Long side 1920, Long side 1280 (a long-side preset that would enlarge is disabled). Presets only fill the fields; nothing is processed until the button is pressed.

## Output formats and transparency

Only formats this browser can actually encode are offered. Support is detected by encoding a 1x1 canvas and checking the returned `blob.type` (browsers answer PNG when asked for a type they cannot encode). Same format is the default.

**Transparency.** JPEG is **disabled** for any image that may have transparency: "JPEG doesn't support transparency. Keep PNG or use WebP." Alpha is judged in two steps, neither of which scans a huge buffer on the main thread: (1) the file header decides "definitely none" (PNG colour type 0 or 2 or a palette without a `tRNS` chunk; WebP lossy without alpha; every JPEG) or "possible"; (2) for "possible", the worker scans the decoded image for any pixel with alpha under 255 in 256-row bands (a few megabytes at a time). Until that finishes JPEG stays disabled ("Checking transparency…"); a PNG with an alpha channel whose pixels are all opaque therefore gets JPEG back. As a last guard JPEG output is drawn over white, never black.

**PNG** has no meaningful quality here: the quality controls are hidden and the page says "PNG is lossless here; reduce dimensions or choose WebP/JPEG for smaller files." No "quality used" is shown for PNG. **JPEG and WebP** use a quality of 30 to 95 (default 80, never 100): presets High quality 90, Balanced 80, Smaller file 60, plus an Advanced slider; values are clamped. The helper text says "Higher values usually preserve more detail but may produce a larger file."; it never claims a savings percentage for a quality value.

## Target-size mode (JPEG and WebP only)

"Up to N KB" (whole KB, 1 KB = 1,024 bytes, 10 to 20,000) means "try to keep the output at or below N KB". It is a **bounded search** over the integer quality 30 to 95 with at most 8 encodes: try 95 (done if it already fits), try 30 (if even that does not fit, stop), then bisect. Encoder size is not strictly monotonic in quality, so the best valid candidate seen (the highest quality at or under the target) is kept. Dimensions come from the resize settings and are never changed by the search. Success shows the target, the actual size and the quality used; failure says "Couldn't get under N KB at these dimensions. Try smaller dimensions." and shows the smallest output reached (quality 30) without silently lowering quality below the floor. It never says "exactly".

## Orientation, metadata, colour

Decoding is `createImageBitmap(file)`, which applies EXIF orientation (all 8 values verified in Chrome in the feasibility spike); the output has the orientation baked in and no manual rotation exists. A fixture test covers orientation 6. Re-encoding through a canvas dropped planted EXIF text in JPEG, WebP and PNG in the spike and the tests here re-check it on the real path, so the page says "Re-encoding normally removes embedded camera metadata, such as location." (never "all" or "guaranteed"). Colour: the browser converts to sRGB while decoding and tags its JPEG output; this is not a colour-managed workflow and the page says so.

## Processing architecture

**Pure engine** (`image-engine.js`, no DOM): limits, sniffing and header parsing, alpha inspection, dimension and preset maths, output rules, quality and target search, file names, size wording, an operation tracker. **Pipeline** (`image-pipeline.js`): the decode, draw and encode steps, written against a small environment object (`createCanvas`, `toBlob`) so the same code runs in a Worker and on the main thread. **Worker** (`image-worker.js`, a module worker): receives `{ id, op, ... }` and returns `{ id, ok, ... }` or `{ id, ok: false, error: { code, message } }`; it holds no UI state. **UI** (`index.js`): file handling, controls, rendering, announcements, cleanup.

Two operations: `inspect` (decode once; return the oriented size, a small preview, and the alpha result) and `process` (decode, draw at the output size, close the bitmap, encode, and return the result Blob, size, format, quality used, target outcome, timings and a small preview of the output). The worker is used when `Worker`, `OffscreenCanvas` with a 2D context, `convertToBlob` and `createImageBitmap` all exist; otherwise, or if the worker cannot start, the main-thread path runs the identical pipeline. A real processing failure is shown, not retried.

## Memory lifecycle

Only the original `File` lives between runs. Every run: decode the original, draw to the output-size canvas, `bitmap.close()`, encode, shrink the canvas to 0x0, drop references. A run **always starts from the original**, never from the previous output (no generation loss). Previews are small (about 640 px) Blobs shown from object URLs; a 40 MP decode is never kept to show a thumbnail. Every object URL is revoked when it is replaced, on reset and when the page is torn down. A late result from an earlier operation is dropped (operation ids), including after a reset or a new file. Reset clears the file input, the previews, the result, the download link and the settings. 40 MP is a ceiling, not a target.

## UX

One column on a phone: Choose, Original (preview, size, dimensions, format), Settings (Resize, Output, Quality or Target), the **Compress image** button (never automatic), Result (preview, metrics, savings, Download), Reset. From 900 px the original and result previews sit beside the settings. A drop zone is an enhancement around the real file input and does not replace it. While processing, "Processing image…" is shown and the controls that would conflict are disabled.

**Result wording.** Smaller: "Reduced by X KB (Y%)" (less than 1% is "Reduced by less than 1%"). Larger: "Larger by X KB (Y%)" and the plain sentence "Output is X KB larger than the original.", with no success styling; the download stays available. Download name: a sanitised base name plus `-resized` (when the dimensions changed) or `-compressed`, and the extension of the **actual** encoded type; no path, no duplicated extension.

## Accessibility

A labelled file input, a keyboard-reachable drop zone, visible focus, labelled fields with errors linked by `aria-describedby`/`aria-invalid`, a named slider with its value, one polite announcement when processing starts and one when a result is ready, metrics as text (`dl`), a descriptive Download link, previews with alt text that carry no unique information, 44 px touch targets and 16 px inputs on phones.

## Privacy and security

No upload, no network request carrying the image, no storage, no URL state; tests prove it before the privacy sentence is shown. The file name and any text from the file are placed with `textContent`; SVG is refused, never rendered.

## Search and integration

Aliases: image compressor, compress image, image resizer, resize image, reduce image size, image size reducer, compress jpg, compress png, resize photo, compress image online. Present in Image Tools, All Tools and global search; absent from Calculator Categories, All Calculators, Loans, Time Tools and Developer Tools. No related tools. Featured Tools and Home copy unchanged (the section card comes from metadata). No articles, no imagery. SEO title "Image Compressor & Resizer | ToolZen Hub"; no "lossless", "no quality loss", "AI", "best" or savings promises.

## Verification plan and gates

Engine unit tests (header parsing is also compared with Python PIL's own reading of the fixtures); browser tests with small fixtures plus large images generated in the page; privacy, security, unsupported formats, corrupt files, stale results, repeated-processing memory checks, a main-thread fallback run (by hiding `OffscreenCanvas`); accessibility and three widths; section and search integration; sanity for the other three sections; benchmarks of the implementation. No full regression.

**Open gates (not done here):** a real Android phone with a gallery or camera photo, and Safari/WebKit. Neither was available; the tool feature-detects and the final report says so.

## Implementation notes

What was measured, and the deviations from the plan above. Measurements are from the built preview site in Chrome 154 on a 2-core Windows laptop (images generated in the page, JPEG at quality 0.8, 1,600 px output unless stated). They are **not** phone numbers.

**Deviations**
- **Cancel was added** (the spec said none unless measured). The worst case, "up to 1,000 KB" as WebP on a 40 MP source at the largest allowed output (16.7 MP), took 33.5 s here (8 encodes of about 4 s). Cancel is shown only while processing, terminates the worker (the next run starts a fresh one) and drops the answer; on the main-thread fallback the work cannot be stopped but its answer is dropped.
- **An image larger than the output limit starts at the largest size that fits** (for example 6000 x 4000 starts at 5016 x 3344, with a note), and presets that cannot be output are disabled; otherwise the default "original size" would be refused for anything above 16.7 MP.
- **Transparency is scanned inside `inspect`**, so the format list is correct as soon as the image is shown (no visible "checking" state). JPEG stays disabled for "possible" until the scan says "no".
- A file whose bytes are not recognisably an image at all gets "This file could not be decoded as a supported image." (not a separate "unsupported" message).
- Fixtures (about 300 KB) are made by `tests/fixtures/images/make-fixtures.py` with Pillow, and `expected.json` records what Pillow itself reads; the engine's header parsing is compared with it.

**Implementation benchmarks** (click on Compress image to the result being ready; worker unless stated)

| Input | Choose to ready | Compress to 1,600 px wide | Decode / draw / encode |
|---|---|---|---|
| 1 MP (1280 x 800) | 142 ms | 226 ms | 19 / 0 / 176 ms |
| 4 MP (2400 x 1700) | 150 ms | 225 ms | 51 / 0 / 143 ms |
| 12 MP (4000 x 3000) | 290 ms | 394 ms | 128 / 0 / 220 ms |
| 24 MP (6000 x 4000) | 860 ms | 1,040 ms | 282 / 2 / 566 ms |
| 40 MP, the limit (8000 x 5000) | 1,110 ms | 1,010 ms | 393 / 0 / 546 ms |
| 40 MP at the default (largest allowed) output, 5181 x 3238 | 1,209 ms | 1,731 ms | 427 / 2 / 1,175 ms |

"Up to N KB" (12 MP to 1,600 px): JPEG up to 200 KB 845 ms (8 encodes, quality 87, 187 KB); WebP up to 200 KB 4.3 s (8 encodes, quality 92, 180 KB); JPEG up to 10 KB (unreachable) 428 ms (2 encodes, floor quality 30, 33 KB). Main-thread fallback: 12 MP 576 ms (main thread blocked up to 243 ms), 24 MP 680 ms (blocked up to 384 ms), JPEG up to 200 KB 775 ms. With the worker the main thread's longest gap was 13 to 37 ms in most runs, with three runs at 131 to 257 ms that were not isolated (the first run in a page also starts the worker).

**Memory** (renderer working set, MB; the worker shares the renderer; the first figures include the generated test image, so read the differences): baseline 86; 12 MP chosen 224; peak while processing 315; after 12 repeated runs 328 (14 MB more than after the first run); after Reset 328 (the allocator keeps pages; no object URL, bitmap or canvas is retained, see the browser tests); 40 MP chosen 300, peak while processing **597**, after 328. So the 40 MP limit costs roughly **+300 MB at peak** (about 7.5 bytes per pixel), which a desktop absorbs and a low-memory phone may not. 40 MP is kept as the brief set it, **but the Android gate must include a 24 MP or larger photo, and if it struggles the limit is one constant (`MAX_INPUT_PIXELS`) to lower** (24 MP would cost about +180 MB).

**Open gates:** a real Android phone with a real gallery or camera photo (not done); Safari/WebKit (not available here; the tool feature-detects the worker, `OffscreenCanvas`, `createImageBitmap` and each output type, and Safari is recorded as "pre-production compatibility verification still required").
