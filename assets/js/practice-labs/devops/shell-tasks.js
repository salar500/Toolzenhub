/* =========================================================
   ToolZen Hub
   Linux path: shell simulator tasks on a small ShopLite server folder. Each has a goal checked on the shell's state or
   the last command's output, and a model command sequence (pinned by tests/unit/shell-sim.test.mjs).
========================================================= */

import { fileContent, isDir } from "./shell-sim.js";

const H = "/home/asha/shoplite";
const LOG = [
    "2026-11-08 09:00:01 INFO  server started on port 8080",
    "2026-11-08 09:02:14 INFO  GET /api/products 200",
    "2026-11-08 09:03:40 ERROR payment gateway timeout order=SL-1004",
    "2026-11-08 09:05:12 WARN  slow query 1840 ms",
    "2026-11-08 09:07:55 INFO  POST /api/cart/items 201",
    "2026-11-08 09:09:30 ERROR payment gateway timeout order=SL-1009",
    "2026-11-08 09:11:02 INFO  GET /api/orders 401",
    "2026-11-08 09:12:48 ERROR database connection refused"
].join("\n") + "\n";
const CSV = "order,city,total\nSL-1001,Pune,1299\nSL-1002,Delhi,499\nSL-1003,Pune,2150\nSL-1004,Mumbai,349\nSL-1005,Chennai,3100\nSL-1006,Delhi,899\n";

export const SERVER = Object.freeze({
    cwd: "/home/asha",
    files: {
        [`${H}/README.md`]: "# ShopLite server\n",
        [`${H}/config.json`]: "{\"port\": 8080}\n",
        [`${H}/deploy.sh`]: "#!/bin/sh\necho deploying\n",
        [`${H}/.env`]: "API_KEY=never-commit-me\n",
        [`${H}/logs/app.log`]: LOG,
        [`${H}/logs/access.log`]: "GET / 200\nGET /cart 200\n",
        [`${H}/data/orders.csv`]: CSV
    }
});

const lastLines = (n) => LOG.trim().split("\n").slice(-n).join("\n") + "\n";
const errors = LOG.split("\n").filter((l) => l.includes("ERROR")).join("\n") + "\n";

export const SHELL_TASKS = Object.freeze([
    { id: "sh-t-navigate", task: "You are in your home folder. Move into shoplite/logs and list what is there.",
        goal: (sh) => sh.cwd === `${H}/logs` && /^ls\b/.test(sh.last.command) && sh.last.output === "access.log\napp.log\n",
        goalText: "You are in /home/asha/shoplite/logs and have listed its files.",
        model: ["pwd", "cd shoplite/logs", "ls"],
        explain: "cd changes the current directory; a path without a leading / is relative to where you are. pwd prints where you are and ls lists the contents." },
    { id: "sh-t-hidden", task: "List every file in the shoplite folder, including hidden ones (names starting with a dot).",
        goal: (sh) => /^ls\b/.test(sh.last.command) && sh.last.output.includes(".env"),
        goalText: "The listing shows the hidden .env file.",
        model: ["ls -a shoplite"],
        explain: "ls hides names starting with a dot; -a shows them. Hidden files such as .env often hold secrets." },
    { id: "sh-t-tail", task: "Show only the last 3 lines of shoplite/logs/app.log.",
        goal: (sh) => sh.last.output === lastLines(3),
        goalText: "The output is exactly the log's last 3 lines.",
        model: ["tail -n 3 shoplite/logs/app.log"],
        explain: "tail -n N shows the last N lines (head shows the first). tail -f follows a growing log on a real server." },
    { id: "sh-t-grep-count", task: "How many ERROR lines are in app.log? Get the shell to count them.",
        goal: (sh) => sh.last.output.trim() === "3" && /grep|wc/.test(sh.last.command),
        goalText: "The shell printed the number of ERROR lines.",
        model: ["cd shoplite/logs", "grep -c ERROR app.log"],
        explain: "grep -c counts matching lines; grep ERROR app.log | wc -l does the same with a pipe." },
    { id: "sh-t-pipe", task: "List the distinct cities in shoplite/data/orders.csv, sorted, without the header. Use cut, a pipe and sort.",
        goal: (sh) => sh.last.output === "Chennai\nDelhi\nMumbai\nPune\n",
        goalText: "The output is Chennai, Delhi, Mumbai and Pune, one per line.",
        model: ["cut -d , -f 2 shoplite/data/orders.csv | grep -v city | sort | uniq"],
        explain: "cut picks the second comma-separated field, grep -v removes the header line, sort groups equal values and uniq removes repeats (uniq only removes adjacent duplicates, so sort first)." },
    { id: "sh-t-redirect", task: "Save every ERROR line of app.log into a new file shoplite/errors.txt.",
        goal: (sh) => fileContent(sh, `${H}/errors.txt`) === errors,
        goalText: "shoplite/errors.txt contains exactly the three ERROR lines.",
        model: ["grep ERROR shoplite/logs/app.log > shoplite/errors.txt", "cat shoplite/errors.txt"],
        explain: "> sends a command's output into a file, replacing it; >> appends instead." },
    { id: "sh-t-backup", task: "Create a folder shoplite/backup and copy config.json into it.",
        goal: (sh) => isDir(sh, `${H}/backup`) && fileContent(sh, `${H}/backup/config.json`) === "{\"port\": 8080}\n" && fileContent(sh, `${H}/config.json`) !== null,
        goalText: "backup/config.json exists and the original is still in place.",
        model: ["cd shoplite", "mkdir backup", "cp config.json backup/", "ls backup"],
        explain: "mkdir creates a directory; cp copies (mv would move the original away). Copying into a directory keeps the file name." },
    { id: "sh-t-chmod", task: "deploy.sh cannot be run because it is not executable. Make it executable and check with ls -l.",
        goal: (sh) => /x/.test(sh.fs.get(`${H}/deploy.sh`).mode.split("").map((d) => (Number(d) & 1 ? "x" : "-")).join("")) && /^ls -l/.test(sh.last.command),
        goalText: "deploy.sh has execute permission and you listed it with ls -l.",
        model: ["cd shoplite", "chmod +x deploy.sh", "ls -l"],
        explain: "chmod +x adds execute permission; ls -l shows permissions as rwx for owner, group and others (rwxr-xr-x is 755)." },
    { id: "sh-t-find", task: "Find every .log file anywhere under shoplite.",
        goal: (sh) => /^find\b/.test(sh.last.command) && sh.last.output.includes("access.log") && sh.last.output.includes("app.log") && !sh.last.output.includes("README"),
        goalText: "The output lists both .log files and nothing else.",
        model: ["find shoplite -name \"*.log\""],
        explain: "find searches a directory tree; -name takes a pattern (quote it so the shell does not expand the *)." }
]);
