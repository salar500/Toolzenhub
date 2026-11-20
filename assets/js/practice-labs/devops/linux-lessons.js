/* =========================================================
   ToolZen Hub
   Linux and the Command Line path: lessons (original to this site; command behaviour as in GNU coreutils and Bash).
   Practice runs in an in-page shell simulator (shellsim blocks).
========================================================= */

export const lessons = [
    { id: "lx-filesystem", title: "The Linux file system and navigation", level: "beginner", prerequisite: "None.",
        objectives: ["Read absolute and relative paths", "Move around with cd, pwd and ls", "Recognise key system folders"],
        intro: "Linux arranges everything in one tree starting at / (the root). Your home folder is /home/<user>, written ~ for short. An absolute path starts at /; a relative path starts from where you are, and .. means the parent folder. pwd prints the current directory, ls lists it and cd moves.",
        blocks: [
            { type: "example", title: "Key folders", text: "/home/asha     your files (~)\n/etc           system configuration\n/var/log       system and service logs\n/tmp           temporary files\n/usr/bin       installed programs" },
            { type: "shellsim", heading: "Your turn: find your way", task: "sh-t-navigate" },
            { type: "shellsim", heading: "Your turn: hidden files", task: "sh-t-hidden" }
        ],
        why: "Servers, containers and CI machines run Linux. Developers, testers and DevOps engineers use the command line to read logs, deploy and debug.",
        analogy: "The file system is a building: / is the entrance, folders are corridors and pwd tells you which room you are standing in.",
        mistakes: ["Confusing / (root) with ~ (home).", "Forgetting that names are case-sensitive.", "Getting lost: run pwd."],
        check: [{ q: "What does .. mean?", a: "The parent directory." }, { q: "Is logs/app.log absolute or relative?", a: "Relative: it has no leading /." }],
        summary: "Navigate one tree from /, using absolute or relative paths with pwd, ls and cd." },
    { id: "lx-reading", title: "Reading files and logs", level: "beginner",
        objectives: ["Show files with cat, head and tail", "Count with wc", "Read logs efficiently"],
        intro: "cat prints a whole file, head the first lines and tail the last lines (-n sets how many). wc -l counts lines. On real servers tail -f follows a log as new lines arrive and less pages through big files.",
        blocks: [
            { type: "shellsim", heading: "Your turn: the end of a log", task: "sh-t-tail" }
        ],
        why: "When something breaks in production, the first step is almost always reading the latest log lines.",
        analogy: "tail is opening a diary at the last page instead of reading it from the start.",
        mistakes: ["cat on huge files.", "Forgetting -n.", "Reading the whole log instead of the newest entries."],
        check: [{ q: "How do you see the first 5 lines?", a: "head -n 5 FILE." }, { q: "What does tail -f do?", a: "Keeps printing new lines as they are added." }],
        summary: "Use cat for small files, head and tail for the ends of big ones, and wc -l to count lines." },
    { id: "lx-searching", title: "Searching with grep and find", level: "beginner",
        objectives: ["Search text with grep and its options", "Find files with find", "Quote patterns"],
        intro: "grep prints lines matching a pattern: -i ignores case, -n shows line numbers, -c counts and -v inverts. find searches the directory tree: find . -name \"*.log\" lists files by name. Quote patterns with * so the shell does not expand them first.",
        blocks: [
            { type: "shellsim", heading: "Your turn: count errors", task: "sh-t-grep-count" },
            { type: "shellsim", heading: "Your turn: find log files", task: "sh-t-find" }
        ],
        why: "Finding the one error line among thousands, or the config file somewhere on a server, is daily work.",
        analogy: "grep is a highlighter run over every line; find is a librarian searching the shelves by title.",
        mistakes: ["Unquoted wildcards.", "Forgetting -i when case varies.", "Searching from / when a smaller folder would do."],
        check: [{ q: "How do you show lines that do NOT match?", a: "grep -v PATTERN." }, { q: "How do you find all .csv files under data?", a: "find data -name \"*.csv\"." }],
        summary: "grep searches inside files (with -i, -n, -c, -v) and find searches for files; quote wildcard patterns." },
    { id: "lx-pipes", title: "Pipes and redirection", level: "intermediate",
        objectives: ["Chain commands with |", "Save output with > and >>", "Build small data pipelines"],
        intro: "A pipe sends one command's output into the next: cut -d , -f 2 orders.csv | sort | uniq -c counts orders per city. > writes output to a file, replacing it, and >> appends. && runs the next command only if the previous one succeeded. Small single-purpose tools combined this way are the Unix philosophy.",
        blocks: [
            { type: "shellsim", heading: "Your turn: distinct cities", task: "sh-t-pipe" },
            { type: "shellsim", heading: "Your turn: save the errors", task: "sh-t-redirect" }
        ],
        why: "Pipelines answer quick data questions in seconds, without a spreadsheet or a script.",
        analogy: "A pipe is a kitchen line: one cook chops, passes to the next who fries, who passes to the one who plates.",
        mistakes: ["> when >> was meant, wiping a file.", "uniq without sort first.", "Very long one-liners nobody can read."],
        check: [{ q: "Why sort before uniq?", a: "uniq only removes adjacent duplicates." }, { q: "Difference between > and >>?", a: "> replaces the file; >> appends to it." }],
        summary: "Combine small commands with pipes, save with > or >>, and chain with &&." },
    { id: "lx-files", title: "Managing files and folders", level: "intermediate",
        objectives: ["Create, copy, move and delete", "Work safely with rm", "Organise backups"],
        intro: "mkdir creates folders (-p creates parents), touch creates empty files, cp copies (-r for folders), mv moves or renames and rm deletes (-r for folders). There is no recycle bin: rm is permanent, so check the path first.",
        blocks: [
            { type: "shellsim", heading: "Your turn: make a backup", task: "sh-t-backup" },
            { type: "quiz", questions: [
                { q: "Which command renames report.txt to report-old.txt?", options: ["mv report.txt report-old.txt", "cp report.txt report-old.txt"], answer: 0, explain: "mv renames; cp would leave two files." },
                { q: "Before rm -r on a path from a variable, what should you do?", options: ["Print and check the path first", "Nothing"], answer: 0, explain: "An empty or wrong variable can delete far more than intended." }
            ] }
        ],
        why: "Deployments, backups and clean-ups are file operations; mistakes with rm are famous outages.",
        analogy: "cp is a photocopier, mv is a removal van, rm is a shredder with no undo.",
        mistakes: ["rm -r with an unchecked path.", "cp without -r for folders.", "Overwriting files with mv by accident."],
        check: [{ q: "How do you create nested folders a/b/c in one go?", a: "mkdir -p a/b/c." }, { q: "Can rm be undone?", a: "No, not from the shell." }],
        summary: "Create with mkdir and touch, copy with cp, move with mv and delete carefully with rm." },
    { id: "lx-permissions", title: "Users and permissions", level: "intermediate",
        objectives: ["Read rwx permissions", "Change them with chmod", "Explain sudo and least privilege"],
        intro: "Each file has an owner, a group and permissions for owner, group and others: r (read, 4), w (write, 2) and x (execute, 1). ls -l shows them, as in -rwxr-xr-x (755). chmod +x makes a script executable. sudo runs a command as the administrator, so use it only when needed.",
        blocks: [
            { type: "shellsim", heading: "Your turn: make a script executable", task: "sh-t-chmod" },
            { type: "quiz", questions: [
                { q: "What is 640 in letters?", options: ["rw-r-----", "rwxr-x---"], answer: 0, explain: "6 = rw-, 4 = r--, 0 = ---." },
                { q: "A config file with secrets has mode 777. The risk?", options: ["Every user can read and change it", "None"], answer: 0, explain: "Give secrets 600 (owner read and write only)." }
            ] }
        ],
        why: "Permission errors and over-permissive files are common causes of failed deployments and security incidents.",
        analogy: "Permissions are a building's key cards: who can enter (r), who can rearrange (w) and who can run the machines (x).",
        mistakes: ["chmod 777 to make an error go away.", "Running everything with sudo.", "Secrets readable by everyone."],
        check: [{ q: "What does chmod 755 give?", a: "rwx for the owner, r-x for group and others." }, { q: "What is least privilege?", a: "Giving each user and process only the access it needs." }],
        summary: "Read rwx for owner, group and others, change them with chmod and use sudo sparingly." },
    { id: "lx-processes", title: "Processes, services and environment", level: "advanced",
        objectives: ["Inspect and stop processes", "Manage services with systemctl", "Use environment variables"],
        intro: "A process is a running program with a process id. ps and top list processes, kill sends a signal (SIGTERM asks politely, SIGKILL forces). Services on most distributions are managed by systemd: systemctl status, start, stop, restart and journalctl -u for their logs. Environment variables such as PATH and DATABASE_URL configure programs without changing code.",
        blocks: [
            { type: "example", title: "Everyday commands on a real server", text: "ps aux | grep node            # is the app running?\nsystemctl status shoplite     # the service's state\nsudo systemctl restart shoplite\njournalctl -u shoplite -n 50  # its last 50 log lines\nexport DATABASE_URL=postgres://localhost/shop\necho $PATH" },
            { type: "quiz", heading: "Your turn", questions: [
                { q: "Which signal should you try first to stop a process?", options: ["SIGTERM (kill PID)", "SIGKILL (kill -9 PID)"], answer: 0, explain: "SIGTERM lets the program shut down cleanly; -9 cannot be handled." },
                { q: "Where do you look for a systemd service's logs?", options: ["journalctl -u SERVICE", "ls /home"], answer: 0, explain: "systemd collects service output in the journal." },
                { q: "Why put a database password in an environment variable rather than in code?", options: ["It stays out of the repository and can differ per environment", "It is faster"], answer: 0, explain: "Configuration belongs to the environment, not the code." }
            ] }
        ],
        why: "Restarting services, reading their logs and configuring them is the core of operating software.",
        analogy: "Processes are workers on a shift; systemd is the supervisor who starts them, restarts them and keeps the logbook.",
        mistakes: ["kill -9 first.", "Restarting without reading the logs.", "Secrets in shell history."],
        check: [{ q: "Which command shows a service's state?", a: "systemctl status NAME." }, { q: "What does PATH control?", a: "Where the shell looks for programs." }],
        summary: "Inspect processes with ps and top, stop them gracefully, manage services with systemctl and journalctl and configure with environment variables." },
    { id: "lx-scripting", title: "Shell scripting basics", level: "advanced",
        objectives: ["Write a script with variables, conditions and loops", "Make scripts safe", "Schedule them"],
        intro: "A shell script is a text file of commands that starts with #!/bin/bash. Scripts use variables (NAME=value, then \"$NAME\"), if tests, for loops and exit codes ($? is 0 on success). set -euo pipefail stops on errors and on unset variables. cron runs scripts on a schedule; the Cron Challenge Lab practises the schedule syntax.",
        blocks: [
            { type: "example", title: "A safe backup script", text: "#!/bin/bash\nset -euo pipefail\n\nSRC=\"/home/asha/shoplite\"\nDEST=\"/backups/shoplite-$(date +%F)\"\n\nmkdir -p \"$DEST\"\nfor f in config.json data/orders.csv; do\n  cp \"$SRC/$f\" \"$DEST/\"\ndone\necho \"Backed up to $DEST\"" },
            { type: "quiz", heading: "Your turn", questions: [
                { q: "Why quote \"$DEST\"?", options: ["So paths with spaces stay one argument", "It is decoration"], answer: 0, explain: "Unquoted variables split on spaces and expand wildcards." },
                { q: "What does set -e do?", options: ["Stops the script when a command fails", "Enables colours"], answer: 0, explain: "Without it, a script carries on after errors." },
                { q: "A cron entry runs the backup at 02:00 every day. Which schedule?", options: ["0 2 * * *", "2 0 * * *"], answer: 0, explain: "Minute first, then hour." }
            ] }
        ],
        why: "Automating repetitive tasks with small scripts saves hours and avoids manual mistakes.",
        analogy: "A script is a written recipe that the shell cooks the same way every time.",
        mistakes: ["Unquoted variables.", "No set -e.", "Hard-coded secrets in scripts."],
        check: [{ q: "What does $? hold?", a: "The exit code of the last command (0 means success)." }, { q: "What is the first line of a Bash script?", a: "#!/bin/bash (the shebang)." }],
        summary: "Write scripts with a shebang, quoted variables, set -euo pipefail, loops and conditions, and schedule them with cron." }
];

export const interview = {
    howTo: "Answer each question before opening the explanation. Linux interviews are practical: think about what you would type.",
    description: "10 Linux and shell interview questions with explained answers: navigation, grep, pipes, permissions, processes, services and scripting.",
    coding: [],
    quiz: [
        { q: "Absolute versus relative path?", options: ["Absolute starts at /; relative starts from the current directory", "The same"], answer: 0, explain: "pwd shows where relative paths start." },
        { q: "How do you count lines containing ERROR?", options: ["grep -c ERROR FILE", "cat ERROR"], answer: 0, explain: "Or grep ERROR FILE | wc -l." },
        { q: "> versus >>?", options: ["Replace versus append", "The same"], answer: 0, explain: "> can wipe a file." },
        { q: "What does chmod 600 mean?", options: ["Owner read and write only", "Everyone can read"], answer: 0, explain: "Good for secrets." },
        { q: "SIGTERM versus SIGKILL?", options: ["SIGTERM can be handled for clean shutdown; SIGKILL cannot", "The same"], answer: 0, explain: "Try SIGTERM first." },
        { q: "How do you see a service's logs with systemd?", options: ["journalctl -u NAME", "ls /var"], answer: 0, explain: "The journal." },
        { q: "Why sort before uniq?", options: ["uniq removes only adjacent duplicates", "uniq sorts by itself"], answer: 0, explain: "Classic pipeline detail." },
        { q: "What is a shebang?", options: ["The #! first line naming the interpreter", "A comment"], answer: 0, explain: "#!/bin/bash." },
        { q: "What does set -euo pipefail do?", options: ["Stops on errors, unset variables and failed pipes", "Speeds up scripts"], answer: 0, explain: "Safer scripts." },
        { q: "How do you find large log files?", options: ["find /var/log -name \"*.log\" -size +100M", "grep big"], answer: 0, explain: "find filters by name, size and more." }
    ]
};
