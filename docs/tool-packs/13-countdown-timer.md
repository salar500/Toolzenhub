# Tool Pack 13: Countdown Timer (the third Time Tools tool)

Status: built and verified      Base commit: 8b731f3
Id and slug: `countdown-timer` (route `/tools/countdown-timer/`)
Spec follows `docs/tool-packs/_spec-template.md`; lifecycle and gate in `docs/tool-pack-factory.md`; the previous pack is `12-date-calculator.md`.

## Selection and hierarchy

Home → All Tools → **Time Tools** → Countdown Timer. The tool sits directly under the section (`sectionId: "time-tools"`, no category). **No "Timers" or "Productivity" subcategory**: three tools do not justify another layer.

- **User job:** "I need to time something that counts down to zero": a study or focus block, a meeting, cooking, a workout, a break, a talk. Set a time (or pick a preset), start, see the time left, pause and resume, know unmistakably when it ends.
- **Repeat use:** a timer is used again and again, and the same time is usually wanted again. Presets and "Reset keeps the time you last used" serve that. There is no account, streak, score or badge: retention comes from the tool being quick and reliable.
- **Not a Stopwatch** (counts up from zero) and **not a Pomodoro app** (no cycles, no tasks). Either may become its own tool later.

## States

| State | Screen | Buttons (only these are shown, all look active) |
| --- | --- | --- |
| idle | the three time fields, six presets, the sound option | Start |
| running | the time left, large; "Running · 1 hour and 25 minutes" | Pause, Reset |
| paused | the time left, dimmed; "Paused · …" | Resume, Reset |
| finished | 00:00; "✓ Timer complete" | Restart (same time again), Reset |
| validation error | the setup with a linked message under the fields | Start |

Focus follows the action: Start → Pause; Pause → Resume; Resume → Pause; finish → Restart; Reset → the first field.

## Timing model (authoritative end time)

The timer **does not count seconds**. Starting stores an end time, `endAt = now + duration`; the time left is always `endAt − now`, worked out whenever it is asked for. An interval (250 ms) only repaints. Consequences:
- A throttled or frozen background tab, or a laptop that slept, shows the right time the moment the page is looked at. `visibilitychange` (when the page is shown again) and `pageshow` re-read the clock at once.
- A timer that ran out while hidden is **finished on the first look**; the time left is never negative.
- **Pause** stores the time left; **Resume** sets `endAt = now + stored time left`. Nothing is added or lost over any number of pauses.
- The clock is `Date.now()` (it keeps counting through sleep, which is what a person timing something expects). The engine takes "now" as an argument and is tested with a fake clock.

## Inputs, presets, limits

- **Hours, minutes, seconds:** whole numbers, 0 or more, up to five digits; blank is 0. **Any amount in any field is accepted** and only the total counts (90 seconds = 1 minute 30 seconds); on Start the fields are rewritten in normal form.
- **Maximum 24 hours** (86,400 s). Beyond it: "The longest time is 24 hours."
- **Presets: 1, 5, 10, 25, 30, 60 min.** They fill the fields and do not start the timer; a typed value can be anything. The chosen preset shows `aria-pressed` and a tick. Six is enough: 25 serves focus blocks, 5 and 10 breaks and cooking, 1 a quick one, 30 and 60 meetings and workouts.
- **Errors** (a field named, nothing started, no `NaN`): all zero or blank ("Set a time above zero, or choose a preset."), negative, decimal, exponent, sign, separator, text, more than five digits, over 24 hours. The message clears on the next edit.

## Completion

At zero: never negative, the display reads 00:00, the status says "Timer complete" (text, not only colour), ticking stops, the live region announces "Timer complete.", the tab title returns to normal, and a short sound plays if the option is on.

## Sound, notifications, persistence, title

- **Sound: yes, optional, on by default.** A short three-tone beep generated with the Web Audio API (no file, no download, no external service), at a low volume, played once. The audio context is created in the Start (or Restart) click so a browser allows it. A checkbox ("Play a short sound when the timer finishes") turns it off. If audio is unavailable, nothing breaks.
- **Notifications: none.** No permission request, Push API, service worker or server. The page says plainly that closing it ends the timer and nothing alerts you.
- **Persistence: none.** A reload starts fresh. Restoring a running timer across reloads needs rules for time passed while closed, a finished-while-away state and stale storage; reliability matters more than that feature in v1. Nothing is stored.
- **Tab title: yes.** "24:32 — Countdown Timer" while running, "Paused 24:32 — Countdown Timer" while paused, and the original title otherwise (idle, finished, Reset). The static title in the HTML is untouched.
- **Multiple timers, labels, progress ring/bar: not in v1.** One timer; no naming needed; the number is the focal point and a bar would add clutter and nothing the number does not say.

## Accessibility

Labelled fields; the Start button is a form submit, so Enter in a field starts; native buttons only; visible focus (shared and a green outline on presets); 44 px minimum targets (56 px fields and buttons); the display has `role="timer"` with `aria-live="off"` so it is **not read each second**; a separate polite status region announces only meaningful changes (started for 20 seconds, paused at 00:15, resumed, reset, Timer complete); states are told in words as well as colour; nothing animates, so there is no motion to reduce.

## Mobile

Three fields in one row at every width (320 px checked), presets in two or three columns, the display sized `clamp(56px, 20vw, 128px)` so `24:00:00` fits at 320 px, full-width stacked buttons under 480 px, no horizontal overflow in any state.

## Exclusions (v1)

Stopwatch; Pomodoro cycles; multiple simultaneous timers; labels; presets editing; progress ring; browser notifications and any service worker; persistence across reloads; alarms when the page is closed; accounts, analytics, gamification; any API or backend.

## Search and isolation

Aliases: "online timer", "timer", "minute timer", "study timer", "focus timer" (the title, "Countdown Timer", covers that query). "countdown timer" and "timer" lead with this tool in All Tools and the global search; "date difference", "days between dates", "date calculator" and "add days to date" are unchanged. Not found by Calculator Categories, All Calculators or Loans; no calculator view lists it.

## Platform changes (small)

`data/tools.js` (the entry), `src/_data/toolStyles.json`, the tool's own module, engine and CSS; the Time Tools section card summary and SEO description in `data/categories.js` (now "Date tools and a countdown timer"); **Featured Tools**: the Countdown Timer **replaces Date Difference** (a timer is the stronger repeat-use tool; Date Difference stays in Home Explore, All Tools and Time Tools, and Date Calculator was never featured), so Home shows one Time Tools tool among six. The hero is unchanged. Related tools: none shown (the tool opts out; its relation to the date tools is weak and no calculator or article relates); the same-section relationship data now lists the three Time Tools for each other, which no page displays.

## Verification

- **Unit** (`tests/unit/countdown-timer.test.mjs`, a fake clock, no waiting): parsing, normalisation and the 24 hour limit at both edges, every invalid input, start, end time, finishing exactly at zero, never negative, ticking once equals ticking often, a long hidden gap, a timer that ran out while hidden, pause and resume, 40 pause/resume cycles losing no time, formatting, durations in words; plus the catalog, search and relationship pins.
- **Browser** (`tests/browser/countdown-timer.spec.js`, Playwright's fake clock: `runFor` for a foreground tab, `fastForward` for a throttled background one): the full flow (10 s → Start → Pause → Resume → finish → Reset), the hidden-tab reconciliation, repeated pauses, normalisation, presets, validation, announcements, copy, overflow and target sizes in every state, one real-clock 2-second run, Time Tools and All Tools, the Home → All Tools → Time Tools → Countdown Timer click path, search ranking, calculator-search isolation.
- Static links, SEO and assets; both builds; DOM, SEO and links baselines; visual baselines for the timer, Time Tools, All Tools and Home. No calculator spec or full regression was run.

## Known limitations

Needs the page open; closing, reloading or putting the whole computer in a state where the browser is frozen does not alert; a browser may refuse sound until the page has been used; the display updates less often in a background tab, but is correct when looked at; 24 hour maximum; no persistence.
