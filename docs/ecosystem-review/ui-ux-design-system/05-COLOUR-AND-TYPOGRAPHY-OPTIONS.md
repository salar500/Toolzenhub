# 05 Colour and typography options

**PROPOSED — NOT APPROVED FOR IMPLEMENTATION**

UI/UX Design System 2.0, Prompt 1 of 3. Written 2026-10-29. All contrast ratios were **computed** with the WCAG 2.x relative-luminance formula by a script run this session (VERIFIED); they are numbers, not a claim of full WCAG conformance (doc 14). Rendered applications are in `concepts/design-concepts.html` (switch the four tabs).

## Colour roles and HEX values (light mode)

| Role | A Emerald | B Blue and Slate | **C Neutral + Indigo** | D Teal and Ink |
| --- | --- | --- | --- | --- |
| Page background | `#f6f8f7` | `#f8fafc` | `#fafaf9` | `#f5f7f7` |
| Card surface | `#ffffff` | `#ffffff` | `#ffffff` | `#ffffff` |
| Elevated surface | `#ffffff` + shadow | same | same | same |
| Divider | `#e1e8e4` | `#e2e8f0` | `#e7e5e4` | `#dde5e6` |
| Control border (3:1) | `#7a8c84` | `#64748b` | `#78716c` | `#6b8285` |
| Text | `#0f1a16` | `#0f172a` | `#1c1917` | `#0b1f23` |
| Muted text | `#475a52` | `#475569` | `#57534e` | `#44585c` |
| Primary (button fill) | `#047857` | `#1d4ed8` | `#1c1917` | `#0f766e` |
| Primary hover | `#065f46` | `#1e40af` | `#292524` | `#115e59` |
| Primary soft (selected tint) | `#ecfdf5` | `#eff6ff` | `#f5f5f4` | `#f0fdfa` |
| Accent (eyebrows, small emphasis) | `#b45309` | `#0e7490` | `#4338ca` | `#b45309` |
| Link | `#047857` | `#1d4ed8` | `#4338ca` | `#0f766e` |
| Focus ring (2 px) | `#047857` | `#1d4ed8` | `#4338ca` | `#0f766e` |
| Success | `#166534` | `#166534` | `#166534` | `#15803d` |
| Error | `#b42318` | `#b91c1c` | `#b91c1c` | `#b91c1c` |
| Warning | `#92400e` | `#92400e` | `#92400e` | `#92400e` |
| Info | `#1d4ed8` | `#1d4ed8` | `#4338ca` | `#0369a1` |
| Disabled (fill / text; exempt from contrast, must look unavailable) | `#eaecf0` / `#98a2b3` | `#e2e8f0` / `#94a3b8` | `#e7e5e4` / `#a8a29e` | `#e4eaea` / `#94a3a6` |
| Footer surface | `#0f1a16` | `#0f172a` | `#1c1917` | `#0b1f23` |

Success, error and warning shades are the same family across options so state meaning does not depend on the brand. Info in C is the accent (indigo) by design: info and link share a hue but never a shape (info is always an icon plus bold lead word).

## Measured contrast (all pairs against the stated surface)

Targets: text 4.5:1, control borders and focus rings 3:1 (WCAG 1.4.3 and 1.4.11; rulebook 7.3).

| Pair | A | B | **C** | D |
| --- | --- | --- | --- | --- |
| Text on card | 17.80 | 17.85 | 17.49 | 17.01 |
| Text on page background | 16.69 | 17.06 | 16.74 | 15.82 |
| Muted on card | 7.36 | 7.58 | 7.63 | 7.51 |
| Muted on page background | 6.90 | 7.24 | 7.30 | 6.98 |
| Primary button label (white on primary) | 5.48 | 6.70 | 17.49 | 5.47 |
| Primary button label on hover | 7.68 | 8.72 | 15.17 | 7.58 |
| Link on card / on page background | 5.48 / 5.14 | 6.70 / 6.41 | 7.90 / 7.57 | 5.47 / 5.09 |
| Accent (eyebrow) on card | 5.02 | 5.36 | 7.90 | 5.02 |
| Success / error / warning / info on card | 7.13 / 6.57 / 7.09 / 6.70 | 7.13 / 6.47 / 7.09 / 6.70 | 7.13 / 6.47 / 7.09 / 7.90 | 5.02 / 6.47 / 7.09 / 5.93 |
| Control border on card | 3.55 | 4.76 | 4.80 | 4.07 |
| Focus ring on card / on page background | 5.48 / 5.14 | 6.70 / 6.41 | 7.90 / 7.57 | 5.47 / 5.09 |

All 16 checks pass for each option (80 of 80). Passing numbers do not prove the finished pages pass: every real surface (tinted cards, selected states, the footer) is checked at the integration checkpoint (QA-01).

For comparison (VERIFIED, computed from today's CSS): brand green text on white **3.43**; brand green on `#f9fafb` **3.29**; white on action green `#087f47` 5.08 (button label passes); `#667085` on `#f9fafb` 4.76; form border `#d0d5dd` on white **1.47** (below 3:1); white on the favicon teal `#14B8A6` **2.49**.

## Realistic component applications

Rendered with real content in `concepts/design-concepts.html`: header and active link; home search; section cards with counts; All Tools rail and tool cards; EMI inputs and a result ("₹8,678 a month", total interest ₹10,82,776); JSON Formatter with primary and secondary buttons and a valid-JSON alert; mobile drawer and section chips; every button state; inline error with an icon and words; success, warning and info alerts; a Practice Lab verdict; a flashcard reveal; the footer. The render was checked for overflow at 1280 px (none) and for script errors (none).

Rules that apply to every option:

1. **Primary action.** A filled primary button; there is one per region. In C it is near-black, so the page's only strong colour is the accent and states.
2. **Secondary action.** Outlined with the 3:1 control border and an ink label. Reset, Copy and Download are secondary and **must not use the disabled pair** (IX-02).
3. **Links.** The link colour plus an underline in running text; in lists and cards, underline on hover and focus and a visible focus ring. Colour alone never marks a link inside a paragraph.
4. **Selected state.** Soft tint plus a 1.5 px primary border plus a check mark or text, never colour alone.
5. **No gradient** on surfaces or buttons. At most one subtle tint behind the hero, and none in C. No saturated large fills; the footer is the only dark band.

## Light and dark mode

- **Light mode** is the only mode in the first programme.
- **Dark mode is not recommended now (DEFER, BR-08).** Reasons: it is not a requirement; every shared and tool stylesheet would need re-checking with a visual baseline per page (rulebook 10.5); a persisted toggle conflicts with rulebook 7.7, and an automatic `prefers-color-scheme` switch would double the baseline set on a machine limited to one worker.
- A dark token set for Option C was **validated now** so a later phase starts from known-good values: page `#12110f`, card `#1c1a18`, divider `#2e2b28`, control border `#8c857f`, text `#f5f5f4`, muted `#b5aea8`, primary `#f5f5f4` with label `#1c1917`, accent and link `#a5b4fc`, success `#86efac`, error `#fca5a5`, warning `#fcd34d`. Measured: text 15.90 to 17.30, muted 7.92 to 8.61, button label 16.03, link 8.70 to 9.47, control border 4.77, focus ring 8.70. All pass. It is a proposal only.

## Typography

### Current state (VERIFIED)

Inter (Google Fonts, weights 300 to 800 on most pages) for content; Georgia for header and navigation; Times (browser default) on Privacy, Terms and Disclaimer, which load no font and no reset; Consolas/ui-monospace for code. Sizes come from `--font-xs…--font-4xl` tokens. 18 of the 20 sampled pages contact `fonts.googleapis.com` and `fonts.gstatic.com`.

### Options

| Option | Description | Cost | Verdict |
| --- | --- | --- | --- |
| T1 Keep Google-hosted Inter | status quo | two third-party requests per page; render-blocking stylesheet; a request to Google not disclosed on the Privacy page; no control of caching | Rejected: against the privacy and performance posture (rulebook 7.4, 8.8) |
| **T2 Self-host Inter (variable, Latin subset including U+20B9 ₹), system fallback with size-adjust** | one font file served from the same origin | one file; size to be measured; licence to be checked at implementation (Inter is distributed under the SIL Open Font License, CLAIMED from general knowledge, NOT verified here) | **Recommended** |
| T3 System font stack only | `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`; no font request | zero bytes, zero shift; the look differs per device; the rupee sign and tabular numerals depend on the OS font | Fallback if T2 exceeds the 70 KB budget or the licence check fails |
| T4 Add a display or serif heading font | brand voice | extra file and shift | Rejected: not justified; the Georgia header is the inconsistency to remove |

### Recommended system (T2)

| Use | Specification |
| --- | --- |
| Family | `Inter` (self-hosted variable) then `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`; `font-display: swap`; fallback face with `size-adjust`/`ascent-override` so swap does not shift layout |
| Weights | 400, 500, 600, 700 (drop 300 and 800: neither is needed) |
| Monospace | `ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace`, 14 px, line-height 1.5; no web font |
| Scale | 12 / 14 / 16 / 18 / 20 / 24 / 30 / 36 / 44 px (0.75 to 2.75 rem) |
| Body | 16 px (never below 16 px in a control, to avoid focus zoom on iOS); line-height 1.6; articles 18 px / 1.7 |
| Headings | h1 `clamp(2rem, 1.4rem + 2vw, 2.75rem)` weight 700 line-height 1.15 letter-spacing -0.02em; h2 1.5 rem; h3 1.125 rem; weight 600 to 700 |
| Eyebrow | 12 px, weight 700, uppercase, +0.08 em; the only all-caps style |
| Numbers | `font-variant-numeric: tabular-nums` on results, clocks, tables; the headline result is 2.25 rem weight 700; Indian digit grouping is produced by the existing formatter, not by CSS |
| Code readability | monospace at 14 px, ligatures off, wrap off inside editors with horizontal scroll in-region |
| Unicode | Latin plus ₹; Devanagari is not currently content; if added, rely on the system font for it |
| Budget | at most 70 KB transferred; zero third-party font requests |

Performance cost of T2 is **UNKNOWN until measured** in UI-1 (QA-03). If the measured file exceeds the budget, T3 is the decision without further approval.
