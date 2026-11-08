/* =========================================================
   ToolZen Hub
   Application Security Foundations path: code-reading lessons (original to this site; risk names follow the OWASP Top
   10 and OWASP API Security Top 10). Every example is a defensive code-review exercise: spot the flaw, choose the fix.
========================================================= */

export const lessons = [
    {
        id: "sec-mindset", title: "The security mindset and threat modelling", level: "beginner", prerequisite: "Basic familiarity with web apps helps; the HTTP and REST APIs path is ideal.",
        objectives: ["Think about how features can be misused", "Describe confidentiality, integrity and availability", "Run a simple threat model"],
        intro: "Security asks what could go wrong when someone uses a feature in ways it was not meant for. Security protects confidentiality (only the right people see data), integrity (data is not changed wrongly) and availability (the service keeps working). A simple threat model asks: what are we building, what can go wrong, what will we do about it, and did we do a good job?",
        blocks: [
            { type: "quiz", heading: "Your turn: what could go wrong with ShopLite's coupon field?", questions: [
                { q: "A user tries thousands of random coupon codes per minute. Which property is at risk, and what helps?", options: ["Integrity of pricing and availability; rate limiting and unguessable codes", "Nothing; coupons are public"], answer: 0, explain: "Brute force can find valid codes and load the server." },
                { q: "Which question belongs in a threat model?", options: ["What can go wrong?", "Which font should we use?"], answer: 0, explain: "The four questions: what are we building, what can go wrong, what will we do, did we do a good job." }
            ] }
        ],
        why: "Most vulnerabilities are design or logic mistakes that a few minutes of 'how could this be abused?' would catch. Testers with this mindset find the most valuable bugs.",
        analogy: "Threat modelling is a house-sitter walking around asking which windows a burglar would try first.",
        mistakes: ["Assuming users will only use the interface as intended.", "Security as a last step before release.", "Only thinking about outside attackers, not mistakes and insiders."],
        check: [
            { q: "What do C, I and A stand for?", a: "Confidentiality, integrity and availability." },
            { q: "Name the four threat-modelling questions.", a: "What are we building? What can go wrong? What will we do about it? Did we do a good job?" }
        ],
        summary: "Think like a misuser: protect confidentiality, integrity and availability, and threat-model features early with four simple questions."
    },
    {
        id: "sec-injection", title: "Injection: SQL and commands", level: "beginner",
        objectives: ["Recognise SQL injection in code", "Fix it with parameterised queries", "Apply the same idea to commands"],
        intro: "Injection happens when untrusted input is pasted into a query or command, so the input can change its meaning. The fix is to keep code and data apart: parameterised queries send the SQL and the values separately, so a value can never become SQL. The same principle applies to shell commands, LDAP queries and templates.",
        blocks: [
            { type: "example", title: "Vulnerable and fixed (Node.js)", text: "// vulnerable: the email becomes part of the SQL\ndb.query(\"SELECT * FROM customers WHERE email = '\" + email + \"'\");\n// email = \"' OR '1'='1\" returns every customer\n\n// fixed: a parameterised query; the value is never parsed as SQL\ndb.query(\"SELECT * FROM customers WHERE email = ?\", [email]);" },
            { type: "quiz", heading: "Your turn", questions: [
                { q: "Which fix is correct?", options: ["Parameterised queries (placeholders with separate values)", "Removing quotes from the input", "Hiding the error message"], answer: 0, explain: "Filtering characters is fragile; placeholders separate code from data by design." },
                { q: "A report tool builds: exec('zip report.zip ' + fileName). The risk?", options: ["Command injection: a file name like 'x; rm -rf ~' runs a second command", "None"], answer: 0, explain: "Pass arguments as an array to a function that does not use a shell, and validate names." },
                { q: "Is input from a hidden form field or a dropdown safe to paste into SQL?", options: ["No: anyone can send any value directly to the server", "Yes: users cannot change it"], answer: 0, explain: "Everything from the client is untrusted, whatever the interface allows." }
            ] }
        ],
        why: "Injection has caused some of the largest data breaches. It is easy to prevent and easy to test for, so finding it is a core skill.",
        analogy: "Injection is letting a customer fill in the 'pay to' line of a cheque you sign without reading.",
        mistakes: ["Building queries with string concatenation.", "Trusting client-side validation.", "Escaping by hand instead of using placeholders."],
        check: [
            { q: "Why do parameterised queries prevent SQL injection?", a: "The database receives the query structure and the values separately, so values are never interpreted as SQL." },
            { q: "Which inputs are untrusted?", a: "Everything from outside: form fields, hidden fields, headers, cookies, URLs and API bodies." }
        ],
        summary: "Never paste untrusted input into queries or commands; use parameterised queries and argument arrays, and treat every client value as untrusted."
    },
    {
        id: "sec-xss", title: "Cross-site scripting", level: "intermediate",
        objectives: ["Recognise reflected and stored XSS", "Fix it with output encoding and safe DOM methods", "Explain the role of Content Security Policy"],
        intro: "Cross-site scripting (XSS) lets an attacker run script in other users' browsers by getting markup into a page: through a search term reflected back (reflected), a saved review (stored) or client-side code that writes input into the page (DOM-based). The fixes are to encode output for its context, to use textContent rather than innerHTML, to rely on frameworks' safe defaults and to add a Content Security Policy as a second line of defence.",
        blocks: [
            { type: "example", title: "Vulnerable and fixed", text: "// vulnerable: a review is inserted as HTML\nreviewBox.innerHTML = review.text;\n// text = '<img src=x onerror=\"stealCookies()\">'\n\n// fixed: inserted as text\nreviewBox.textContent = review.text;" },
            { type: "quiz", heading: "Your turn", questions: [
                { q: "A review containing <script> is saved and shown to every visitor. Which type?", options: ["Stored XSS", "Reflected XSS"], answer: 0, explain: "It is stored on the server and served to others." },
                { q: "Which cookie setting stops scripts reading the session cookie?", options: ["HttpOnly", "Secure only"], answer: 0, explain: "HttpOnly limits the damage of XSS; Secure keeps cookies to HTTPS; SameSite helps against CSRF." },
                { q: "Is a Content Security Policy a replacement for encoding output?", options: ["No, it is defence in depth", "Yes"], answer: 0, explain: "Fix the injection; CSP limits what slips through." }
            ] }
        ],
        why: "XSS is one of the most common web vulnerabilities and can take over accounts. Front-end developers and testers meet it constantly.",
        analogy: "XSS is a poster on a noticeboard that, instead of just being read, gets to give orders to everyone who looks at it.",
        mistakes: ["innerHTML with user content.", "Escaping for HTML when the value goes into a URL or script.", "Relying only on input filters."],
        check: [
            { q: "What is the safest way to put user text into the page?", a: "textContent (or the framework's default text binding)." },
            { q: "Name the three kinds of XSS.", a: "Reflected, stored and DOM-based." }
        ],
        summary: "Prevent XSS by encoding output for its context and inserting text safely; add HttpOnly cookies and a Content Security Policy as extra layers."
    },
    {
        id: "sec-auth", title: "Passwords, sessions and authentication", level: "intermediate",
        objectives: ["Store passwords safely", "Protect sessions", "Recognise weak authentication flows"],
        intro: "Passwords must be stored with a slow, salted password-hashing function such as Argon2id, scrypt or bcrypt, never in plain text or with a fast hash like SHA-256 alone. Sessions need long random identifiers in cookies marked HttpOnly, Secure and SameSite, and should be renewed on sign-in and ended on sign-out. Multi-factor authentication and rate limits stop most account takeovers.",
        blocks: [
            { type: "quiz", heading: "Your turn: review these designs", questions: [
                { q: "Passwords are stored as sha256(password). The problem?", options: ["Fast unsalted hashes are cracked quickly; use Argon2id, scrypt or bcrypt", "None, it is a hash"], answer: 0, explain: "Password hashing must be slow and salted." },
                { q: "The sign-in page says 'No account with this email' for unknown emails. The risk?", options: ["User enumeration: attackers learn which emails have accounts", "None"], answer: 0, explain: "Use one message: 'Email or password is incorrect.'" },
                { q: "The password-reset link never expires and works many times. Fix?", options: ["Single-use tokens that expire quickly", "Make the link longer"], answer: 0, explain: "Reset tokens are as powerful as passwords." },
                { q: "Unlimited password attempts are allowed. Fix?", options: ["Rate limiting and lockout or delays, plus MFA", "A stronger font"], answer: 0, explain: "Stops brute force and credential stuffing." }
            ] }
        ],
        why: "Account takeover is one of the most damaging and common attacks. Authentication flows are a top area for security testing.",
        analogy: "A good password hash is a lock that takes a minute to try each key: fine for the owner, hopeless for someone with a million keys.",
        mistakes: ["Fast hashes for passwords.", "Different error messages for unknown users.", "Session ids in URLs."],
        check: [
            { q: "Name a suitable password-hashing function.", a: "Argon2id, scrypt or bcrypt." },
            { q: "Which cookie flags protect session cookies?", a: "HttpOnly, Secure and SameSite." }
        ],
        summary: "Hash passwords with a slow, salted algorithm, protect session cookies, avoid enumeration, expire reset tokens and rate-limit sign-in."
    },
    {
        id: "sec-access-control", title: "Access control", level: "intermediate",
        objectives: ["Recognise broken access control", "Check authorisation on the server for every object", "Test access control systematically"],
        intro: "Broken access control is the top risk in the OWASP Top 10: users acting outside their permissions, such as reading another customer's order by changing an id, or reaching admin functions by guessing a URL. Every request must be checked on the server: is this user allowed to do this action on this object? Hiding buttons in the interface is not access control.",
        blocks: [
            { type: "example", title: "Vulnerable and fixed (Express-style)", text: "// vulnerable: any signed-in user can read any order\napp.get('/api/orders/:id', requireLogin, async (req, res) => {\n  res.json(await Orders.find(req.params.id));\n});\n\n// fixed: the order must belong to the caller\napp.get('/api/orders/:id', requireLogin, async (req, res) => {\n  const order = await Orders.find(req.params.id);\n  if (!order || order.customerId !== req.user.id) return res.status(404).end();\n  res.json(order);\n});" },
            { type: "quiz", heading: "Your turn", questions: [
                { q: "Why return 404 rather than 403 for someone else's order?", options: ["It avoids confirming that the order exists", "404 is faster"], answer: 0, explain: "Both are defensible; 404 leaks less." },
                { q: "The admin page is hidden from the menu for normal users. Is it protected?", options: ["No: the server must check the role on every admin request", "Yes"], answer: 0, explain: "Anyone can type the URL or call the API directly." },
                { q: "How should a tester check access control?", options: ["Repeat requests as a different user and as a signed-out user, changing ids", "Only test as admin"], answer: 0, explain: "Use two accounts and swap their object ids." }
            ] }
        ],
        why: "Access-control flaws expose other customers' data and are often found simply by changing a number in a URL.",
        analogy: "Hiding the staff door behind a curtain is not a lock; access control is the lock.",
        mistakes: ["Checking sign-in but not ownership.", "Relying on the interface to hide functions.", "Sequential, guessable ids combined with missing checks."],
        check: [
            { q: "Where must authorisation be enforced?", a: "On the server, for every request and object." },
            { q: "What is the classic test for broken object-level authorisation?", a: "As user A, request user B's object ids." }
        ],
        summary: "Enforce authorisation on the server for every action and object, never rely on hidden interface elements, and test with swapped users and ids."
    },
    {
        id: "sec-secrets-config", title: "Secrets, configuration and dependencies", level: "advanced",
        objectives: ["Keep secrets out of code", "Harden configuration", "Manage vulnerable dependencies"],
        intro: "Many breaches need no clever attack: a key committed to Git, a debug page left on in production, default passwords, or an old library with a known vulnerability. Keep secrets in a secret manager or environment variables, turn off debug output, set security headers, and keep dependencies updated with automated scanning.",
        blocks: [
            { type: "quiz", heading: "Your turn: review these findings", questions: [
                { q: "config.js contains const STRIPE_KEY = 'sk_live_…' and is in a public repository. First step?", options: ["Revoke and rotate the key immediately, then remove it and use a secret store", "Delete the line in a new commit"], answer: 0, explain: "The key is already exposed in history and may have been copied." },
                { q: "Production error pages show full stack traces and SQL. The risk?", options: ["Information disclosure that helps attackers", "None"], answer: 0, explain: "Show a generic message; log details privately." },
                { q: "A dependency scanner reports a critical vulnerability in a library you use. Sensible action?", options: ["Check whether you use the affected part, then update or mitigate promptly", "Ignore it until the next major release"], answer: 0, explain: "Triage and patch; known vulnerabilities are actively exploited." },
                { q: "Which header tells browsers to use HTTPS only for your site?", options: ["Strict-Transport-Security", "X-Powered-By"], answer: 0, explain: "HSTS; and remove headers like X-Powered-By that reveal technology." }
            ] }
        ],
        why: "Misconfiguration and vulnerable components are among the most common causes of breaches, and they are cheap to prevent.",
        analogy: "Leaving a secret in code is taping the house key under the doormat: easy, and the first place anyone looks.",
        mistakes: ["Secrets in repositories or front-end code.", "Debug mode in production.", "Never updating dependencies."],
        check: [
            { q: "Where should secrets live?", a: "In a secret manager or environment variables, never in code or images." },
            { q: "What should happen after a secret leaks?", a: "Revoke and rotate it at once, then clean up and prevent recurrence." }
        ],
        summary: "Keep secrets out of code, harden configuration and headers, hide internal errors and keep dependencies scanned and updated."
    },
    {
        id: "sec-testing", title: "Security testing in practice", level: "advanced",
        objectives: ["Plan basic security tests for a feature", "Know the main tool categories", "Report security findings responsibly"],
        intro: "Security testing combines thinking and tools. Static analysis (SAST) reads code for risky patterns, dynamic scanners (DAST) probe a running app, dependency scanners check libraries, and manual testing finds logic and access-control flaws that tools miss. Test only systems you are authorised to test, and report findings with clear steps, impact and a suggested fix.",
        blocks: [
            { type: "order", heading: "Your turn: security-test a new feature", prompt: "Order a basic security test of ShopLite's new 'save address' feature.", items: ["Confirm you are authorised and agree the scope", "Threat-model the feature: inputs, data, who may access it", "Test input handling: long, special and script-like values", "Test access control with two accounts and swapped ids", "Run scanners and review dependency findings", "Report findings with steps, impact and fixes, privately"], explain: "Permission and scope first; think, test inputs and access, use tools, then report responsibly." },
            { type: "quiz", questions: [
                { q: "You find a serious flaw in another company's site while browsing. Right action?", options: ["Stop, do not exploit it, and report it through their disclosure channel", "Test further to prove it"], answer: 0, explain: "Without authorisation, testing further can be illegal; follow responsible disclosure." }
            ] }
        ],
        why: "Security testing skills are in high demand, and every tester can add basic security checks to their work.",
        analogy: "Tools are metal detectors; manual testing is the guard who notices the fire door propped open.",
        mistakes: ["Testing without permission.", "Relying only on scanners.", "Public disclosure before the owner can fix."],
        check: [
            { q: "SAST or DAST: which needs a running application?", a: "DAST." },
            { q: "What must a security finding report contain?", a: "Steps to reproduce, impact and a suggested fix, shared privately." }
        ],
        summary: "Get authorisation, threat-model, test inputs and access control, use SAST, DAST and dependency scanning, and report responsibly."
    }
];

export const interview = {
    howTo: "Answer each question before opening the explanation. Security interviews value precise fixes over buzzwords.",
    description: "12 application-security interview questions with explained answers: injection, XSS, passwords, sessions, access control, secrets and testing.",
    coding: [],
    quiz: [
        { q: "How do you prevent SQL injection?", options: ["Parameterised queries", "Removing quotes"], answer: 0, explain: "Separate code from data." },
        { q: "How do you prevent XSS?", options: ["Context-aware output encoding and safe DOM methods, plus CSP", "Only input length limits"], answer: 0, explain: "Encode on output." },
        { q: "What is CSRF and a defence?", options: ["Forged requests from another site using the victim's cookies; SameSite cookies and tokens", "A type of SQL injection"], answer: 0, explain: "Cross-site request forgery." },
        { q: "How should passwords be stored?", options: ["Slow salted hashes such as Argon2id or bcrypt", "Encrypted with a shared key"], answer: 0, explain: "Hashing, not reversible encryption." },
        { q: "What is the top OWASP Top 10 risk (2021)?", options: ["Broken access control", "Slow pages"], answer: 0, explain: "Users acting outside their permissions." },
        { q: "What is IDOR?", options: ["Insecure direct object reference: accessing objects by changing ids without checks", "A protocol"], answer: 0, explain: "A form of broken access control." },
        { q: "Authentication versus authorisation?", options: ["Who you are versus what you may do", "The same"], answer: 0, explain: "401 versus 403 in HTTP." },
        { q: "A secret is pushed to GitHub. First step?", options: ["Revoke and rotate it", "Delete the commit"], answer: 0, explain: "Assume it is compromised." },
        { q: "What does HttpOnly do on a cookie?", options: ["Prevents JavaScript from reading it", "Forces HTTP"], answer: 0, explain: "Limits XSS impact." },
        { q: "SAST versus DAST?", options: ["SAST reads code; DAST tests the running app", "The same"], answer: 0, explain: "Use both, plus manual testing." },
        { q: "What is least privilege?", options: ["Give each user and service only the access it needs", "Give everyone admin for speed"], answer: 0, explain: "Limits damage from mistakes and breaches." },
        { q: "What is responsible disclosure?", options: ["Reporting a flaw privately and allowing time to fix before publishing", "Posting it on social media"], answer: 0, explain: "Protects users while the fix is made." }
    ]
};
