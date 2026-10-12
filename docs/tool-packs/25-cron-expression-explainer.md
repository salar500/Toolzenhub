# Tool Pack 25: Cron Expression Explainer (the fifth Developer Tools tool)

Status: **specification approved by the owner on 2026-10-12; implemented in three phases (Phase 1 engine `f06cc47`, Phase 2 integration `571194a`, Phase 3 review and the Implementation notes in section 24). Not pushed, not deployed.** Android and Safari/WebKit are unverified.
Repository baseline: written on `0189357`; re-checked against **HEAD `33d309b`** on 2026-10-12. `0189357` (Credit Card Payoff Calculator) is the last feature commit: the seven commits after it (all unpushed at the time of the check) are Growth manifest work and rulebook or planning documentation, and none changes the catalog, a tool module or a tool test. Counts re-verified on `33d309b`: 26 published tools, Developer Tools 4 (JSON Formatter and Validator, Unix Timestamp Converter, Text Diff / Compare, JWT Decoder), All Tools groups 16 (5 live calculator categories, 6 Time Tools, 4 Developer Tools, 1 Image Tools; `tests/browser/navigation.spec.js` line 494). Re-check these again at the start of the implementation.
Roadmap: item 3 of Roadmap R1 (`docs/tool-pack-factory.md` section 10). The roadmap does not authorize this build; approval of this specification does. R1 progress when written: 2 of 8.
Id and slug: `cron-expression-explainer` (route `/tools/cron-expression-explainer/`, the route convention of rulebook 4.3 and of the JWT Decoder)
Section: **Developer Tools** (flat, no category).

## Selection and verification record

Chosen from the platform-wide review (weighted score about 3.40 of 5; **search, retention and competition are hypotheses, not data**). The one verified competitive fact (Kubernetes CronJob documentation, read 2026-10-12) is that it names crontab.guru as a web tool for generating CronJob schedule expressions, so the space has an established leader; this tool does not expect to outrank it. Its case rests on exactness, a pinned and named dialect, explicit explanation of the day-field rule, and checkable next runs.

**AI-era test (rule 1.4).** An assistant can explain a cron string, but it can get the day-field rule, per-hour step restarts and dialect differences wrong, and it cannot show verified next run times. The tool gives the same exact answer every time. Expressions are rarely secret, so privacy is not the main reason (unlike the JWT Decoder).

**Evidence provenance (what was checked, how, and what was not).** The supported dialect is the cronie project's (`cronie-crond/cronie` on GitHub). Evidence is kept in four classes; nothing below is a binary verification.

1. **Source-reviewed (read, not run).**
   - *Preparation pass:* cronie `master` HEAD `59a3d15672d5738f5b6f76c843f200ef40ac5810` (committed 2026-09-25; latest tag seen `v4.3`), files `src/entry.c` (`load_entry`, `get_list`, `get_range`, `get_number`, `set_element`), `src/cron.c` (the day-matching rule) and `src/macros.h` (limits), as recorded by the original preparation.
   - *Re-check pass, 2026-10-12:* `src/entry.c`, `src/cron.c` and `man/crontab.5` on cronie `master` were re-read through a summarizing web-fetch tool that returned the quoted code and text. **The commit that tool served was not recorded**, so the revision for this re-read is *unconfirmed*; the hash above is the only recorded revision and was not re-confirmed. The implementation phase must record the exact cronie commit it reads (section 16).
   - *Claims reviewed in the source or the manual page in the re-check:* `?` is not handled (`get_number` accepts only alphanumeric characters, so `?` is a parse error); `@midnight` shares the `@daily` branch of `load_entry` and is absent from the crontab(5) macro list; reversed ranges set no bits except that a start above an end of `0` becomes `7`; a `/` after a single number is not accepted (state `R_NUM1`); a step larger than the range prints a warning on standard error and the entry is accepted; `DOM_STAR` and `DOW_STAR` are set when the field's first character is `*`, and `find_jobs` uses AND if either flag is set and OR otherwise; 0 and 7 are made equivalent for Sunday; the alias flags of section 6.3; the manual's field ranges, names, range and step wording, the "restricted (i.e., do not contain the `*` character)" paragraph and its `30 4 1,15 * 5` example, daylight saving wording and `CRON_TZ`.
2. **Independently executed (run, not just read).**
   - *Re-check pass, 2026-10-12 (Python 3.10.11, standard library):* a 400-year Gregorian cycle is 146,097 days, which is 20,871 whole weeks; 2100 is not a leap year; the leap years after 2096 are 2104 and 2108.
   - *Re-check pass, by hand (reasoning, no program):* ten rows of the truth table in section 6.3 were checked against the `cron.c` rule quoted above and agree.
   - *Preparation pass:* a Python transliteration of the cronie state machine and matching rule was run on the truth table. **That scratch file is not in the repository and is not available**, so its results are unreproduced until the implementation phase rebuilds the reference (section 16). Treat the truth table as *source-derived and hand-checked*, not as machine-confirmed.
3. **No real cronie binary was executed**, by the preparation or by the re-check (no cron daemon, C compiler or WSL was available). Nothing in this specification claims binary verification. The implementation phase may add a real-cronie cross-check where one is available; until it is run the behaviour is source-level only.
4. **Unverified assumptions.** Cronie `master` may differ from the cronie versions shipped by distributions, and other Linux cron implementations (for example Vixie/ISC cron, Debian cron, BusyBox crond) were **not read** and may differ. The POSIX crontab page, Spring's cron support and Jenkins' `H` syntax were **not read in the re-check**, so the tool makes no statement about them beyond refusing the syntax (section 4).

**Other dialects** (Kubernetes CronJob, GitHub Actions, Quartz, AWS EventBridge Scheduler) were read from their own documentation on 2026-10-12 and are described in section 5, never emulated. Only the cells section 5 sources are published; nothing else is claimed.

## 1. Tool identity
- Title **Cron Expression Explainer**; id `cron-expression-explainer`; `sectionId: "developer-tools"`; no category.
- Description (catalog): "Paste a five-field cron expression written in cronie crontab syntax to see what each field means, a plain-language summary and the next five matching times in UTC. It checks the syntax, says what it does not support and runs in your browser."
- Aliases (true of the tool): cron expression explainer, explain cron expression, crontab explainer, cron expression, crontab syntax, cron schedule explained, cron next run times. **Not** "cron generator" or "cron builder" (nothing is generated), not a brand name, not "quartz", "aws", "kubernetes" or "github actions" cron (not supported, section 4).
- Capabilities (existing flags only): `reset`, `copy`, `validation`, `explanation`, `examples`, `localProcessing`.

## 2. User problem
A developer meets a schedule string in a crontab, a CI file or a scheduler setting and needs to know what it does: which minutes, hours, days and months, and above all the traps: that day-of-month and day-of-week are combined by a surprising rule, that `*/35` is not "every 35 minutes", and that a string written for another scheduler (Quartz, AWS and others) may mean something else or be invalid here. The tool states what the expression means in the one dialect it supports, flags what it cannot explain, and shows when it would next match, so the reader can check their reading.

## 3. The supported dialect (exact definition)

**V1 explains the crontab time syntax of one pinned implementation: cronie, with five time fields.** The page names it: "Cronie crontab syntax, five time fields". "Cronie" is the project; the page does not say "Linux cron", because other Linux cron implementations (for example Vixie/ISC cron, Debian cron, BusyBox crond) were not read and may differ, and the cronie versions shipped by distributions may differ from the `master` source this tool is pinned to. The tool does **not** claim to be compatible with Kubernetes CronJobs, GitHub Actions, Quartz or AWS EventBridge Scheduler, which differ (section 5), nor with any other cron implementation. A schedule written for one of those can look valid here and still mean something different there; the page says so.

The dialect is defined by the cronie source and manual page listed above, **restricted** as stated in sections 6.6 and 7 (a few cronie behaviours are deliberately refused in V1 because they are quirks, undocumented or not time-schedule syntax). Additional dialects are **not approved** (section 21, decision 12).

## 4. Supported and excluded syntax

**Supported (five fields: minute 0 to 59, hour 0 to 23, day of month 1 to 31, month 1 to 12, day of week 0 to 7):**
| Syntax | Examples | Notes |
| --- | --- | --- |
| Wildcard | `*` | All values in the field's range (the day-of-week range is 0 to 7) |
| Number | `5`, `05`, `007` | ASCII digits (up to 3 characters in V1, section 7); leading zeros are read as decimal |
| List | `1,15`, `mon,wed,fri` | Comma-separated items, each a number, name, range or step form |
| Range | `8-11`, `jan-mar` | Inclusive; the first value must be at most the second |
| Step after a wildcard | `*/15` | Steps are evaluated inside the field only (`*/23` in hours is hours 0 and 23) |
| Step after a range | `0-23/2`, `mon-fri/2` | Same |
| Month names | `jan` to `dec` | Three letters, any case (month field only) |
| Weekday names | `sun` to `sat` | Three letters, any case (day-of-week field only) |
| Sunday as 0 or 7 | `0`, `7`, `sun` | All mean Sunday; `1-7` includes Sunday as the last day |
| Aliases (whole expression) | `@yearly` `@annually` `@monthly` `@weekly` `@daily` `@midnight` `@hourly` | Lowercase, expanded and shown (section 7). `@midnight` is accepted by cronie's source but is not listed in its manual page; the tool says so |

**Excluded, each refused with its own message (section 9):** `?` (not handled by cronie; Kubernetes reads it as `*`, Quartz and AWS use it in the day fields), `L` `W` `#` and `LW` (Quartz and AWS extensions), `@reboot`, `~` (cronie's random values, which are not a fixed schedule), a step after a single number such as `0/35`, reversed ranges (including `5-0`), six- or seven-field forms (seconds, a year), `H` and other hash forms, full weekday or month names (`monday`), uppercase aliases, a command after the five fields, and anything that is not ASCII.

## 5. Dialect differences (documented facts, shown on the page)
Each published cell is what that project's own documentation says, as read on 2026-10-12 (sources below). The tool supports only the first column. **A "not shown" cell makes no claim:** it means the tool's author did not find the point in the pages read, and the reader should check the project's own documentation. Nothing from memory, from a search result or from another site is in the table.

| | Cronie (crontab(5) and source) | Kubernetes CronJob | GitHub Actions `schedule` | Quartz CronTrigger | AWS EventBridge Scheduler |
| --- | --- | --- | --- | --- | --- |
| Time fields | 5, then the command | 5 | 5 | 6 or 7: seconds first, then minutes, hours, day of month, month, day of week, and an optional year (1970-2099), per the page's field table (read 2026-10-12) | 6, including a year (1970-2199) |
| Day of week | 0 to 7 (0 and 7 are Sunday) or names | 0 to 6 (Sunday to Saturday) or `sun` to `sat` | 0 to 6 or `SUN` to `SAT` | 1 to 7 or `SUN` to `SAT` (the page text read does not say which number is Sunday, so none is claimed) | 1 to 7 or `SUN` to `SAT` (its `3#2` example calls 3 Tuesday, the third day of the week, which makes 1 Sunday) |
| Day of month and day of week both set | If both are written without `*`, either may match; if either starts with `*`, both must match (source and manual) | not shown | not shown | "support for specifying both is incomplete": `?` must be used in one of them | `*` cannot be used in both; if used in one, `?` goes in the other |
| `?` `L` `W` `#` | `?` is a parse error in the source; `L` `W` `#` are not handled | `?` "has the same meaning as an asterisk `*`"; the others not shown | not shown (the operators documented are `*`, `,`, `-` and `/`) | `?`, `L`, `W` and `#` are supported | `?`, `L`, `W` and `#` are supported, each in its own fields |
| Steps | After `*` or a range only; a step after a single number such as `0/35` is a syntax error (source) | "Vixie cron" steps: after a range, or after `*` (its quoted FreeBSD text); a single number not shown | `/` is documented; its example `20/15 * * * *` runs every 15 minutes starting from minute 20 | `0/15` in the seconds field means 0, 15, 30 and 45 | `1/10` in the minutes field means every tenth minute from minute 1 |
| Macros | `@yearly` `@annually` `@monthly` `@weekly` `@daily` `@hourly` `@reboot` in the manual; `@midnight` is accepted by the source but not listed in the manual | `@yearly` `@annually` `@monthly` `@weekly` `@daily` `@midnight` `@hourly` | documented as **not supported** (`@yearly`, `@monthly`, `@weekly`, `@daily`, `@hourly`, `@reboot` are named) | not shown | not shown |
| Time zone | The daemon's time zone; `CRON_TZ` sets one per table (manual) | The kube-controller-manager's local time zone unless `.spec.timeZone` is set; `CRON_TZ` or `TZ` inside the schedule is rejected | UTC by default; a `timezone` key takes an IANA name | not shown | UTC, or the IANA time zone you specify |
| Daylight saving | Times that do not exist never match; repeated times run twice (manual) | not shown | not shown | not shown | A skipped time is not run in spring; a repeated time runs once in autumn; UTC schedules are not adjusted |

**Sources and dates (all read 2026-10-12):** cronie `man/crontab.5`, `src/entry.c` and `src/cron.c` on `master` (revision unconfirmed, see the evidence provenance above); the Kubernetes CronJob page (`kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/`: the schedule syntax, `?`, steps, macros and time-zone sections; the part about both day fields was **not found**); the GitHub Actions "Events that trigger workflows" page (the `schedule` event); the Quartz 2.3.0 CronTrigger tutorial; the AWS EventBridge Scheduler "Schedule types" page. The POSIX crontab page was **not** re-read in this revision, so POSIX is not a column. Spring cron and Jenkins `H` were **not** read, so nothing about them is stated. The published table cites the same sources, and any cell the implementation phase cannot re-confirm from the source page is removed rather than softened.

A `?` accepted by Kubernetes is **refused** here, and this is stated, so no dialect is mixed into this parser. Because GitHub Actions, Quartz and AWS document a start value with a step (`20/15`, `0/15`, `1/10`) and cronie does not, the `n/s` refusal message names this difference without calling the other forms wrong (section 6.1).

## 6. Verified semantics

### 6.1 Single-value steps (`0/35`) are a syntax error in cronie
In cronie's `get_range`, after a single number (state `R_NUM1`) the only characters that continue the field are `-`, `~` or a separator; a `/` returns an error. The manual page describes steps only "in conjunction with ranges" and "after an asterisk". So `0/35` is **invalid** in this dialect; the tool refuses it and says: "In cronie crontab syntax, a step must follow `*` or a range, such as `0-59/35`. Some other schedulers document a start value with a step (GitHub Actions `20/15`, Quartz `0/15`, AWS `1/10`); that form is not read here." (`*/35` is valid and is minutes 0 and 35.)

### 6.2 Steps
A step needs a positive number (`*/0` is an error). Elements are the range start plus multiples of the step while the value is at most the end. A step larger than the range is **accepted** by cronie with a warning on standard error (only the first value matches); the tool accepts it and notes "the step is larger than the range, so only the first value matches". Steps never carry across fields: `*/35` in minutes is minutes 0 and 35 in every hour.

### 6.2a `@midnight`
Present in cronie's `load_entry` (the same as `@daily`); absent from the crontab(5) list. Accepted, with the note "listed by Kubernetes and accepted by cronie, but not in the cronie manual page".

### 6.3 The day-of-month and day-of-week rule (the mandatory gate): VERIFIED
`cron.c` decides a day with: if the day-of-month **or** the day-of-week field is a "star field", both must match (AND); otherwise either may match (OR):
`(DOM_STAR || DOW_STAR) ? (dow matches && dom matches) : (dow matches || dom matches)`.
`entry.c` sets `DOM_STAR` or `DOW_STAR` when **the first character of that field's text is `*`**. So the status is a property of the **syntax as written**, not of the set of values: `*`, `*/2` and `*,3` are star fields; `1-31`, `0-7` and `1,*` are not, even if they select every day. The manual page words this as "restricted (i.e., do not contain the `*` character)". The cron.c comment says it plainly: "`* * 1,15 * Sun` will run on the first and fifteenth AND every Sunday; `* * * * Sun` will run only on Sundays; `* * 1,15 * *` will run only the 1st and 15th ... it's the standard". The month field has no star flag and the minute and hour flags do not affect matching.

The aliases set the same flags as their five-field forms (`@yearly` and `@monthly`: `DOW_STAR`; `@weekly`: `DOM_STAR`; `@daily`, `@midnight`, `@hourly`: none, and every day matches), so each equals the expansion shown.

**Truth table** (the March 2026 calendar: 1 March is a Sunday; each row is the days on which the entry fires at 00:00; derived from the cronie rule quoted above and hand-checked, **not machine-confirmed until the Python reference of section 16 reproduces it**):
| Expression | Rule | Days in March 2026 |
| --- | --- | --- |
| `0 0 1,15 * 5` | both restricted: OR | 6: Sun 1, Fri 6, Fri 13, Sun 15, Fri 20, Fri 27 (the manual's own `30 4 1,15 * 5` example) |
| `0 0 * * 5` | dom is a star: AND | 4: the Fridays |
| `0 0 1,15 * *` | dow is a star: AND | 2: Sun 1, Sun 15 |
| `0 0 */2 * 1` | dom starts with `*`: AND | 2: Mon 9, Mon 23 (odd days that are Mondays) |
| `0 0 *,1 * 1` | dom starts with `*`: AND | 5: every Monday |
| `0 0 1,* * 1` | neither starts with `*`: OR; the list covers every day | 31: every day |
| `0 0 1-31 * 1` | not a star field: OR | 31: every day |
| `0 0 1 * 0-7` | not a star field: OR | 31: every day (compare `0 0 1 * *`: only the 1st) |
| `0 0 1 * 7` | OR, 7 is Sunday | 5: Sun 1, 8, 15, 22, 29 |
| `0 0 * * */2` | dow starts with `*`: AND | 18: Sundays, Tuesdays, Thursdays and Saturdays |
| `0 0 1 * */7` | dow starts with `*`: AND | 1: Sun 1 (the 1st only if it is a Sunday) |
| `0 0 1-5 * 0` | OR | 9: Sun 1, Mon 2 to Thu 5, and Sundays 8, 15, 22, 29 |
The implementation must keep a `startsWithStar` flag per day field **from the text**, and must never derive it from the expanded values.

### 6.4 Sunday and day-of-week values
After parsing, if 0 or 7 is present both are set (`entry.c`), so `0`, `7`, `sun` and `0,7` are all Sunday and a range such as `5-7` is Friday, Saturday and Sunday. Weekday names are matched whole and case-insensitively against `Sun Mon Tue Wed Thu Fri Sat`.

### 6.5 Tokens, lists and errors (from `get_number`, `get_list`, `get_range`)
Numbers and names are runs of ASCII letters and digits; a token that is not a number must be a name of that field, otherwise the field is bad. Names are valid only in the month and day-of-week fields. An out-of-range value makes the whole expression invalid. An empty list element (`1,,2`, `1,`) is an error. After a step or a range the field must end: `*/5/2`, `1-5-7` and `*-5` are errors. A number such as `007` is read as 7.

### 6.6 What cronie accepts that V1 deliberately refuses
- **Reversed ranges.** The manual says the first number must be at most the second, but the parser accepts `5-3` and sets no value, and treats a reversed range ending in `0` as ending in `7` in **any** field (`5-0` in minutes is minutes 5 to 7). That is a quirk, so V1 refuses every reversed range: "The range 5-3 runs backwards. In crontab the first number must be at most the second."
- **`~` random values**, chosen when the file is read: not a fixed schedule.
- No other cronie behaviour is modelled.

### 6.7 Daylight saving (documented, not modelled)
The cronie manual says missing times never match and repeated times run twice (and a `CRON_TZ` can be set per table). The tool shows UTC only (section 11) and states this; it does not simulate DST.

## 7. Parsing contract (exact)

**Input:** one line of text in an `<input>` (so it has no line breaks). Leading and trailing whitespace is removed; runs of spaces and tabs between fields are read as one separator. Any other whitespace or any non-ASCII character is an error naming the character and position.

**Normal forms:**
1. If the text starts with `@`, the whole text must be exactly one alias: `@yearly` `@annually` `@monthly` `@weekly` `@daily` `@midnight` `@hourly` (cronie compares aliases exactly, in lowercase; `@DAILY` is refused with "aliases are lowercase"). The tool shows the expansion: `@yearly` and `@annually` `0 0 1 1 *`; `@monthly` `0 0 1 * *`; `@weekly` `0 0 * * 0`; `@daily` and `@midnight` `0 0 * * *`; `@hourly` `0 * * * *`, and explains that expansion. `@reboot` is refused ("runs once at start-up, so there is no schedule to explain"). Any other `@word` is refused.
2. Otherwise exactly **five** fields. Fewer: "A crontab time needs five fields (minute, hour, day of month, month, day of week); this has N." More: "In a crontab file a sixth field is the command, so this tool explains only the five time fields. If this is Quartz or AWS syntax (six or seven fields), it is not supported here."

**Per field (minute, hour, day of month, month, day of week):** a comma-separated list of one or more items; each item is one of: `*`; `n`; `a-b`; `*/s`; `a-b/s`, where `n`, `a`, `b` are numbers (or, in month and day-of-week only, three-letter names, any case) and `s` is a positive number. A step after a single number (`n/s`) is refused (section 6.1). The text is read by a hand-written scanner (no regular expression with nested quantifiers).

**Numbers:** ASCII digits only, at most **3 characters** (so `007` is accepted and `0007` is refused with "numbers have at most 3 digits here"; this is a V1 safety limit, cronie has none). Bounds: minute 0 to 59, hour 0 to 23, day of month 1 to 31, month 1 to 12, day of week 0 to 7. Out of range: "N is outside 0 to 59 for the minute field."

**Names:** exactly three letters, case-insensitive, valid only where stated. Full names, other abbreviations and names in other fields are errors ("`monday` is not valid: use `mon`").

**Duplicates:** merged, with a note ("`1,1,2` lists 1 twice").

**Limits (all SAFETY restrictions of this tool; cronie itself allows far more):**
| Limit | Value |
| --- | --- |
| Whole input | 256 characters after trimming |
| Fields | exactly 5 (or one alias) |
| Characters in one field | 64 |
| Items in one list | 32 |
| Number token | 3 characters |
| Next-run search | one full calendar cycle (section 11) |
Over a limit: a message that names the limit and says it is a limit of this tool, not of cron.

**Never repair:** no input is corrected, reordered, normalised silently or guessed. The normalised expression shown is the input with single spaces between fields and names kept as typed; the numeric expansion is shown separately.

**Errors** state the field, the offending text and its position: "Field 3 (day of month): `*/0` has a step of 0; a step must be at least 1." One error is shown (the first, left to right), and the field table is not shown for invalid input.

## 8. Intermediate result (what the parser returns)
Per field: `text` as written, `startsWithStar` (day fields; from the text), `items` (kind and parts), `values` (sorted, distinct, expanded), `warnings`. Plus: `dialect`, `alias` (if any) and `expansion`. The day-field rule and the next-run search use `values` and `startsWithStar` only.

## 9. Messages for unsupported syntax (exact)
| Found | Message |
| --- | --- |
| `?` | "`?` is not valid in cronie crontab syntax. Quartz and AWS use it in the day fields, and Kubernetes reads it as `*`. Here, use `*`." |
| `L`, `W`, `LW`, `#` | "`L`, `W` and `#` are Quartz and AWS cron extensions and are not valid in cronie crontab syntax." |
| `0/35` | section 6.1 |
| `5-3`, `5-0` | section 6.6 |
| `~` | "`~` picks a random value when cronie reads the file, so it is not a fixed schedule. This tool does not explain it." |
| `@reboot` | section 7 |
| six or seven fields | section 7 |
| `H` or `H/15` | "`H` is not valid in cronie crontab syntax." |
| a year or seconds | covered by the field count message |
Messages never say the expression is "wrong" for another scheduler; they say what this dialect is.

## 10. Explanation contract

**Result parts (in order):** the dialect line; the normalised expression (and the alias expansion); a **summary** sentence where one can be stated exactly; the **field-by-field** table; **notes** for subtle behaviour; the **next five matching times in UTC**; the assumptions beside the result.

**Summary:** built from fixed templates **only when the whole expression falls in a small set of shapes whose meaning the template states exactly**; otherwise the page says "This schedule is explained field by field below" and shows no summary. The builder returns a structured form (time parts, date parts) and the sentence is rendered from it; tests check that the structured form re-derives exactly the same set of matching minutes (section 16). Eligible shapes (examples, with the exact wording):
- Time (minute and hour fields): single minute and single hour: "At 09:30"; one minute with `*` hours: "At minute 15 of every hour"; `*` minutes with one hour: "Every minute from 09:00 to 09:59"; `*/n` minutes with `*` hours: "Every n minutes, restarting at the start of each hour: at minutes 0, 15, 30 and 45"; minute list or hour list up to 6 items: "At 04:00, 12:00 and 20:00".
- Date: `*` for dom, month, dow with an eligible time: "every day"; dow a list or range of names or numbers with dom and month `*`: "on Monday through Friday"; dom a list with dow `*`: "on day 1 and 15 of the month"; a month list or range: "in January through March".
- **Both day fields restricted (OR):** only the sentence "on day 1 and 15 of the month, or on Friday (either)" with the note below; **one day field a star and the other restricted (AND)** states "on days that are both ...". A day field that starts with `*` but has a step (`*/2`) is never summarised; it gets the field explanation and the note.
Anything else (steps inside lists, more than the shapes above, minute steps with ranges, etc.) is **not summarised**.
Weekday names in sentences use full names; hours are 24-hour `HH:MM`.

**Field-by-field:** per field its name, the text as written, the plain meaning ("every value", "5, 6 and 7", "every 15th from 0 through 59: 0, 15, 30, 45"), and the expanded values (shown fully up to 60 values).

**Notes (exact strings; only those that apply):**
1. Both day fields restricted: "Day of month and day of week are both restricted, so the command runs when either one matches (not only when both do)."
2. One day field starts with `*` and the other is restricted: "A day field written with `*` (including `*/2`) makes cron require both day fields to match."
3. A day field written as `1-31` or `0-7` (full range, not `*`): "`1-31` selects every day but is not written with `*`, so cron treats the field as restricted."
4. A step in minutes or hours: "Steps restart in each field: `*/35` in minutes is minutes 0 and 35 of every hour, not every 35 minutes."
5. Step larger than the range: section 6.2.
6. Sunday written as 7 or 0 or both: "0 and 7 are both Sunday."
7. Duplicates: section 7.
8. Alias: its expansion; `@midnight`: section 6.2a.
9. Dates that do not exist (a day of month never present in the chosen months): "No month in this schedule has day 31, so it never runs." (when exactly true; section 11).
10. `29` with February: "Runs only in leap years."

**Copy and reset:** Copy expression copies the normalised expression; Copy summary copies the summary (or the field table as text when there is no summary). Each only on an explicit click, never the clipboard read. Reset clears the input, result and errors and returns focus to the input.

## 11. UTC next-run contract
- **Input:** the parsed result and a clock. The engine takes `nowMs` (Unix milliseconds); tests inject it; the page passes `Date.now()` once per Explain.
- **Start:** `start = floor(nowMs / 60000) * 60000 + 60000`: the first minute boundary **strictly after** now. A run exactly at the current minute is excluded; if `now` is exactly on a boundary that boundary is also excluded.
- **Matches:** a minute matches when its UTC minute, hour, month, and day (by section 6.3) all match. Calendar arithmetic uses integer civil-date routines (days from a civil date and back), checked against Python's `datetime`; no `Date` object is needed for matching. The Gregorian calendar, leap years (including 1900 and 2100 not being leap years) and month lengths are exact.
- **Search:** day by day from the start day, skipping months not in the month set, collecting matching minutes (hour times minute, in order; on the first day only those at or after the start) until **five** are found or the horizon ends.
- **Horizon:** **146,097 days**, one full 400-year Gregorian cycle (146,097 days is exactly 20,871 weeks, so the calendar and weekdays repeat). Searching one whole cycle finds a match if one exists, so "no match" is **exact**, not a guess.
- **Impossible schedules:** if nothing matches in the whole cycle: "This schedule never runs (for example, no month in it has day 31)." The tool says "never", because the search covers a full cycle. A rare schedule (such as 29 February) shows the next five that exist, however far ahead (the year is shown).
- **Work bound:** at most 146,097 day steps with constant work each, plus enumerating at most 1,440 minutes on matching days; a few milliseconds. No unbounded loop, no worker, no timers.
- **Format:** `Fri 9 Oct 2026, 09:30 UTC` (24-hour). Not relative times, not the device's zone.
- **What it does not say:** the list is **UTC**. It is not when a server in another time zone runs the job, it ignores daylight saving, and it uses this device's clock for "now". The page says each of these beside the list. No time-zone selection exists in V1.

## 12. Security and privacy
Local-only; no external API, parsing service or dependency; no `eval`, `Function` or dynamic code; no cron command is ever run or even read (the input is the five fields only); nothing stored (no `localStorage`, `sessionStorage`, IndexedDB or cookie); **no URL state** (the expression is not placed in the address); no logging of the input; all text from the input is written with `textContent` and never as HTML or a link; bounded parsing (the limits in section 7) and a bounded next-run search; no regular expression with nested quantifiers. Tests cover each.

## 13. User experience
Mobile-first, one column, existing design tokens and shared tool styles (`calculator-page`, `calculator-intro`, `calculator-section`, `calculator-form__button`, the Developer Tools card patterns of the JSON Formatter and JWT Decoder); a small tool CSS file only for what is new.
1. Intro and trust card ("Your expression is read in your browser").
2. **Dialect line** above the input: "Cronie crontab syntax, five time fields. Not Kubernetes, GitHub Actions, Quartz or AWS syntax, which differ. Other cron programs may differ too."
3. Input labelled "Cron expression" (monospace, 16 px on phones, `spellcheck="false"`, `autocomplete="off"`, `autocapitalize="off"`), a character count, hint text, and example buttons (each fills the input and explains): `*/15 * * * *`, `30 4 * * mon-fri`, `0 0 1,15 * 5`, `0 */2 * * *`, `@daily`, `0 0 29 2 *`.
4. **Explain** (primary; Enter in the field also explains), **Reset**.
5. Status line and an accessible error panel (text, linked to the input with `aria-invalid` and `aria-describedby`).
6. Result: summary card, field cards (a stacked list on phones, a table from 700 px), notes, the next five UTC times, and the assumptions beside them (UTC; dialect; DST not modelled; device clock).
7. Static sections: syntax cheat sheet; the day-of-month and day-of-week rule with the truth table; steps; **dialects compared** (section 5); time zones and daylight saving; FAQ.
Accessibility: labelled input, one h1 and ordered headings, a polite live region announcing one sentence per Explain ("Explained. 4 notes. Next run Fri 9 Oct 2026, 09:30 UTC." / the error), focus moved to the result heading after a successful Explain and kept on the input after an error, keyboard operation throughout, visible focus, 44 px targets, meaning never by colour alone, results in text.

## 14. Content and SEO
- **Title:** "Cron Expression Explainer: Read a Crontab Schedule | ToolZen Hub"
- **Description:** "Paste a five-field cron expression written in cronie crontab syntax to see what each field means, a plain-language summary and the next five matching times in UTC. It checks the syntax and runs in your browser."
- **H1:** Cron Expression Explainer.
- **Sections:** How to Use; Crontab Syntax at a Glance; Day of Month and Day of Week (the OR and AND rule, with the truth table); Why `*/35` Is Not Every 35 Minutes; Cron Dialects Compared (section 5, with each project named as the source); Time Zones and Daylight Saving (UTC only here; the scheduler's zone decides; cronie's documented DST behaviour); What This Tool Does Not Do; FAQ.
- **FAQ (5):** Does this work for Kubernetes or GitHub Actions? (similar five-field syntax, but they differ: see the table; this tool pins cronie); Why does my schedule run on more days than I expected? (the OR rule); What does `*/5` mean exactly?; Why is `0/5` rejected? (section 6.1); Is my expression sent anywhere? (no).
- No keyword volumes or rankings are claimed, no "guaranteed", no promise that a real scheduler will run at the times shown. No article in this phase.

## 15. Integration (exact files)
**New:**
- `assets/js/tools/cron-explainer/cron-engine.js` (pure: scanner, parser, intermediate result, day rule, civil-date routines, next runs, summary builder, messages)
- `assets/js/tools/cron-explainer/index.js` (the page: `markup()`, `render()`, `init()`; `showRelatedCalculators = false`)
- `assets/css/tools/cron-explainer.css`
- `tests/unit/cron-explainer.test.mjs`, `tests/browser/cron-explainer.spec.js`
- `tests/fixtures/cron-golden.py` and `tests/fixtures/cron-golden.json`

**Existing, small changes:**
- `assets/js/data/tools.js`: the entry: `status: "published"`, loader `import("../tools/cron-explainer/index.js")`, `sectionId: "developer-tools"`, `autoRelated: false`, `relatedTools: ["unix-timestamp-converter"]` (the next-run times are Unix-time instants; the link is one way and the Unix converter's page is not edited; the JSON Formatter, Text Diff and JWT Decoder are not related), aliases and SEO text of sections 1 and 14.
- `src/_data/toolStyles.json` (style entry).
- `assets/js/data/categories.js`, the `developer-tools` section entry: update its **`seoDescription`** (today it names the four tools: "a JSON formatter and validator, a Unix timestamp converter, a text diff checker and a JWT decoder that run in your browser") and its **`summary`** ("JSON, timestamp, text compare and JWT tools, in your browser") to include the cron explainer. Keep the generic `description` ("Browser-based tools for working with data and code."), the id, `icon`, `landing`, `pathPrefix` and the no-categories architecture as they are. Read `sections.test.mjs`, `catalog.test.mjs` and the SEO baselines for pinned wording first; each pinned expectation is a reviewed edit (rulebook section 10, item 6).
- **`scripts/growth-manifest/identity-ledger.json` (Phase 2, same commit as the catalog entry).** The Growth identity ledger records every published tool's id and implementation module, and the exporter refuses when the catalog and the ledger disagree (`mapping` refusal). Rulebook section 6, items 6 and 7, and `docs/growth-manifest.md` set the contract; the header of `scripts/growth-manifest/ledger.mjs` has the full rules. For this tool, as a **reviewed manual edit** (a script never writes the ledger; this specification does not edit it):
  - append one record to `tools`: `id` `cron-expression-explainer` (the catalog id), `module` `assets/js/tools/cron-explainer/index.js` (the file the catalog loader imports, the same convention as the JWT Decoder's record), `moduleChanges` `[]`, `provenance` `added` (the value for a tool recorded after the bootstrap), `state` `active`;
  - edit nothing else: no existing record is changed, removed or reordered, and `nextArticleId` is untouched (no article in this phase);
  - the ledger edit, the `tools.js` entry (`status: "published"`) and `assets/js/tools/cron-explainer/index.js` go into **one commit**, because the ledger is compared with the previous committed version and a published tool without its record is refused;
  - Phase 1 publishes nothing, adds no catalog entry and therefore touches no ledger.
  - **Validation:** `node scripts/growth-manifest/export.mjs --check` (writes nothing; never `--write`). It must run on `main` with full history and refuses unless every file that can influence the manifest, including the tool's implementation module, is tracked with its committed bytes, so it is run **after the Phase 2 commit is made (with its approval) and before any push**; a refusal is read and fixed, not bypassed. Also run the Growth manifest unit tests (`tests/unit/growth-manifest-*.test.mjs`) if the ledger or the catalog mapping is touched. No test pinning the published-tool count was found in those files on 2026-10-12; re-check at the start of Phase 2.
  - `--check` does not approve anything for marketing, and Growth OS import is a separate project and a separate approval.
- Pinned unit tests: `catalog.test.mjs`, `sections.test.mjs`, `relationships.test.mjs`, `search.test.mjs`, `tool-capabilities.test.mjs`, `taxonomy.test.mjs` if affected.
- Browser specs that pin the Developer Tools count or the All Tools group count: `json-formatter.spec.js`, `text-diff.spec.js`, `unix-timestamp-converter.spec.js`, `time-zone-converter.spec.js`, `image-compressor-resizer.spec.js`, `navigation.spec.js` (Developer Tools 4 to 5, groups 16 to 17), each literal read on its merits.
- `tests/inventory/url-inventory.json` (regenerated); DOM (home main, tools directory), links and SEO baselines; the Developer Tools and All Tools listing visuals.
- `docs/tool-packs/25-cron-expression-explainer.md` (an Implementation notes section after the build).
**Related tools:** the Time Zone Converter belongs to another section (rulebook 4.2), so it is **not** a related tool and is not linked; the page may name time zones in plain text. This is decision 8 below.
No shared component, global header, footer or navigation change; no dependency; the existing registry, route derivation and search are used as they are.

## 16. Independent golden reference (`tests/fixtures/cron-golden.py`)
Python standard library only; **written from the cronie source and the manual page, not translated from the JavaScript**; three independent parts that must agree before a value is written. The earlier scratch transliteration is not available in the repository (evidence provenance, class 2), so this reference is **rebuilt from the source**, not recovered.

**Independence requirements (binding on Phase 1):**
- The Python reference must not read, import, run, port or paraphrase the JavaScript engine, and no expected value may be copied from a JavaScript output. Only the Python writes `cron-golden.json`; the JavaScript tests only read it.
- The reference is written first from the cronie source, the manual page and the documented expectations (part 3), with the cronie commit it read recorded in its header. Where the JavaScript and the reference disagree, the cause is found against the cronie source; the oracle is never edited just to match the JavaScript, nor the JavaScript to match an unexplained oracle value.
- Because both implementations come from one reading of the source, part 3 (values stated by the manual itself) and the hand-checked truth table are the guard against a shared misreading; mutation tests (section 17) must prove the tests can fail.
- A real-cronie cross-check is optional and not assumed; no result is called binary-verified unless a real cronie binary was run and its output recorded.
1. **Parse oracle:** a transliteration of cronie's `load_entry`, `get_list`, `get_range`, `get_number`, `set_element` (the character-level state machine, the star flags and the Sunday rule). It classifies every input as accepted or refused and produces the field values and star flags. Cronie behaviours the tool deliberately refuses (section 6.6, `~`, `n/s`, extra length) are labelled so the expected result is **"accepted by cronie, refused by V1 for reason X"**.
2. **Next-run oracle:** a brute-force scan with `datetime`: minute by minute for the first year after each start instant (525,600 steps), and day by day for rare schedules over a full 400-year cycle, applying the day rule of section 6.3 to the oracle's field sets and star flags. It also decides "never" by scanning the whole cycle.
3. **Documented expectations:** values that come straight from the documentation, independent of both: the manual's `30 4 1,15 * 5` (the 1st, the 15th and every Friday), `*/23` hours (0 and 23), `*/35` minutes (0 and 35), `0-23/2`, `8-11`, `jan-mar`, `mon,wed,fri`; the cron.c comment's three cases; the alias expansions of the manual.

**Vectors (named, with expected result, error kind and message key):**
- **Valid:** about 150, covering every syntax kind, every alias, names in any case, 0/7 Sunday (`0`, `7`, `sun`, `0,7`, `5-7`, `1-7`, `0-7`), `*/n` and `a-b/n` over each field's range, lists with duplicates, steps larger than the range, `007`.
- **Invalid:** about 100: every message of section 9, field counts 0 to 7, empty fields and lists, out-of-range values (`60`, `24`, `0` for day, `13`, `8`), `*/0`, `*-5`, `1-5-7`, `*/5/2`, names in the wrong fields, `monday`, uppercase aliases, `@reboot`, non-ASCII, tabs and odd whitespace, 0-padded numbers beyond 3 characters.
- **Day-field vectors:** the whole truth table of section 6.3, plus `*,3`, `1,*`, `*/2` in each day field, `1-31`, `0-7`, `*/1`, aliases; each with the matching days of a full year.
- **Single-value steps:** `0/35`, `5/10`, `*/35`, `0-59/35`, `5-5/2`.
- **Sunday 0/7:** every combination in the day-of-week field and in ranges.
- **Leap and rare:** `0 0 29 2 *` from 2026 (next 2028-02-29, 2032, 2036 ...; 2100 is skipped, 2104 follows), `0 0 31 2 *`, `0 0 30 2 *` and `0 0 31 4,6,9,11 *` (never), `0 0 29 2 */7` (AND with a weekday: rare).
- **UTC boundaries:** a start exactly on a minute boundary (excluded), 1 ms before a boundary (included), 31 December to 1 January, the end of February in leap and non-leap years, the year 2100, a start in 2099.
- **Hostile:** 256 and 257 characters, 10,000 characters, 1,000 commas, `*/` repeated, Unicode digits and look-alikes, HTML text, NUL and control characters, numbers of 1,000 digits.
- **Seeded sample** (fixed seed): about 400 generated expressions with start instants, over all shapes.
- **Digests of exhaustive sweeps:** every string up to length 5 over a small alphabet (`*`, `/`, `,`, `-`, digits 0 1 5 9, one letter, a space) for one numeric field and for the day-of-week field: accepted or refused, and the value set; and, for every accepted day-field pair of a fixed list, the matching days of a leap and a non-leap year.
- **Summary vectors:** for every eligible template, the expected sentence and the **set of matching minutes of a reference week and month**, so the sentence is verified against matches, not against the builder.

## 17. Tests (risk-based; no broad regression)
- **Unit (`tests/unit/cron-explainer.test.mjs`):** all vectors and digests against the engine; every error message; the intermediate result (`startsWithStar` is taken from text, so `*/2` and `1,*` differ though their sets are equal); the next-run rules; civil-date routines against the oracle's calendar for a wide range of days; the summary builder against matching sets; the work bound (the worst schedule finishes at once); source checks (no `eval`, no `Function`, no `Date` for matching, no regular expression with nested quantifiers, no network or storage); wording scan (no "guaranteed", no claim of compatibility with other dialects); **mutation tests**: the day rule's AND and OR branches, the `startsWithStar` source, the Sunday merge, the `n/s` refusal, the strict-future start, the 400-year horizon, the leap-year rule, and the reversed-range refusal, each caught, then reverted.
- **Browser (`tests/browser/cron-explainer.spec.js`, `subpath-desktop` and `subpath-mobile`, one worker):** the examples and their exact explanations and five UTC times (with a controlled clock); each error message and its `aria` link; the notes (OR, AND, `1-31`); the dialect line and the dialects table; Copy buttons (stubbed clipboard, never read) and Reset with focus; announcements; keyboard path; hostile text (nothing runs, nothing becomes a link); **privacy** (no non-GET or fetch/XHR/beacon request, empty storage, unchanged address and title, nothing logged); 320, 360 and 390 px with the longest accepted expression and a full-width table (no page-level overflow, readable text, 44 px targets); Developer Tools listing, related tool and search.
- **Integration and static:** the pinned unit tests, the Developer Tools counts in the specs above, regenerated inventory, links, assets and SEO checks, the affected DOM, links and SEO baselines and the two listing visuals (reviewed by eye), plus the Growth ledger validation of section 15 (`export.mjs --check`). **Visual baseline for the new page: none by default** (decision 11). Rulebook section 10, item 5 allows visual tests only for changed surfaces; the new page has no existing baseline to protect, so none is required unless the testing rules at implementation time demand one, in which case it is raised, not added silently.
- **Manual (at the Roadmap R1 milestone):** real Android and Safari/WebKit. Until a real device or browser has actually been tested, both are reported **unverified**; emulation and Chromium results are never presented as Android or Safari results.
- **Phase approvals:** each of the three phases (section 22) needs its own explicit approval before it is committed, and approving this specification does not approve a commit, a push or a deployment (rulebook section 11, items 2 and 7). `toolzenhub.in` is never touched.

## 18. Quality gate
All eight rule 12 gates pass on the current information: a real problem; not a duplicate of an existing tool; output reliable **given** a named, pinned and verified dialect and refusal of other syntax; the maintenance burden is low (no changing data; a re-check against cronie only if the project changes the parser); no API; no privacy risk; good on a phone by design; not added for the count. Weighted score about 3.40, search and retention being hypotheses.

## 19. Risks
- **Dialect confusion** (the main risk): mitigated by naming cronie explicitly, the dialect line, the refusal messages and the comparison table limited to sourced cells.
- **Semantics drift:** other cron implementations (including other Linux crons and distribution builds of cronie) may differ on edge cases (reversed ranges, steps after a number, how `*/2` counts); mitigated by pinning to cronie, refusing the quirks, and recording the source version read. This risk is not eliminated, because those implementations were not read.
- **Comparison-table accuracy:** documentation changes; mitigated by dating each source and removing any cell that cannot be re-confirmed.
- **Shared-reading risk in the golden reference:** mitigated by the independence requirements of section 16.
- **Overconfident summaries:** mitigated by the eligible-shapes rule and by testing each sentence against matching sets.
- **UTC mistaken for local time:** stated beside the list; no time-zone selection.
- **Verification gap:** no real cronie binary was run, and the revision of the 2026-10-12 source re-read was not recorded (section "Selection and verification record"). Android and Safari/WebKit are unverified until tested.

## 20. Explicit exclusions (V1)
Other dialects and auto-detection, seconds, years, `?` `L` `W` `#`, `@reboot`, `~`, `n/s`, reversed ranges, time-zone selection, daylight-saving simulation, a cron builder or generator, running or testing commands, a crontab file or multi-line parser, URL state, saved expressions, sharing links, imagery and articles, any dependency.

## 21. Decisions for your approval
Decisions agreed 2026-10-12 (recorded below as "provisionally accepted" in the review wording). The owner approved this specification on 2026-10-12, subject to the Quartz field-order verification, which is done. Approval of the specification does **not** authorize implementation, a push or a deployment; Phase 1 starts only on a separate instruction.

**Remaining verification obligations for implementation:** record the exact cronie commit read; rebuild the independent Python reference and reproduce the truth table by machine; re-confirm every published comparison cell from its source page and remove any that cannot be; re-check counts, pinned tests and the growth-manifest tests at the start of Phase 2; run `export.mjs --check` after the Phase 2 commit; optionally cross-check against a real cronie (none has been run); Android and Safari/WebKit remain unverified until tested.
1. The dialect name "Cronie crontab syntax, five time fields" and the cronie-pinned, five-field scope; no claim about other Linux crons. (Provisionally accepted, with the naming correction.)
2. Refusing `?` although Kubernetes accepts it as `*`. (Provisionally accepted.)
3. Accepting `@midnight` (in cronie's source, not its manual page) with a note. (Provisionally accepted.)
4. Refusing every reversed range (including `n-0`) as a V1 restriction. (Provisionally accepted.)
5. Refusing `n/s` (verified as a cronie syntax error), with a message that names GitHub Actions, Quartz and AWS as documenting a start value with a step. (Provisionally accepted, with the message correction.)
6. Accepting a step larger than the range with a note (cronie warns but accepts). (Provisionally accepted.)
7. Including the next five **UTC** runs, with a full-cycle (146,097-day) exact search, and no time-zone selection. (Provisionally accepted.)
8. Related tools: only the Unix Timestamp Converter; the Time Zone Converter not linked (rulebook 4.2). (Provisionally accepted.)
9. An explicit **Explain** action rather than live explanation while typing. (Provisionally accepted.)
10. The input limits of section 7 (256 characters, 64 per field, 32 list items, 3-character numbers). (Provisionally accepted.)
11. **No dedicated visual baseline by default** for the new page; one is added only if the applicable testing rules demand it (rulebook section 10, item 5). (Provisionally accepted.)
12. **Additional cron dialects are not approved and are deferred.** A later separate, named Quartz or AWS mode (never auto-detected, never mixed into this parser) is revisited only with evidence. (Provisionally accepted.)

## 22. Estimated effort
Three focused phases, each needing its own approval before its commit (section 17): (1) the parser, the matching engine, the independent Python reference and the unit tests (nothing is published, so no catalog or ledger change); (2) the page, CSS, registry, navigation, Developer Tools metadata, the Growth ledger record and the browser tests; (3) review, targeted fixes and the final checkpoint, with the Android and Safari/WebKit check left to the milestone and reported unverified until done. The largest uncertainty is the real-device check; the largest risk is the summary builder, which is why it is limited to a small set of shapes.

## 23. Rulebook note
This specification proposes **no new permanent rule**. Pinning a third-party syntax to its source and verifying it against that source is recorded here as a tool decision. Rulebook references re-checked against `docs/product-decision-rules.md` on 2026-10-12: rule 1.4 (AI-era test), 4.2 (sections), 4.3 (routes), section 6 items 6 and 7 (Growth identity ledger and manifest export), section 10 items 5, 6 and 13 (visual tests, pinned expectations, manual testing at milestones), section 11 items 2 and 7 (flow and approval boundaries) and the eight mandatory gates of section 12 all exist as cited; `docs/tool-pack-factory.md` section 10 holds Roadmap R1, unchanged by this revision (2 of 8 complete).

## 24. Implementation notes
Written in Phase 3 (2026-10-12). Facts only; where something differs from the specification above, it is listed under "Deviations".

**Architecture.**
- `assets/js/tools/cron-explainer/cron-engine.js`: the pure engine (no DOM, network, storage, `Date`, regular expression or dependency). Four parts kept apart: civil-date routines (integer arithmetic), a hand-written scanner producing the intermediate result, the day rule and the next-run search, and the explanation (field meanings, a summary for a few exact shapes, notes). Exports `parseCron`, `nextRuns`, `explainCron`, `summarize`, `renderSummary`, `matchesDate`, `formatRun` and the calendar helpers.
- `assets/js/tools/cron-explainer/index.js`: the page (`markup`, `render`, `init`; `showRelatedCalculators` and `showRelatedArticles` false). It calls `explainCron` once per Explain with `Date.now()` and repeats none of the engine's rules. All text from the expression is written with `textContent`.
- `assets/css/tools/cron-explainer.css`, registered in `src/_data/toolStyles.json`.
- Catalog: `assets/js/data/tools.js` (id `cron-expression-explainer`, Developer Tools, `autoRelated: false`, related `unix-timestamp-converter` only); `assets/js/data/categories.js` (`seoDescription` and `summary` of Developer Tools).
- Growth ledger: `scripts/growth-manifest/identity-ledger.json`, one record (module `assets/js/tools/cron-explainer/index.js`, provenance `added`, state `active`), committed with the catalog entry. `node scripts/growth-manifest/export.mjs --check` passed after the Phase 2 commit (27 tools, 34 articles, 111 guarded files); it must be run again after the Phase 3 commit and before any push. `--write` was never run.
- Build and inventory: 79 live pages (was 78) and the page is in the sitemap. Both builds (`dist`, `dist-ghpages`) are clean, and the link, asset and SEO checks pass.

**Dialect.** Cronie crontab syntax with five time fields (section 3), the seven lowercase aliases, nothing else. No other dialect is read, and the page and the messages do not claim compatibility with other cron programs.

**Engine and oracle provenance.**
- Source: cronie `master` at `59a3d15672d5738f5b6f76c843f200ef40ac5810` (committed 2026-09-25), which the GitHub API reported as the head of `master` on 2026-10-12. `src/entry.c`, `src/cron.c`, `src/macros.h` and `man/crontab.5` were fetched at that exact revision; their SHA-256 hashes are recorded in `tests/fixtures/cron-golden.json`.
- `tests/fixtures/cron-golden.py` is a line-by-line port of cronie's field parser (`load_entry`, `get_list`, `get_range`, `get_number`, `set_element`), a brute-force `datetime` next-run scan (minute by minute for a year and day by day over 146,097 days), and values from the manual page and the `cron.c` comment. It never reads or runs the JavaScript; only it writes the JSON. Two runs give byte-identical output.
- The JavaScript caught one mistake in the oracle during Phase 1 (the Sunday 0/7 merge was not applied to `@weekly`); the oracle was fixed against the C source, and the engine had been right.
- **No cronie binary was built or run.** Everything is source-level.

**Testing performed.**
- Phase 1: 75 unit tests against the reference (281 parse vectors: 143 accepted, 138 refused, 27 labelled "accepted by cronie, refused by V1"; 449 next-run vectors; the 12-row truth table; 68 summary vectors, with the matching minutes of 2026 re-derived from each structured form; 678 civil-date samples; 400 day-field pairs over a leap and a non-leap year; digests of two exhaustive sweeps of 66,429 and 111,110 strings) and 10 mutation tests, each caught.
- Phase 2: a browser spec for the page (explain only on request, errors, Reset, keyboard, focus, live region, hostile text, copy, privacy, 320/360/390 px, related tool, search, refresh), the pinned unit and browser literals (Developer Tools 4 to 5, groups 16 to 17, 39 search tools), and the regenerated inventory and baselines (DOM, SEO, links, and five listing screenshots reviewed by eye). No dedicated visual baseline for the page (decision 11).
- Phase 3: a fresh-seed differential run against the Python reference (3,512 expressions including 564 deliberately mutated ones, 2,948 five-run searches, no mismatch; run from the scratch area and not committed); Lighthouse on the page; in-browser timing under a 4x CPU slowdown (an Explain paints in under 70 ms after the first, including a full-cycle "never" search); a text-size test at 200%.
- Not run: any real device, Safari/WebKit (none is installed here) and a real cronie.

**Deviations from the specification.**
1. `* * * * *` is summarised ("Every minute, every day"); the specification's list of shapes did not include it (owner-approved, decision A of Phase 1).
2. The separate sentence "on days that are both ..." for one star field and one restricted field is not produced: a plain `*` already reads as "on Friday", and a star with a step is never summarised.
3. The 32-item list limit can never be the reported error, because 33 items need 65 characters and a field is limited to 64 (owner-approved, decision B). The check stays in the engine as a defensive guard.
4. Only space and tab are trimmed from the ends; any other whitespace is a "not allowed" error naming the character and position. Positions are 1-based in the text as typed.
5. `nextRuns` and `explainCron` throw `RangeError` for a clock that is not a finite number within the range of a JavaScript date; the page always passes `Date.now()`.
6. The summary sentence is shown with a closing full stop; the engine's sentence has none.
7. The engine marks code in messages and notes with backticks (the strings the specification gives). The page shows that text as code and keeps the words, and its announcements leave the marks out; if the expression itself held a backtick, the message is shown exactly as it is. The engine's strings and error contract are unchanged.
8. The dialect comparison on the page is the section 5 table reduced to sourced cells (a dash means no claim); the POSIX column is not shown.
9. The Growth unit test `tests/unit/growth-manifest-ledger.test.mjs` now accepts the tool provenance `added` as well as `bootstrap`, as the ledger code and `docs/growth-manifest.md` allow (owner-approved in Phase 2).

**Known limitations.**
- UTC only; daylight saving is not modelled; "now" is the device clock.
- Cronie `master` may differ from distribution builds, and other cron programs were not read.
- Lighthouse accessibility is 93 (desktop and mobile) for the page, against 92 for the JWT Decoder and the JSON Formatter. Every finding is in the shared layer and also appears on those pages: the site's green link colour (`#0b9f58`) on the breadcrumb, the eyebrow label and in-text links (3.3 to 3.4:1), links in text distinguished by colour only, and the header brand and footer links whose accessible name omits their visible text. None is in this tool's own elements and none was changed here (rulebook 7.5: judge it in the shared layer first). Lighthouse mobile performance is 81 (JWT Decoder 76, JSON Formatter 85) under simulated throttling with fonts blocked; it is informational.

**Remaining platform verification.** Real Android and Safari/WebKit stay unverified until tested at the Roadmap R1 milestone. Roadmap R1 is not changed by this work.
