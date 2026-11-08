/* =========================================================
   ToolZen Hub
   HTML, CSS and the DOM path: lessons (original to this site; facts checked against MDN and WCAG 2.2). Playground
   exercises render in a script-free sandboxed iframe and are checked on the rendered page (webplay blocks).
========================================================= */

export const lessons = [
    {
        id: "web-html-basics", title: "HTML: elements and the structure of a page", level: "beginner", prerequisite: "None.",
        objectives: ["Write elements with tags and attributes", "Use headings and paragraphs correctly", "Explain the document's structure"],
        intro: "HTML describes the content of a page with elements: an opening tag, content and a closing tag, as in <p>Hello</p>. Attributes add information, as in <a href=\"/cart\">. Headings h1 to h6 form an outline (one h1 for the page's main topic), and paragraphs hold text. Browsers turn the HTML into a tree of elements called the DOM.",
        blocks: [
            { type: "example", title: "A small page", text: "<!doctype html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"utf-8\">\n    <title>ShopLite</title>\n  </head>\n  <body>\n    <h1>ShopLite</h1>\n    <p>Everyday products, delivered.</p>\n  </body>\n</html>" },
            { type: "webplay", heading: "Your turn: a first page", exercise: "web-x-first-page" }
        ],
        why: "Every website and web app, including every page a tester checks, is HTML underneath. Correct structure helps users, search engines and assistive technology.",
        analogy: "HTML is the skeleton of a page: CSS dresses it and JavaScript makes it move.",
        mistakes: ["Choosing headings by size instead of meaning.", "Several h1 elements for unrelated things.", "Forgetting the lang attribute and the title."],
        check: [
            { q: "What is an attribute?", a: "Extra information on an element, written in the opening tag, such as href on a link." },
            { q: "How many h1 elements should a page usually have?", a: "One, for its main topic." }
        ],
        summary: "HTML marks up content with elements and attributes; headings form an outline and the browser builds the DOM tree from the markup."
    },
    {
        id: "web-links-images", title: "Links and images", level: "beginner",
        objectives: ["Write links with meaningful text", "Add images with alt text", "Know when alt can be empty"],
        intro: "A link is an a element with an href: its text should say where it goes, so 'Practice Labs' rather than 'click here'. An image needs src and alt: alt text describes the image for people who cannot see it and appears if it fails to load. Purely decorative images take alt=\"\" so screen readers skip them.",
        blocks: [
            { type: "webplay", heading: "Your turn: a link and an image", exercise: "web-x-link-image" }
        ],
        why: "Missing alt text and vague links are among the most common accessibility failures found in audits.",
        analogy: "Alt text is describing a photo to a friend on the phone; link text is the signpost's wording.",
        mistakes: ["'Click here' links.", "Images without alt.", "Alt text that repeats the file name."],
        check: [
            { q: "When is alt=\"\" correct?", a: "When the image is purely decorative and adds no information." },
            { q: "Why avoid 'click here'?", a: "Link text read out of context, as screen readers often list links, says nothing about the destination." }
        ],
        summary: "Links need descriptive text and an href; images need alt text describing them, or empty alt when decorative."
    },
    {
        id: "web-semantic", title: "Semantic HTML and landmarks", level: "beginner",
        objectives: ["Use header, nav, main, footer and section", "Explain why semantics matter", "Replace generic divs with meaningful elements"],
        intro: "Semantic elements say what content is: header, nav, main, article, section, aside and footer. Assistive technology uses them as landmarks to jump around the page, search engines use them to understand it, and developers read them more easily than a wall of divs.",
        blocks: [
            { type: "webplay", heading: "Your turn: lay out a page", exercise: "web-x-semantic" }
        ],
        why: "Semantic markup is free accessibility and better maintainability. Automated tests also find elements more reliably by role.",
        analogy: "Semantic elements are the labelled sections of a newspaper: masthead, contents, main story and back page.",
        mistakes: ["div for everything.", "Several main elements.", "Using a heading level just for its size."],
        check: [
            { q: "Which element holds the page's primary content?", a: "main (one per page)." },
            { q: "How do landmarks help screen-reader users?", a: "They can jump straight to navigation, main content or the footer." }
        ],
        summary: "Use semantic elements for the page's regions so people, tools and search engines understand its structure."
    },
    {
        id: "web-forms", title: "Forms and inputs", level: "beginner",
        objectives: ["Choose the right input types", "Label every field", "Use a real submit button"],
        intro: "Forms collect input. The input type matters: email and tel bring the right mobile keyboard, password hides characters and number restricts input. Every field needs a label linked by for and id (a placeholder disappears when typing and is not a label). A button inside a form submits it.",
        blocks: [
            { type: "webplay", heading: "Your turn: a sign-in form", exercise: "web-x-form" }
        ],
        why: "Forms are where users pay, sign up and sign in. Unlabelled or mistyped fields lose customers and fail accessibility rules.",
        analogy: "A label is the question printed next to each box on a paper form; a placeholder is a pencil hint that vanishes when you write.",
        mistakes: ["Placeholders instead of labels.", "Clickable divs instead of buttons.", "Using type=text for everything."],
        check: [
            { q: "How is a label linked to its input?", a: "label for=\"x\" with id=\"x\" on the input (or by wrapping the input in the label)." },
            { q: "Why use type=\"email\"?", a: "It gives the email keyboard on phones and built-in format checks." }
        ],
        summary: "Choose input types that fit the data, give every field a real label and submit with a real button."
    },
    {
        id: "web-css-basics", title: "CSS: selectors, the cascade and the box model", level: "intermediate",
        objectives: ["Write rules with selectors and properties", "Explain the cascade and specificity", "Use the box model"],
        intro: "CSS styles HTML with rules: a selector chooses elements and declarations set properties, as in .price { font-weight: 700; }. When rules conflict, the cascade decides: more specific selectors win (an id beats a class, which beats an element), and later rules beat earlier ones of equal specificity. Every element is a box of content, padding, border and margin.",
        blocks: [
            { type: "webplay", heading: "Your turn: style a price and a button", exercise: "web-x-css-basics" },
            { type: "quiz", questions: [
                { q: "Which wins: p { color: black } or .note { color: green } for <p class=\"note\">?", options: ["Green: a class is more specific than an element", "Black: it comes first"], answer: 0, explain: "Specificity is compared before order." },
                { q: "With box-sizing: border-box, does width include padding and border?", options: ["Yes", "No"], answer: 0, explain: "border-box makes sizes easier to reason about, which is why many sites set it globally." }
            ] }
        ],
        why: "Styling bugs (overlapping text, hidden buttons, low contrast) are among the most visible defects. Understanding the cascade turns guessing into fixing.",
        analogy: "The cascade is a set of house rules where the more specific instruction wins: 'all children in bed by nine' loses to 'Ravi may stay up for the match'.",
        mistakes: ["Fighting specificity with !important.", "Forgetting padding adds to width without border-box.", "Low contrast between text and background."],
        check: [
            { q: "Name the four layers of the box model.", a: "Content, padding, border and margin." },
            { q: "Two rules with equal specificity conflict. Which wins?", a: "The one that comes later." }
        ],
        summary: "CSS rules select elements and set properties; specificity and order resolve conflicts, and every element is a box of content, padding, border and margin."
    },
    {
        id: "web-layout", title: "Layout with flexbox and responsive design", level: "intermediate",
        objectives: ["Lay out items with flexbox", "Use gap and wrapping", "Adapt layouts with media queries"],
        intro: "Flexbox arranges items in a row or column: display: flex on the container, justify-content and align-items to align, gap for spacing and flex-wrap so items move to new lines on narrow screens. Grid handles two-dimensional layouts. Media queries apply rules only at certain widths, which is how one page works from phone to desktop.",
        blocks: [
            { type: "webplay", heading: "Your turn: a wrapping card row", exercise: "web-x-flex" },
            { type: "example", title: "A media query", text: "/* one column by default (phones) */\n.cards { display: grid; gap: 16px; }\n\n/* three columns from 900px wide */\n@media (min-width: 900px) {\n  .cards { grid-template-columns: repeat(3, 1fr); }\n}" }
        ],
        why: "Most visits are on phones. Layouts that overflow or squash at small widths are a top category of UI defects, and testers check several widths for this reason.",
        analogy: "Flexbox is a shelf that rearranges its books to fit; a media query is deciding to add a second shelf once the room is wide enough.",
        mistakes: ["Fixed widths that overflow on phones.", "Margins for spacing where gap is simpler.", "Designing for desktop first and patching phones later."],
        check: [
            { q: "Which property lets flex items move to a new line?", a: "flex-wrap: wrap." },
            { q: "What does @media (min-width: 900px) do?", a: "Applies its rules only when the viewport is at least 900px wide." }
        ],
        summary: "Use flexbox (and grid) with gap and wrapping, design mobile-first and add media queries for wider screens."
    },
    {
        id: "web-accessibility", title: "Accessibility essentials", level: "intermediate",
        objectives: ["Use native elements for interaction", "Give controls accessible names", "Mark up data tables properly"],
        intro: "Accessible pages work for people using keyboards, screen readers, zoom or voice control. Most of it comes from correct HTML: real buttons and links (focusable, keyboard-operable), accessible names on every control, labels on fields, headers on tables and sufficient colour contrast. WCAG 2.2 is the standard most laws refer to.",
        blocks: [
            { type: "webplay", heading: "Your turn: fix an icon button", exercise: "web-x-accessible-button" },
            { type: "webplay", heading: "Your turn: a data table", exercise: "web-x-table" }
        ],
        why: "Accessibility is a legal requirement in many places and affects a large share of users. It is a growing testing specialism.",
        analogy: "Accessible design is a ramp beside the stairs: it helps wheelchair users, parents with prams and delivery workers alike.",
        mistakes: ["Clickable divs and spans.", "Icon buttons with no name.", "Tables built from divs."],
        check: [
            { q: "Why is a div with onclick not accessible?", a: "It is not focusable or keyboard-operable and has no role, unlike a button." },
            { q: "What does scope=\"col\" on a th do?", a: "Marks it as the header for its column, so screen readers announce it with each cell." }
        ],
        summary: "Use native interactive elements, name every control, label fields, mark up tables with headers and keep contrast high."
    },
    {
        id: "web-dom-events", title: "The DOM and events", level: "advanced",
        objectives: ["Select and change elements with JavaScript", "Handle events", "Avoid unsafe HTML insertion"],
        intro: "The DOM is the live tree of the page that JavaScript can read and change. document.querySelector finds elements, textContent and classList change them, and addEventListener runs code when something happens, such as a click or an input. Inserting user text with innerHTML can run attackers' code (cross-site scripting); textContent is safe.",
        blocks: [
            { type: "example", title: "Selecting, changing and listening", text: "const button = document.querySelector('.buy');\nconst count = document.querySelector('#cart-count');\nlet items = 0;\nbutton.addEventListener('click', () => {\n  items += 1;\n  count.textContent = String(items);   // safe: text, never markup\n  button.classList.add('added');\n});" },
            { type: "quiz", heading: "Your turn", questions: [
                { q: "A search page shows 'Results for: ' + query using innerHTML. What is the risk?", options: ["Cross-site scripting: a crafted query can inject markup and script", "None"], answer: 0, explain: "Use textContent, or escape the text, whenever you insert user input." },
                { q: "When does a script that queries elements fail with null?", options: ["When it runs before the elements exist (for example in the head without defer)", "Never"], answer: 0, explain: "Use defer or type=module, or run after DOMContentLoaded." },
                { q: "Which event fires on every keystroke in a text field?", options: ["input", "change"], answer: 0, explain: "change fires when the value is committed, such as on blur." }
            ] }
        ],
        why: "Interactive pages are DOM manipulation. Understanding it helps developers build features and testers understand why elements appear late or not at all.",
        analogy: "The DOM is a puppet; JavaScript holds the strings and events are the audience's cues.",
        mistakes: ["innerHTML with user input.", "Scripts running before the DOM is ready.", "Adding the same listener many times."],
        check: [
            { q: "Which property sets text safely?", a: "textContent." },
            { q: "What does addEventListener do?", a: "Registers a function to run when an event happens on an element." }
        ],
        summary: "JavaScript reads and changes the DOM with selectors, properties and events; insert user text with textContent to avoid cross-site scripting."
    },
    {
        id: "web-performance", title: "Web performance and quality checks", level: "advanced",
        objectives: ["Name the Core Web Vitals", "Find common performance problems", "Run quality checks on a page"],
        intro: "Fast pages keep users. Google's Core Web Vitals measure loading (Largest Contentful Paint), responsiveness (Interaction to Next Paint) and visual stability (Cumulative Layout Shift). Common causes of slowness are large images, too much JavaScript, render-blocking resources and layout shifts from images without sizes. Tools such as Lighthouse and the browser's developer tools measure them.",
        blocks: [
            { type: "quiz", heading: "Your turn", questions: [
                { q: "Text jumps down as an image loads above it. Which metric suffers?", options: ["Cumulative Layout Shift", "Largest Contentful Paint"], answer: 0, explain: "Give images width and height (or aspect-ratio) so space is reserved." },
                { q: "A 4 MB photo is shown 400px wide. The fix?", options: ["Serve a resized, compressed image (and modern formats)", "Nothing"], answer: 0, explain: "Images are usually the largest download on a page." },
                { q: "Which tool gives a performance, accessibility and SEO report in the browser?", options: ["Lighthouse", "A text editor"], answer: 0, explain: "Built into Chrome's developer tools." },
                { q: "Interaction to Next Paint measures:", options: ["How quickly the page responds visually to user input", "Download size"], answer: 0, explain: "Long JavaScript tasks make it worse." }
            ] }
        ],
        why: "Speed affects sales and search ranking. Performance and quality checks are part of web testing and release criteria.",
        analogy: "A slow page is a shop with a heavy door: many customers give up before they are inside.",
        mistakes: ["Huge unoptimised images.", "Images without dimensions.", "Measuring only on a fast desktop connection."],
        check: [
            { q: "Name the three Core Web Vitals.", a: "Largest Contentful Paint, Interaction to Next Paint and Cumulative Layout Shift." },
            { q: "How do you prevent layout shift from images?", a: "Set width and height or aspect-ratio so the space is reserved." }
        ],
        summary: "Measure loading, responsiveness and stability (Core Web Vitals), shrink images and JavaScript, reserve space for media and check with Lighthouse."
    }
];

export const interview = {
    howTo: "Answer each question before opening the explanation. Front-end interviews mix fundamentals with accessibility and security, so read the reasoning.",
    description: "12 HTML, CSS and DOM interview questions with explained answers: semantics, accessibility, the cascade, layout, events, XSS and performance.",
    coding: [],
    quiz: [
        { q: "Why use semantic HTML?", options: ["Accessibility, SEO and readable code", "It renders faster only"], answer: 0, explain: "Meaning helps people and tools." },
        { q: "What is the DOM?", options: ["The browser's live tree of the page's elements", "A CSS framework"], answer: 0, explain: "JavaScript reads and changes it." },
        { q: "Placeholder or label?", options: ["Label; a placeholder is not a label", "Placeholder is enough"], answer: 0, explain: "Placeholders vanish and are poorly announced." },
        { q: "What decides which CSS rule wins?", options: ["Importance, specificity, then order", "Alphabetical order"], answer: 0, explain: "The cascade." },
        { q: "What does box-sizing: border-box change?", options: ["Width includes padding and border", "Nothing"], answer: 0, explain: "Simplifies sizing." },
        { q: "Flexbox or grid for a two-dimensional page layout?", options: ["Grid", "Flexbox"], answer: 0, explain: "Flexbox is one-dimensional; grid handles rows and columns." },
        { q: "What does mobile-first mean?", options: ["Base styles for small screens, media queries add for wider ones", "Only phones are supported"], answer: 0, explain: "Simpler, more robust CSS." },
        { q: "innerHTML versus textContent for user input?", options: ["textContent; innerHTML can cause XSS", "innerHTML is fine"], answer: 0, explain: "Never insert untrusted markup." },
        { q: "What is event delegation?", options: ["One listener on a parent handling events from many children", "Deleting events"], answer: 0, explain: "Events bubble up the tree." },
        { q: "Why are clickable divs a problem?", options: ["Not focusable or keyboard-operable, no role", "They are slower"], answer: 0, explain: "Use button." },
        { q: "What is CLS?", options: ["Cumulative Layout Shift: unexpected movement of content", "A CSS library"], answer: 0, explain: "Reserve space for media." },
        { q: "What does alt=\"\" tell a screen reader?", options: ["The image is decorative; skip it", "The image is missing"], answer: 0, explain: "Omitting alt entirely is different and worse." }
    ]
};
