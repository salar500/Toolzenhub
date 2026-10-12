# Session handoff template

Copy this, fill it in, and keep it to one screen. Put it at the end of a session or phase, or when a session is getting long, and paste it at the start of the next one instead of replaying history. It records state; it authorizes nothing. The rules live in `docs/product-decision-rules.md` (delivery and approvals: section 11; maintenance: section 15) and are not repeated here.

Fill the Git lines from `node scripts/dev/checkpoint.mjs` (read-only: no fetch, it checks nothing about the application), never from memory.

```
HANDOFF  <date>  <project / tool pack>

Git (from the checkpoint script, not memory)
  branch / HEAD:    <branch>  <short sha> <subject>
  upstream:         <ahead N / behind N, or none>
  working tree:     <clean | dirty: files>

Milestone completed:   <one line, with the commit(s)>
Current phase:         <name>, status: <not started | in progress | done, uncommitted | committed>
Next approved action:  <exactly one, as the owner approved it>
Pending approvals:     <what still needs the owner's yes: commit / push / deploy / rule change / scope>

Unverified or blocked: <checks not run or not possible, with the reason; known blockers; "none">
Restrictions in force: <commit / push / deploy state, e.g. "no commit, no push, no deploy until approved"; Hostinger production untouched>

Where things are
  spec:      <docs/tool-packs/NN-name.md>
  evidence:  <test output, logs or files kept locally, with paths; not pasted here>
  last Growth check: <result and the commit it ran on, or "not run since <commit>">

Rule changes this phase: <named, or "none">
```

Notes
- One next action, not a list. If nothing is approved yet, write "wait for approval".
- Do not paste logs, diffs, specs or earlier reports: point to their location.
- After an interruption, run the checkpoint script first and compare it with the Git block above; trust the repository over this note if they differ.
