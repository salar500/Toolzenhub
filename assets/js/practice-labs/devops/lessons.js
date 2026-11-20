/* =========================================================
   ToolZen Hub
   Git and DevOps Foundations path: lessons (original to this site; Git behaviour as documented at git-scm.com). Git
   tasks run in an in-page simulator (gitsim blocks); nothing touches the learner's computer.
========================================================= */

export const lessons = [
    {
        id: "git-why", title: "Version control and your first commit", level: "beginner", prerequisite: "None.",
        objectives: ["Explain what version control is for", "Describe the working tree, staging area and commits", "Make a first commit"],
        intro: "Version control records the history of a project, so you can see what changed, when and why, go back to earlier versions and work in parallel with others. Git keeps three areas: the working tree (your files), the staging area or index (what the next commit will contain) and the repository (the commits). git add moves changes into the staging area; git commit records them.",
        blocks: [
            { type: "example", title: "The three areas", text: "working tree  --git add-->  staging area  --git commit-->  repository\n(your files)                (next commit)                 (history)\n\ngit status shows what is in each." },
            { type: "gitsim", heading: "Your turn: a first commit", task: "git-t-first-commit" }
        ],
        why: "Every software team uses Git. Developers, testers who automate, data engineers and DevOps engineers all commit code daily, and interviews expect the basics.",
        analogy: "The staging area is a packing table: you put on it exactly what goes in the next parcel (the commit) before sealing it.",
        mistakes: ["Committing everything with one vague message.", "Not running git status before committing.", "Treating commits as backups instead of meaningful steps."],
        check: [
            { q: "What does git add do?", a: "Copies the current version of a file into the staging area for the next commit." },
            { q: "What makes a good commit message?", a: "A short, specific summary of the change and why, such as 'Fix delivery fee for orders of exactly 999'." }
        ],
        summary: "Git tracks history through the working tree, the staging area and commits; check git status, stage with git add and record with git commit."
    },
    {
        id: "git-staging", title: "Staging carefully, unstaging and discarding", level: "beginner",
        objectives: ["Make focused commits", "Unstage a file", "Discard a change safely"],
        intro: "Good commits contain one logical change. Stage files individually rather than everything at once. git restore --staged <file> takes a file out of the staging area without changing your copy, and git restore <file> throws away your uncommitted edits to it. Secrets such as API keys must never be committed; .gitignore lists files Git should ignore.",
        blocks: [
            { type: "gitsim", heading: "Your turn: commit only the fix", task: "git-t-partial" },
            { type: "gitsim", heading: "Your turn: unstage a secret", task: "git-t-unstage" },
            { type: "gitsim", heading: "Your turn: discard an experiment", task: "git-t-discard" }
        ],
        why: "Leaked keys in public repositories are found by bots within minutes. Focused commits make review, debugging and reverting much easier.",
        analogy: "git restore --staged takes an item back off the packing table; git restore puts the item back to how it was when you last packed it.",
        mistakes: ["git add . without looking.", "Committing .env files.", "Discarding changes you meant to keep."],
        check: [
            { q: "How do you unstage a file but keep your changes?", a: "git restore --staged <file>." },
            { q: "What is .gitignore for?", a: "Listing files Git should not track, such as secrets, build output and dependencies." }
        ],
        summary: "Stage deliberately, unstage with git restore --staged, discard edits with git restore, and keep secrets out with .gitignore."
    },
    {
        id: "git-branches", title: "Branches and merging", level: "intermediate",
        objectives: ["Create and switch branches", "Merge a branch", "Tell fast-forward from merge commits"],
        intro: "A branch is a movable name for a line of commits. Work on a feature in its own branch so main stays releasable. git switch -c name creates a branch and switches to it; git merge brings another branch's commits in. If main has not moved, Git fast-forwards; otherwise it creates a merge commit with two parents.",
        blocks: [
            { type: "gitsim", heading: "Your turn: start a feature branch", task: "git-t-branch" },
            { type: "gitsim", heading: "Your turn: commit and merge", task: "git-t-merge" }
        ],
        why: "Branching is how teams work in parallel, review changes in pull requests and keep production stable.",
        analogy: "A branch is a bookmark you move forward as you write; merging copies the chapters from one bookmark's line into another's.",
        mistakes: ["Working directly on main.", "Long-lived branches that drift far from main.", "Merging without pulling the latest main first."],
        check: [
            { q: "What is a fast-forward merge?", a: "When the current branch has no new commits, Git just moves its name to the other branch's latest commit." },
            { q: "How many parents does a merge commit have?", a: "Two." }
        ],
        summary: "Use branches for features, switch with git switch and merge back; Git fast-forwards when it can and creates a merge commit when both sides moved."
    },
    {
        id: "git-safety", title: "Switching safely, conflicts and remotes", level: "intermediate",
        objectives: ["Understand why Git refuses to switch", "Explain merge conflicts", "Describe push, pull and pull requests"],
        intro: "Git protects uncommitted work: it refuses to switch branches when changes would be lost, so commit them (or stash them) first. A merge conflict happens when both branches changed the same part of a file; Git marks the conflict in the file, you edit it to the right result, then add and commit. Remotes such as GitHub hold shared copies: git pull brings others' commits in, git push sends yours, and pull requests are where changes are reviewed before merging.",
        blocks: [
            { type: "gitsim", heading: "Your turn: rescue unfinished work", task: "git-t-switch-blocked" },
            { type: "example", title: "A conflict, as Git marks it", text: "<<<<<<< HEAD\nconst FREE_OVER = 999;\n=======\nconst FREE_OVER = 1499;\n>>>>>>> feature/new-threshold\n\nEdit to the correct value, delete the markers, then:\ngit add delivery.js\ngit commit" },
            { type: "order", heading: "Your turn: a pull request flow", prompt: "Put the steps of contributing a change through a pull request in order.", items: ["Pull the latest main", "Create a feature branch", "Commit focused changes", "Push the branch to the remote", "Open a pull request and address review comments", "Merge after approval and passing checks"], explain: "Start from the latest main, work on a branch, push, review, then merge." }
        ],
        why: "Conflicts and lost work are the two things that scare people about Git. Knowing why they happen makes both routine.",
        analogy: "A conflict is two editors changing the same sentence: someone has to decide the final wording.",
        mistakes: ["Force-pushing over others' work.", "Resolving conflicts by deleting the other side without reading it.", "Huge pull requests nobody can review."],
        check: [
            { q: "When does a merge conflict happen?", a: "When both branches changed the same lines of a file differently since they diverged." },
            { q: "What is a pull request?", a: "A request to merge a branch, where the change is reviewed and checks run first." }
        ],
        summary: "Commit or stash before switching, resolve conflicts by editing the marked file, and share work through pull, push and reviewed pull requests."
    },
    {
        id: "devops-ci-cd", title: "Continuous integration and delivery", level: "intermediate",
        objectives: ["Explain CI and CD", "Read a pipeline's stages", "Describe a quality gate"],
        intro: "Continuous integration (CI) builds and tests every change automatically, so problems are found within minutes. Continuous delivery (CD) keeps the main branch always releasable and automates the release steps; continuous deployment goes further and releases every passing change. A pipeline is a series of stages, and a failing stage stops the line.",
        blocks: [
            { type: "example", title: "A pipeline (GitHub Actions style)", text: "on: [push, pull_request]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm ci\n      - run: npm run lint\n      - run: npm test\n      - run: npm run build" },
            { type: "order", heading: "Your turn: order the stages", prompt: "Order a typical delivery pipeline for a web app.", items: ["Check out the code and install dependencies", "Lint and run unit tests", "Build the application", "Run integration and end-to-end tests", "Deploy to a staging environment", "Deploy to production after approval or checks"], explain: "Fast, cheap checks first; slower tests later; production last, behind a gate." },
            { type: "quiz", questions: [
                { q: "What should happen when a test fails in CI?", options: ["The pipeline stops and the change is not merged until fixed", "Ignore it if it passed yesterday"], answer: 0, explain: "A failing gate protects main; flaky tests must be fixed, not ignored." }
            ] }
        ],
        why: "CI/CD is how modern teams ship safely many times a day. Testers increasingly own the tests that run in it.",
        analogy: "A pipeline is an assembly line with inspectors: a part that fails inspection never reaches the customer.",
        mistakes: ["Slow pipelines that people bypass.", "Ignoring red builds.", "Deploying to production without a staging check."],
        check: [
            { q: "CI versus continuous deployment?", a: "CI builds and tests every change; continuous deployment also releases every passing change automatically." },
            { q: "Why run fast checks first?", a: "To give quick feedback and save time when something basic is broken." }
        ],
        summary: "CI tests every change automatically, CD keeps main releasable and automates releases, and pipeline gates stop broken changes."
    },
    {
        id: "devops-containers", title: "Containers and Docker", level: "advanced",
        objectives: ["Explain what a container is", "Read a Dockerfile", "Tell images from containers"],
        intro: "A container packages an application with everything it needs (runtime, libraries, configuration) so it runs the same on a laptop, a test server and production. An image is the packaged template, built from a Dockerfile; a container is a running instance of an image. Containers share the host's operating system kernel, which makes them lighter than virtual machines.",
        blocks: [
            { type: "example", title: "A Dockerfile for a Node.js app", text: "FROM node:22-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --omit=dev\nCOPY . .\nEXPOSE 8080\nCMD [\"node\", \"server.js\"]\n\n# build and run\ndocker build -t shoplite .\ndocker run -p 8080:8080 shoplite" },
            { type: "quiz", heading: "Your turn", questions: [
                { q: "Why copy package.json and install before copying the rest?", options: ["So the dependency layer is cached and rebuilt only when dependencies change", "It is required syntax"], answer: 0, explain: "Docker caches layers; ordering them well makes builds fast." },
                { q: "Image or container: the running process?", options: ["Container", "Image"], answer: 0, explain: "An image is the template; a container is an instance of it." },
                { q: "Where should a database password come from?", options: ["An environment variable or secret store at run time", "Written into the Dockerfile"], answer: 0, explain: "Images are shared; secrets baked into them leak." }
            ] }
        ],
        why: "Containers removed the 'works on my machine' problem and underpin most cloud deployments and test environments.",
        analogy: "A container is a shipping container: whatever is inside, every port and ship handles it the same way.",
        mistakes: ["Secrets in images.", "Huge images with build tools left in.", "Running as root without need."],
        check: [
            { q: "What does a Dockerfile describe?", a: "How to build an image, step by step." },
            { q: "Why are containers lighter than virtual machines?", a: "They share the host kernel instead of each running a full operating system." }
        ],
        summary: "Images are built from Dockerfiles and run as containers that behave the same everywhere; order layers for caching and keep secrets out."
    },
    {
        id: "devops-cloud", title: "Cloud computing basics", level: "advanced",
        objectives: ["Tell IaaS, PaaS and SaaS apart", "Explain regions, scaling and the shared responsibility model", "Describe infrastructure as code"],
        intro: "Cloud providers rent computing on demand. Infrastructure as a service gives virtual machines and networks; platform as a service runs your code without managing servers; software as a service is a finished application. Resources live in regions, scale up and down with demand, and are increasingly described as code (for example Terraform) so environments can be recreated exactly.",
        blocks: [
            { type: "quiz", heading: "Your turn", questions: [
                { q: "A managed service runs your web app from code; you never patch servers. This is:", options: ["PaaS", "IaaS", "SaaS"], answer: 0, explain: "Platform as a service manages the servers for you." },
                { q: "Under the shared responsibility model, who secures your data and access settings in the cloud?", options: ["You, the customer", "Only the provider"], answer: 0, explain: "The provider secures the cloud; you secure what you put in it, such as permissions and data." },
                { q: "Why describe infrastructure as code?", options: ["Environments become repeatable, reviewable and versioned", "It is cheaper per server"], answer: 0, explain: "The same Git and review practices then apply to infrastructure." },
                { q: "A public storage bucket exposes customer files. The most likely cause?", options: ["A misconfigured access setting", "A provider outage"], answer: 0, explain: "Misconfiguration is the most common cause of cloud data leaks." }
            ] }
        ],
        why: "Most new systems run in the cloud. Every engineering role meets it, and cloud misconfiguration is a leading source of breaches.",
        analogy: "The cloud is renting a fully serviced office: you choose the space and lock your own cabinets, the landlord runs the building.",
        mistakes: ["Public storage by accident.", "Manual changes nobody recorded.", "Paying for idle resources."],
        check: [
            { q: "What is a region?", a: "A geographic area where a provider's data centres are, chosen for latency, law and resilience." },
            { q: "Name a benefit of infrastructure as code.", a: "Repeatable, reviewable, versioned environments." }
        ],
        summary: "Choose IaaS, PaaS or SaaS by how much you manage, secure your side of the shared responsibility model, and define infrastructure as code."
    },
    {
        id: "devops-monitoring", title: "Monitoring, logging and incidents", level: "advanced",
        objectives: ["Tell logs, metrics and traces apart", "Set meaningful alerts", "Run a blameless incident review"],
        intro: "Once software is live, teams need to know how it behaves. Logs record events, metrics measure numbers over time (request rate, error rate, latency) and traces follow one request across services. Alerts should fire on symptoms users feel, such as errors and slowness, not on every small blip. After an incident, a blameless review finds causes and fixes in the system, not someone to blame.",
        blocks: [
            { type: "order", heading: "Your turn: handling an incident", prompt: "Order the steps of handling a production incident.", items: ["Detect it from an alert or user reports", "Assess impact and communicate status", "Mitigate (roll back, disable the feature)", "Find and fix the root cause", "Hold a blameless review and track follow-up actions"], explain: "Restore service first, then fix properly, then learn." },
            { type: "quiz", questions: [
                { q: "Which alert is most useful?", options: ["Error rate above 2% for 5 minutes", "CPU above 60% for 10 seconds"], answer: 0, explain: "Alert on symptoms users feel, with a sensible duration." },
                { q: "Logs should never contain:", options: ["Passwords, tokens or full card numbers", "Timestamps"], answer: 0, explain: "Logs are widely accessible and kept for a long time." }
            ] }
        ],
        why: "Fast detection and calm recovery limit damage. Testers who understand monitoring also write better checks for production.",
        analogy: "Monitoring is a car's dashboard: you watch speed and warnings while driving, not only at the annual service.",
        mistakes: ["Alert fatigue from noisy alerts.", "Secrets in logs.", "Reviews that blame people instead of fixing systems."],
        check: [
            { q: "Logs, metrics, traces: which follows one request across services?", a: "Traces." },
            { q: "What should be the first priority in an incident?", a: "Restoring service for users (mitigation), then fixing the cause." }
        ],
        summary: "Observe with logs, metrics and traces, alert on user-facing symptoms, mitigate first in incidents and learn through blameless reviews."
    }
];

export const interview = {
    howTo: "Answer each question before opening the explanation. DevOps interviews reward practical judgement, so read the reasoning.",
    description: "12 Git and DevOps interview questions with explained answers: staging, branches, merges, conflicts, CI/CD, containers, cloud and monitoring.",
    coding: [],
    quiz: [
        { q: "What is the staging area?", options: ["Where you prepare exactly what the next commit contains", "A remote server"], answer: 0, explain: "Also called the index." },
        { q: "git merge versus git rebase?", options: ["Merge joins histories with a merge commit; rebase replays commits on a new base", "They are identical"], answer: 0, explain: "Never rebase commits others already use." },
        { q: "How do you undo a commit already pushed and shared?", options: ["git revert, which adds a new commit undoing it", "Delete the remote"], answer: 0, explain: "Rewriting shared history breaks others." },
        { q: "A secret was committed and pushed. What first?", options: ["Revoke and rotate the secret, then remove it from history", "Just delete the file in a new commit"], answer: 0, explain: "It stays in history and may already be copied." },
        { q: "What is a fast-forward merge?", options: ["Moving the branch name forward when there are no divergent commits", "A merge that skips tests"], answer: 0, explain: "No merge commit needed." },
        { q: "What is CI?", options: ["Building and testing every change automatically", "A cloud provider"], answer: 0, explain: "Fast feedback on every change." },
        { q: "Continuous delivery versus continuous deployment?", options: ["Delivery keeps releases ready; deployment releases every passing change automatically", "The same"], answer: 0, explain: "Deployment removes the manual release step." },
        { q: "Image versus container?", options: ["An image is a template; a container is a running instance", "The same"], answer: 0, explain: "Many containers can run from one image." },
        { q: "Why not put secrets in a Docker image?", options: ["Images are shared and stored; secrets leak", "Images cannot hold text"], answer: 0, explain: "Inject them at run time." },
        { q: "What is infrastructure as code?", options: ["Defining infrastructure in versioned files", "Writing code on servers"], answer: 0, explain: "Repeatable and reviewable." },
        { q: "Logs, metrics or traces for latency across microservices?", options: ["Traces", "Logs only"], answer: 0, explain: "Traces follow a request end to end." },
        { q: "What is a blameless postmortem?", options: ["A review focused on system causes and fixes, not blame", "A meeting to find who failed"], answer: 0, explain: "Blame hides information; learning needs openness." }
    ]
};
