# 09. UX and interaction blueprint

Reuses the existing tool-page shell (shared hero, breadcrumb from the central component, `calculator-form` controls, result card, FAQ and "how to" blocks), the live-region and focus patterns from the Stopwatch, Hours Calculator and PDF tools, and each tool's own scoped CSS file. No new site-wide pattern is proposed; no sidebar. Wireframes are text sketches of one column (mobile first); two columns of inputs appear from 640px as in the PDF tools.

## Shared interaction rules

| Rule | Detail |
|---|---|
| Entry state | Sensible defaults; dates blank (never today) with an explicit "Use today" button; result area shows one line of guidance, never an error |
| Result hierarchy | The answer first in large type, then the facts that explain it, then the stated convention in plain words |
| Actions | One primary action per tool; Reset always available and returns focus to the first field; Copy where a result is text |
| Errors | Beside the field, in words, never colour alone; the result is withheld, not guessed |
| Live regions | One polite status region; announcements only for meaningful changes (start, pause, phase change, result changed) |
| Keyboard | Natural DOM order; Space/Enter on buttons; Escape never destroys state; named Remove buttons ("Remove participant 2") |
| Touch | Targets 44px minimum; no hover-only information |
| Contrast | Action green `#087f47` for text-size green, not the brand green (design follow-up U1); button text restated for every link state |
| Mobile | No horizontal scroll at 320, 360, 390px; time display never overflows |

## Business Days Calculator

```
[ Mode:  (o) Add or subtract   ( ) Count between dates ]
Start date [ yyyy-mm-dd ] [Use today]
Business days [ 10 ]   (o) Add  ( ) Subtract
Weekend days  [x]Sat [x]Sun [ ]Mon ... 
Holidays (one per line, yyyy-mm-dd)  [ textarea ]
----------------------------------------------
  Friday, 14 November 2026          <- large
  15 calendar days later · 4 weekend days skipped · 1 holiday skipped
  "Counting starts the day after the start date; a weekend or holiday is never counted."
  [Copy result]   [Reset]
```
States: empty (guidance), ready, error (per field), result. Keyboard: radios by arrow keys; holiday errors name the line.

## Meeting Planner

```
Participants (2-12)
 [ Name ] [ Zone combobox ] [ 09:00 ] to [ 17:00 ] [Mon][Tue][Wed][Thu][Fri] [Remove]
 [+ Add participant]
Meeting length [30 min v]   First date [ ]  Days to scan [5]   Show times in [ zone v ]
-----------------------------------------------
Tue 4 Nov   Everyone is available between 15:00 and 16:00 (London)
            Priya 20:30  ·  Ana 09:00  ·  Sam 04:00 (outside his hours)  <- only if not everyone
Wed 5 Nov   No time works: Sam is available 22:00 to 06:00 (Tokyo) ...
[Copy summary] [Copy link]
Recurring check: weekly at this time shifts for Ana from 26 Mar (US clocks change)
```
Empty state: two rows, one prefilled with the visitor's zone. Overnight hours show "next day" labels. Each day is a labelled list; windows are cards on phones.

## Pomodoro Focus Timer

```
       FOCUS   (phase name)
       24:32   (large, role=timer, aria-live=off)
   Session 3 · Next: short break 5:00
   [ Start / Pause ]  [ Skip ]  [ Reset ]
   > Settings: Focus 25 · Short 5 · Long 15 · Long break after 4
                [ ] Start next phase automatically   [ ] Sound
```
States: idle, running, paused, finished-phase (banner plus announcement), hidden-tab return (one reconciled announcement). Tab title shows the remaining time and phase. Settings collapse after the first start to keep the timer dominant.

## Interval and Routine Timer

Same shell. Preset buttons (Tabata, EMOM, Custom) above the fields; a "Total time 4:00" line; the display shows stage name, remaining time and "Round 3 of 8"; an optional stage list editor (add, move up/down, remove, as in Merge PDF's list pattern, VERIFIED).

## Time Duration Calculator

Rows of `[+/- v] [ 1h 45m ]` with Add row and named Remove; result card lists `d h m s`, `h:mm:ss`, decimal hours, minutes, seconds. Row-level hints show how each text was read ("1:45 = 1 hour 45 minutes").

## Shift Schedule Planner

Pattern selector with a strip showing the cycle (D D N N - - -), start date and position, shift times, weeks to show. Output: month grids with shift letters and a text list for screen readers; summary lines; Print button with a print stylesheet (grid fits A4, no colour dependence).

## Enhancements

Countdown date mode adds a second tab-like radio ("Duration" / "To a date") above the inputs; Date Calculator and Date Difference gain small buttons and one panel; Hours gains Copy and a rounding select with a visible statement of what was rounded.

## Shared components (existing)

Tool shell and hero, live-region helper pattern, focus-after-reset helper, list reorder/remove pattern (Merge PDF), zone combobox and zone engine (converter), `calculator-form` buttons, FAQ and "how to" markup. New code needed: the cycle display for timers and the participant row for the planner.
