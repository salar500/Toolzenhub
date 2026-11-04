# Manual QA guide

Preview base: `https://salar500.github.io/Toolzenhub` (called `BASE`). Do this on the preview, not production. Priority C = critical, O = optional. D = desktop, M = phone. Report a failure with the URL, device, browser and a screenshot. Catalogue row numbers refer to `MASTER_REGRESSION_CATALOG.md`.

Only scenarios that automation cannot judge are here. Unchanged pages need no manual pass.

| # | Row | Page | Steps | Expected | Failure looks like | Pri | D/M |
|---|---|---|---|---|---|---|---|
| 1 | 3 | `BASE/calculators/age/` | Tap the date field | One calendar icon, one picker | Two icons side by side, or a clipped icon | C | D+M, Chrome and Safari |
| 2 | 2 | `BASE/calculators/loan-comparison/` | Open it on mobile data, watch the sliders | Sliders appear with the form, no jump | Sliders pop in late, or the layout shifts | C | M |
| 3 | 1 | EMI `BASE/calculators/emi/` | Drag the rate slider to both ends, type 30 in rate | Number follows slider; slider pins at the end; thumb styled before first touch | Number and slider disagree, unstyled thumb | C | D+M |
| 4 | 7, 8 | `BASE/tools/countdown-timer/` | Set 1 minute, run, let it finish | Reminder sounds, can be stopped and muted | No sound, cannot stop, sound too harsh | C | D+M (phones may block audio until a tap) |
| 5 | 8 | Stopwatch | Start, lap, stop with sound on | Clear, short sounds, mute works | Silence, or sound after mute | O | D+M |
| 6 | 5, 6 | Countdown | Switch 12/24-hour and change the timezone | Target time reads correctly in both | Wrong hour, AM/PM missing | C | D |
| 7 | 9, 10 | Meeting Planner and Time Zone Converter | Plan a call between Mumbai and New York | Result is understandable without help | You cannot tell which day or hour applies | C | D+M |
| 8 | 11-15 | JSON Formatter and Compare | Paste invalid JSON, then a 5,000-line document | Error names line and column; suggestion is offered, input unchanged; scrolling stays smooth | Vague error, text silently rewritten, freeze | C | D |
| 9 | 16-18 | One tool in each sidebar category (PDF, Image, Calculators, Time, Developer, Labs) | Open it from the sidebar | Its category and item show as active | Wrong or no highlight | C | D |
| 10 | 22, 23 | All Tools page and header search | Type `emi`, clear, type nonsense, clear | Results match, "no results" message, full list returns on clear | List stays filtered after clearing | C | D+M |
| 11 | 24 | Homepage | Load on a slow connection | Hero appears without a broken frame; readable text | Empty box, text over low-contrast image | O | D+M |
| 12 | 25 | Any category page | Resize to 390 and 820 px | Nothing overlaps or scrolls sideways | Overflow, crowded controls | C | M |
| 13 | 27 | Merge PDF, Split PDF, Photos to PDF | Use two real PDFs and some photos | Downloaded file opens in your PDF viewer with the right pages | Corrupt file, wrong order | C | D+M |
| 14 | 27 | Image Compressor | Use a 5 MB photo | Smaller file, still looks right, downloads | Blur, wrong size, no download | C | D+M |
| 15 | 21 | Three newest articles and two older ones | Scroll each | Images show, links work | Broken image icon | O | D+M |
| 16 | 20 | Articles list | Look for SIP and Tax strategy items | They are shown as Coming Soon and are not clickable | A clickable empty page | O | D |

Real-device status: no Android, iOS, Safari or Firefox testing has been done by the automated suite. Items 1, 2, 4, 12 on a phone are the most valuable.
