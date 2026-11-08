/* =========================================================
   ToolZen Hub
   Git path: simulator tasks. Each has a starting repository, a goal checked on the repository's state, and a model
   command sequence that reaches it (pinned by tests/unit/git-sim.test.mjs, which also checks the start does not).
   asset-check: simulated-file-names (strings such as "config.json" are files in the simulated repository, not site assets)
========================================================= */

import { status, branchHas, headCommit } from "./git-sim.js";

const BASE = [{ msg: "Start ShopLite", tree: { "README.md": "# ShopLite", "app.js": "v1", "config.json": "{\"port\": 8080}" } }];
const clean = (repo) => { const s = status(repo); return !s.staged.length && !s.unstaged.length && !s.untracked.length; };

export const GIT_TASKS = Object.freeze([
    {
        id: "git-t-first-commit", task: "You created coupon.js. Stage it and commit it with a clear message, so the working tree is clean.",
        scenario: { commits: BASE, work: { "coupon.js": "SAVE10 rules" } },
        goal: (r) => branchHas(r, "main", { "coupon.js": "SAVE10 rules" }) && clean(r) && headCommit(r).msg.length >= 5,
        goalText: "main's latest commit contains coupon.js and git status is clean.",
        model: ["git status", "git add coupon.js", "git commit -m \"Add SAVE10 coupon rules\"", "git status"],
        explain: "git add copies the file into the staging area (the index); git commit records everything staged as a new commit on the current branch."
    },
    {
        id: "git-t-partial", task: "You changed app.js (a real fix) and notes.txt (personal notes). Commit only app.js; leave notes.txt changed but uncommitted.",
        scenario: { commits: [{ msg: "Start ShopLite", tree: { ...BASE[0].tree, "notes.txt": "todo" } }], work: { "app.js": "v2 fix", "notes.txt": "todo, call Ravi" } },
        goal: (r) => branchHas(r, "main", { "app.js": "v2 fix", "notes.txt": "todo" }) && status(r).unstaged.some((x) => x.file === "notes.txt"),
        goalText: "The latest commit has the new app.js and the old notes.txt; notes.txt is still modified in the working tree.",
        model: ["git add app.js", "git commit -m \"Fix delivery fee rounding\"", "git status"],
        explain: "Stage files one by one to make focused commits. git add . would have committed the notes too."
    },
    {
        id: "git-t-unstage", task: "You ran git add . and staged secrets.env by accident. Unstage it, then commit only app.js. secrets.env must not be in any commit.",
        scenario: { commits: BASE, work: { "app.js": "v2", "secrets.env": "API_KEY=abc" }, index: { "app.js": "v2", "secrets.env": "API_KEY=abc" } },
        goal: (r) => branchHas(r, "main", { "app.js": "v2" }) && !("secrets.env" in headCommit(r).tree) && "secrets.env" in r.work,
        goalText: "main has the new app.js, no commit contains secrets.env, and the file still exists locally.",
        model: ["git status", "git restore --staged secrets.env", "git commit -m \"Update app\"", "git status"],
        explain: "git restore --staged removes a file from the staging area without touching your copy. Add secrets files to .gitignore so this cannot happen again."
    },
    {
        id: "git-t-discard", task: "You edited config.json while experimenting and want the committed version back. Discard the change.",
        scenario: { commits: BASE, work: { "config.json": "{\"port\": 9999}" } },
        goal: (r) => r.work["config.json"] === "{\"port\": 8080}" && clean(r),
        goalText: "config.json matches the last commit and the working tree is clean.",
        model: ["git status", "git restore config.json", "git status"],
        explain: "git restore <file> replaces the working copy with the staged (here, committed) version. The discarded edit cannot be recovered, so check first."
    },
    {
        id: "git-t-branch", task: "Start work on a new feature: create a branch called feature/free-delivery and switch to it.",
        scenario: { commits: BASE },
        goal: (r) => r.head === "feature/free-delivery" && r.branches["feature/free-delivery"] === r.branches.main,
        goalText: "You are on feature/free-delivery, which starts at main's latest commit.",
        model: ["git switch -c feature/free-delivery", "git branch"],
        explain: "git switch -c creates a branch at the current commit and switches to it (git checkout -b does the same in older tutorials)."
    },
    {
        id: "git-t-merge", task: "On feature/free-delivery you changed delivery.js. Commit it, switch back to main and merge the feature branch into main.",
        scenario: { commits: BASE, branches: { "feature/free-delivery": { commits: [] } }, head: "feature/free-delivery", work: { "delivery.js": "free over 999" } },
        goal: (r) => r.head === "main" && branchHas(r, "main", { "delivery.js": "free over 999" }) && clean(r),
        goalText: "main contains delivery.js and you are on main with a clean working tree.",
        model: ["git add delivery.js", "git commit -m \"Free delivery over 999\"", "git switch main", "git merge feature/free-delivery", "git log --oneline"],
        explain: "main had not moved, so Git fast-forwards: main simply points to the feature branch's commit. Had main moved, Git would create a merge commit."
    },
    {
        id: "git-t-switch-blocked", task: "You are on main with an unfinished change to app.js and must look at the hotfix branch. Git refuses to switch. Commit the change on a new branch wip/app instead, then switch to hotfix.",
        scenario: { commits: BASE, branches: { hotfix: { commits: [{ msg: "Hotfix: config port", tree: { "config.json": "{\"port\": 80}" } }] } }, work: { "app.js": "half done" } },
        goal: (r) => r.head === "hotfix" && branchHas(r, "wip/app", { "app.js": "half done" }) && branchHas(r, "main", { "app.js": "v1" }),
        goalText: "Your change is committed on wip/app, main is unchanged, and you are on hotfix.",
        model: ["git switch hotfix", "git switch -c wip/app", "git add app.js", "git commit -m \"WIP: app changes\"", "git switch hotfix"],
        explain: "Git will not switch when uncommitted changes to tracked files could be lost. Committing on a work-in-progress branch keeps them safe (git stash is another option)."
    }
]);
