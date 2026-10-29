# 09 Mobile navigation research

**PROPOSED — NOT APPROVED FOR IMPLEMENTATION**

UI/UX Design System 2.0, Prompt 1 of 3. Written 2026-10-29.

## Current behaviour (VERIFIED on the live preview at 390x844, Chrome)

| Aspect | Result |
| --- | --- |
| Menu button | `<button aria-label="Open navigation menu" aria-expanded="false">`, **40 x 40 px** (measured), below the 44 px control height in rulebook 7.2; `aria-controls="mobile-navigation"` |
| Open panel | a plain list of four links under the header; no backdrop; the page behind stays visible; rows are 54 to 55 px tall (measured); the body is not scroll-locked (computed `overflow-y: auto`) |
| Escape | closes; `aria-expanded` returns to `false`; **focus returns to the toggle** |
| Back navigation | not exercised |
| Search | a field in the Home hero and on All Tools; not in the header; typed text shows a clear button; the results region was not visible in the first viewport (NOT VERIFIED where results appear) |
| Breadcrumbs | present on tool and article pages, tight under the header |
| Focus containment while open | **Not contained (VERIFIED):** after the four menu links, Tab moves on to the page behind (Home breadcrumb, then the tool). Screen-reader and keyboard users can leave the open menu without closing it |
| Touch targets | menu rows 54 to 55 px (pass); the toggle is 40 px (fails the 44 px rule; passes WCAG 2.2 AA 24 px); the logo glyph box in the header is 38 px tall |

The disclosure mechanics are sound (state, Escape, focus return) but two gaps are verified: the toggle is 40 px, and focus is not contained while the menu is open. The proposals below are refinements, not a rebuild.

## Pattern evaluation

| Question | Options considered | Decision |
| --- | --- | --- |
| Header | compact header (56 px) with logo and a 44 px menu button | **Compact, not sticky.** A sticky 56 px header removes 7% of an 844 px viewport and about 9% of a 640 px one while the user types into a tool; non-sticky keeps the working area (rulebook 7.2: primary action reachable) |
| Menu | drawer from the side; full-screen overlay; dropdown under the header | **Dropdown panel under the header** with a backdrop and a visible Close; four items do not justify a side drawer; this is also what exists, so the migration is cheap |
| Search access | search icon in the header; search field in the menu; field on Home and All Tools only | **Keep the field on Home, All Tools and the 404 page**; a header search is P2 and only on evidence |
| Category access | drawer listing all tools; chips; tabs | **Section chips on All Tools** (GL-05): five 44 px chips in a scroll region |
| Tool navigation | persistent bottom bar; "Related tools" in flow | **In flow only** (GL-06). No bottom navigation bar: it permanently costs screen space and duplicates the four header links |
| Breadcrumbs | full path; single "back to section" link | **Full central breadcrumb that wraps**; no truncation with ellipsis because the last item is the page name |
| Sticky controls | sticky action bar on tools | **No site-wide sticky bar.** Individual tools may keep their own where the spec needs one (not introduced here) |
| Close behaviour | tap outside, Escape, Close button, navigating | All four (GL-03) |
| Back navigation | none beyond browser back | History is not altered by the menu (no hash push) |
| Gestures | swipe to open or close | **Not relied on.** Every action has a button and a keyboard path |
| Focus restoration | return to toggle | Keep (verified today) and add: focus stays within the panel while open or the page behind is `inert` |

## Proposed mobile patterns (concept board, measured)

The concept board renders three 390 px frames (header, open menu with backdrop, All Tools with chips). Measured by script at **320 and 360 px** (VERIFIED on the concept, not on a built site):

| Element | 320 px | 360 px | Target |
| --- | --- | --- | --- |
| Frame width | 288 px (board gutters) | 328 px | n/a |
| Menu button height | 44 px | 44 px | at least 44 |
| Menu rows | 49 px | 49 px | at least 44 |
| Section chips | 44 px | 44 px | at least 44 |
| Search field | 48 px | 48 px | at least 44 |
| Cards | 85 px | 85 px | at least 64 |
| Page-level horizontal overflow | none | none | none |
| Frame-level overflow | none | none | none |

A 320 px device with the real 16 px gutters gives a 288 px content width; the chip row scrolls inside its own region and does not widen the page. This validates the **geometry**, not the interaction code, which does not exist yet.

## Accessibility behaviour for the mobile menu (specification for GL-03)

1. Toggle is a `<button>` with `aria-expanded` and `aria-controls`; label changes between "Open navigation menu" and "Close navigation menu".
2. Panel is a `<nav aria-label="Main">` containing a list; when closed it is `hidden` (not just off-screen) so it is not reachable by Tab or a screen reader.
3. Escape closes and returns focus to the toggle; a visible Close button also closes.
4. Opening does not steal scroll position; the body does not scroll behind the panel.
5. The backdrop is a plain `div` that closes on tap; it is not focusable and carries no label.
6. `prefers-reduced-motion` removes the 200 ms slide and fade.
7. Link rows are 48 px minimum with a 2 px focus ring.
8. The active page link has `aria-current="page"` and a left bar, not only a colour.

## Unknowns to resolve in Prompt 2 or the checkpoint

Where the home search presents results on a phone; real-device touch behaviour; screen-reader announcement of the menu. None is verified in this research.
