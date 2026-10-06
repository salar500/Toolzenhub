# Tool Pack 14: Stopwatch (the fourth Time Tools tool)

Status: built and verified      Base commit: 03b1b1d
Id and slug: `stopwatch` (route `/tools/stopwatch/`)
Spec follows `docs/tool-packs/_spec-template.md`; lifecycle and gate in `docs/tool-pack-factory.md`; the previous pack is `13-countdown-timer.md`.

## Does it earn its place? (checked before building)

- **Different job from every existing tool.** Countdown Timer: a known duration, counting toward zero. Stopwatch: zero, measuring an unknown duration, with laps. Date Difference and Date Calculator work on dates, not durations in progress. It is not a Countdown Timer with a flag.
- **Recurring problem.** Timing a workout round, a drill, a task or a test, a cooking step, a presentation run-through: people need an elapsed time and usually several marks within it. The lap record is the reason a stopwatch is more than watching a clock.
- **Repeat use.** Opened for each session of the same activity. No account is needed; retention comes from speed and reliability. No streaks, points or badges.
- **Modern relevance.** Faster than asking an assistant (it is instant and interactive), deterministic, private (nothing leaves the browser), and reusable without a prompt.
- **Browser-native, no dependency.** `performance.now()`, `requestAnimationFrame`, no API, backend, sound or notification. Low maintenance: a small pure engine and a thin page.
- **Discovery.** "stopwatch", "online stopwatch", "lap timer", "split timer" are everyday queries for a tool this small and useful.
- **Mobile.** A common phone use; designed for 320 to 390 px.
- **Verdict: passes.** (It would not have passed as filler: it is built because the lap record and the up-versus-down distinction are real.)

## Hierarchy

Home → All Tools → **Time Tools** → Stopwatch. Directly under the section, **no subcategory** ("Timers", "Measurement", "Productivity" and "Stopwatch & Timer" are not introduced; four tools do not justify another layer).

## States

| State | Display | Buttons (only these are shown, all look active) |
| --- | --- | --- |
| idle | 00:00.0, "Ready" | Start |
| running | the time, "Running", the lap in progress | Lap, Pause |
| paused | the time kept, "Paused", the laps | Resume, Reset |

No finished state: a stopwatch has no natural end. The one limit is 99:59:59.9 (100 hours less a tenth), where it stops by itself, says so ("Stopped at the 100 hour limit") and offers Reset.

## Timing model

- **Clock: `performance.now()`**, a monotonic clock. A change of the computer's date or time or a daylight-saving switch cannot move a stopwatch. (The Countdown Timer uses `Date.now()` for the opposite reason: a countdown is anchored to the wall clock.)
- **Elapsed = accumulated + running segment.** Start sets `startedAt`. Elapsed is `accumulated + (now − startedAt)`, worked out when it is asked for. Pause adds the segment to `accumulated` and clears `startedAt`; Resume starts a new segment. Nothing is counted tick by tick, so repeated pause/resume cannot drift, and how often the page repaints has no effect on the time.
- **Painting is separate from timing.** While running **and visible**, `requestAnimationFrame` repaints and the elapsed time is read from the clock each time. The display text is rewritten only when the tenth of a second changes (about ten small updates a second, not sixty); the tab title changes once a second. A paused stopwatch has no frame loop at all; a hidden page paints nothing (browsers stop its frames), and `visibilitychange` and `pageshow` read the clock at once and restart the loop.
- **Precision: tenths of a second, rounded down** (so the display is never ahead of the truth). Milliseconds and hundredths would be noise and extra repaint work. Format: `00:12.3` under an hour, `1:02:03.4` from an hour.
- **Maximum 99:59:59.9.** The engine caps the reading itself, so even a stale tab reads the limit and not a larger figure.
- **Known limitation:** a browser may not count the time a computer spends asleep; the page says so.

## Laps

- **Lap** is available only while running. It records: the lap number (from 1), the **lap time** (since the previous lap, or the start), and the **total**, also called the split (elapsed time at that moment).
- **Terminology on the page:** "Lap time" and "Total", explained in a short section; the word "split" appears once, as a synonym for Total.
- **Consistency:** times are whole tenths, and a lap time is the difference of two *displayed* totals, so the lap times always add up to the last total shown.
- **Order: newest first**, so the lap just taken is always visible without scrolling. While a lap is in progress, "Lap N: 00:02.4" shows the current lap's time under the main display.
- **Limit: 100 laps.** At the limit a Lap press records nothing, says "The lap limit of 100 is reached." (a polite announcement and a note under the table), and the stopwatch keeps measuring. No crash, no silent failure, at most 100 table rows.
- **Fastest and slowest:** marked with the words "Fastest" and "Slowest" (never colour alone) once there are at least two laps with different lap times; ties share the mark; all equal means no marks; the lap in progress is not compared. No chart.
- **No persistence:** a reload starts fresh. Laps are not stored (no localStorage); the page says nothing is stored.

## Reset

Reset is **offered only while paused** (and so is the `R` shortcut). A stray tap on a running stopwatch cannot wipe a measurement and its laps, and no confirmation dialog is needed because Pause first is the confirmation. Reset stops measuring, returns the elapsed time to 0, clears the laps and the marks, restores the Start screen, restores the tab title, and moves focus to Start.

## Keyboard shortcuts (an enhancement; every one has a button)

`Space` start, pause or resume; `L` lap; `R` reset when paused. Shown on the page in a line of text under the buttons. They never fire while typing (input, textarea, select, contentEditable) or with Ctrl, Meta or Alt, never on key repeat, and Space is left to a focused button or link. **Focus follows the toggling button** (Start → Pause → Resume → Pause), so Space does the same thing whether or not a button has focus. Mobile users lose nothing.

## Accessibility

The display has `role="timer"` and `aria-live="off"`: not read continuously. A separate polite status region announces only meaningful changes: started, paused at 00:12.3, resumed, "Lap 3: 00:42.1. Total 02:05.4.", the lap limit, the 100 hour limit, reset. The laps are a real `<table>` with a caption ("Laps, newest first"), column headers (Lap, Lap time, Total) and a row header for the lap number (with its Fastest or Slowest word). Native buttons, visible focus, 56 px buttons, states told in words, nothing animates (no motion to reduce), no sound.

## Mobile

Checked at 320, 360 and 390 px: the display is `clamp(52px, 17vw, 104px)` and drops to `clamp(38px, 12vw, 88px)` from one hour so `99:59:59.9` stays on one line; Lap and Pause (and Resume and Reset) sit side by side as two large buttons; Start is full width; the lap table uses compact cell padding; no horizontal overflow in any state.

## Exclusions

Sound, notifications, a progress ring or bar, charts, persistence, multiple stopwatches, labels or names for laps, exporting laps, lap-time goals, any API or backend, accounts, gamification. (A Countdown Timer completion alarm is deliberately not reused: a stopwatch has no endpoint.)

## Search and relationships

Aliases: "online stopwatch", "lap timer", "split timer", "elapsed time", "timer stopwatch". "stopwatch" leads with this tool; "countdown timer", "timer", "online timer" and "study timer" still lead with the Countdown Timer; "date difference" and "date calculator" are unchanged. Not found by Calculator Categories, All Calculators or Loans.

**Related tools:** the Countdown Timer and the Stopwatch name each other in their catalog entries (`relatedTools`) and link each other in a sentence on the page (the related-calculators component renders nothing for a tool without a category, so the sentence is the visible relation). The date tools are **not** related to the Stopwatch by intent; they are only in the same section.

**Articles:** none. "Countdown Timer vs Stopwatch" would restate this page's two cross-links; there is no unanswered question yet.

## Platform changes (small)

`data/tools.js` (the entry, and `relatedTools: ["stopwatch"]` on the Countdown Timer entry), `src/_data/toolStyles.json`, the tool's own module, engine and CSS; the Time Tools card summary and SEO description in `data/categories.js` ("Date tools, a countdown timer and a stopwatch"); one sentence and link in the Countdown Timer's Common Uses; a `data-ready` attribute set by both timer modules once their script has run (tests wait for it). **Featured Tools and the Home hero are unchanged** (the Countdown Timer already represents Time Tools in Featured Tools and has the broader everyday use).

## Verification

- **Unit** (`tests/unit/stopwatch.test.mjs`, an injected monotonic clock, no waiting): initial zero; start; elapsed; pause and a frozen time; resume; 60 pause/resume cycles equal to the running time; background gaps with no ticks; lap capture, numbering, totals, laps adding up to the last total, laps across a pause, a lap at the same instant; the 100 lap limit; fastest and slowest with ties and all-equal; reset; the 99:59:59.9 limit; formatting; never negative or NaN.
- **Browser** (`tests/browser/stopwatch.spec.js`, Playwright's fake clock *installed and paused* so time moves only when a test says: `runFor` for a foreground tab, `fastForward` for a throttled background one): the full path (Start, Lap, Lap, Pause, Resume, Lap, Reset), hidden-tab reconciliation, repeated pauses, fastest/slowest words, the lap limit, keyboard shortcuts, announcements and the table semantics, repaint economy (about 100 text changes in 10 s, none while paused), copy, 320/360/390 px, the 100 hour stop, one real-clock run, Time Tools, All Tools, the click path, search ranking, calculator-search isolation.
- Static links, SEO and assets; both builds; DOM, SEO and links baselines; visual baselines for the Stopwatch, Time Tools and All Tools. No calculator spec or full regression was run.

## Known limitations

Needs the page open; closing or reloading ends the measurement; sleep may not be counted; 100 laps; display in tenths; no persistence or export.
