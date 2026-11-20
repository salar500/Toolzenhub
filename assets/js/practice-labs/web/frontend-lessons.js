/* =========================================================
   ToolZen Hub
   Frontend Frameworks Concepts path: lessons (original to this site). Framework-neutral ideas shared by React, Vue,
   Angular and Svelte, practised as plain JavaScript (reducers, rendering, derived state, routing) run against tests in
   an isolated worker. No framework is installed or run.
========================================================= */

export const lessons = [
    { id: "fe-components", title: "Components, props and rendering", level: "intermediate", prerequisite: "HTML, CSS and the DOM, and JavaScript up to array methods.",
        objectives: ["Explain components and props", "Render lists from data", "Explain why frameworks escape text by default"],
        intro: "Modern frontends are built from components: functions or classes that take inputs (props) and return a description of the interface. Data flows down through props; events flow up through callbacks. Rendering lists from arrays is constant work, and frameworks escape text by default, so user-provided names cannot inject markup unless a raw-HTML escape hatch is used.",
        blocks: [
            { type: "example", title: "The same component in two frameworks", text: "// React (JSX)\nfunction ProductList({ products }) {\n  return <ul>{products.map((p) => <li key={p.id}>{p.name}</li>)}</ul>;\n}\n\n<!-- Vue template -->\n<ul><li v-for=\"p in products\" :key=\"p.id\">{{ p.name }}</li></ul>" },
            { type: "jsrun", heading: "Your turn: render a list safely", exercise: "fe-x-render" }
        ],
        why: "Every major framework is component-based; understanding the model transfers between React, Vue, Angular and Svelte.",
        analogy: "Components are LEGO bricks with labelled studs (props): they snap together into larger pieces.",
        mistakes: ["Raw HTML insertion with user data.", "Missing keys on list items.", "Components that do everything."],
        check: [{ q: "What are props?", a: "Inputs passed from a parent component to a child." }, { q: "Why do list items need keys?", a: "So the framework can match items between renders and update them correctly." }],
        summary: "Build interfaces from components that receive props, render lists with keys and rely on default escaping." },
    { id: "fe-state", title: "State, reducers and immutability", level: "intermediate",
        objectives: ["Tell props from state", "Write a reducer", "Update state immutably"],
        intro: "State is data a component owns and changes over time: the cart, an open menu, form values. Frameworks re-render when state changes, and many detect changes by reference, so updates must create new objects instead of mutating old ones. A reducer is a pure function (state, action) => newState, used by React's useReducer and Redux, that keeps every change in one testable place.",
        blocks: [
            { type: "jsrun", heading: "Your turn: a cart reducer", exercise: "fe-x-reducer" },
            { type: "jsrun", heading: "Your turn: derived state", exercise: "fe-x-derived" }
        ],
        why: "Most frontend bugs are state bugs: stale values, mutations that do not re-render and totals out of sync.",
        analogy: "Immutable updates are writing a new page in a ledger rather than rubbing out the old one.",
        mistakes: ["Mutating arrays and objects in state.", "Storing derived values that drift.", "State spread across many components with no owner."],
        check: [{ q: "Why must reducers be pure?", a: "Same input gives the same output with no side effects, so changes are predictable and testable." }, { q: "What is derived state?", a: "Values computed from other state, such as a cart total, which should be calculated rather than stored." }],
        summary: "Keep state minimal, compute derived values, and update immutably, ideally through pure reducers." },
    { id: "fe-reactivity", title: "Reactivity, the virtual DOM and rendering strategies", level: "intermediate",
        objectives: ["Compare virtual DOM diffing and fine-grained reactivity", "Explain client-side, server-side and static rendering", "Recognise hydration"],
        intro: "Frameworks keep the screen in sync with state in different ways. React re-renders components and diffs a virtual DOM to find the minimal changes; Vue, Svelte, Solid and Angular signals track which values each part depends on and update only those. Pages can be rendered in the browser (client-side), on the server for each request (SSR) or ahead of time at build (static generation, as on this site), and server-rendered pages are hydrated to become interactive.",
        blocks: [
            { type: "quiz", heading: "Your turn", questions: [
                { q: "A marketing page changes once a week and must load fast and rank well in search. Best rendering?", options: ["Static generation at build time", "Client-side rendering only"], answer: 0, explain: "This site uses static generation for the same reasons." },
                { q: "What is hydration?", options: ["Attaching event handlers and state to server-rendered HTML", "Compressing images"], answer: 0, explain: "The page is visible first and becomes interactive after." },
                { q: "What does a virtual DOM diff decide?", options: ["Which real DOM changes are needed after a re-render", "Which CSS file to load"], answer: 0, explain: "Fine-grained reactivity skips the diff by tracking dependencies." }
            ] }
        ],
        why: "Rendering choices decide speed, SEO and complexity, and come up in every frontend architecture discussion.",
        analogy: "Diffing is comparing two photos to spot differences; fine-grained reactivity is a light that switches on only when its own switch moves.",
        mistakes: ["Client-only rendering for content that should be indexed.", "Hydration mismatches between server and client.", "Re-rendering everything on every keystroke."],
        check: [{ q: "SSR versus static generation?", a: "SSR renders on each request; static generation renders once at build time." }, { q: "What is fine-grained reactivity?", a: "Updating only the parts that depend on a changed value." }],
        summary: "Frameworks sync state to the DOM by diffing or fine-grained tracking, and pages can be client-rendered, server-rendered or static." },
    { id: "fe-routing-data", title: "Routing, data fetching and forms", level: "advanced",
        objectives: ["Explain client-side routing", "Handle loading, error and empty states", "Validate forms on client and server"],
        intro: "Single-page apps change the URL with the History API and render the matching view without a full reload; routes with parameters such as /orders/:id work like server routes. Every data request has loading, success, empty and error states that the interface must show. Forms validate on the client for quick feedback and again on the server, which is the real authority.",
        blocks: [
            { type: "jsrun", heading: "Your turn: match routes with parameters", exercise: "be-x-route" },
            { type: "quiz", questions: [
                { q: "The orders request fails. What should the page show?", options: ["A clear error with a way to retry", "An empty list as if there were no orders"], answer: 0, explain: "Silent failures look like missing data." },
                { q: "Is client-side validation enough?", options: ["No: the server must validate too", "Yes"], answer: 0, explain: "Clients can be bypassed." }
            ] }
        ],
        why: "Routing, data states and forms make up most real frontend work and many user-visible bugs.",
        analogy: "Client-side routing is turning pages in a booklet instead of fetching a new booklet each time.",
        mistakes: ["No loading or error states.", "Client-only validation.", "Deep links that break on refresh because the server does not serve the app."],
        check: [{ q: "Which four states does a data request have?", a: "Loading, success, empty and error." }, { q: "Why validate on the server too?", a: "The browser can be bypassed." }],
        summary: "Route with parameters, design every data state and validate forms on both sides." },
    { id: "fe-choosing", title: "Choosing a framework and performance basics", level: "advanced",
        objectives: ["Compare React, Vue, Angular and Svelte at a high level", "Know when no framework is right", "Keep bundles and renders lean"],
        intro: "React has the largest ecosystem; Vue is approachable with clear templates; Angular is an all-in-one framework popular in large enterprises; Svelte compiles components to small, fast code. Many content sites need little or no framework, like this one, which uses static HTML and small modules. Whatever the choice, ship less JavaScript: split code by route, lazy-load heavy features and avoid unnecessary re-renders.",
        blocks: [
            { type: "quiz", heading: "Your turn", questions: [
                { q: "A content site with a few interactive calculators. Sensible approach?", options: ["Static pages with small, lazily loaded scripts", "A large single-page app for every page"], answer: 0, explain: "Less JavaScript, faster pages; frameworks earn their place in complex, stateful apps." },
                { q: "What is code splitting?", options: ["Loading only the JavaScript a route needs", "Writing shorter functions"], answer: 0, explain: "Bundlers split by route or by dynamic import." },
                { q: "Why do Playwright tests suit any of these frameworks?", options: ["They test the rendered page as users see it", "They require React"], answer: 0, explain: "User-facing locators are framework-independent." }
            ] }
        ],
        why: "Framework choice affects hiring, speed and maintenance for years.",
        analogy: "Choosing a framework is choosing a vehicle: a lorry for heavy loads, a bicycle for short trips.",
        mistakes: ["Choosing by hype.", "Shipping a framework for a static page.", "Never measuring bundle size."],
        check: [{ q: "What does lazy loading do?", a: "Loads a feature's code only when it is needed." }, { q: "When might no framework be best?", a: "For mostly static content with small, isolated interactions." }],
        summary: "Choose a framework for the problem and team, prefer less JavaScript, and split and lazy-load what you ship." }
];

export const interview = {
    howTo: "Answer each question before opening the explanation.",
    description: "8 frontend framework interview questions with explained answers: components, props, state, immutability, keys, rendering strategies, hydration and performance.",
    coding: [],
    quiz: [
        { q: "Props versus state?", options: ["Inputs from a parent versus data a component owns", "The same"], answer: 0, explain: "Data down, events up." },
        { q: "Why keys on list items?", options: ["Stable identity across renders", "Styling"], answer: 0, explain: "Avoid index keys for changing lists." },
        { q: "Why immutable updates?", options: ["Change detection by reference", "They use less memory"], answer: 0, explain: "Mutations may not re-render." },
        { q: "What is a reducer?", options: ["A pure (state, action) => state function", "A CSS tool"], answer: 0, explain: "useReducer, Redux." },
        { q: "SSR versus CSR?", options: ["Server renders HTML per request versus browser renders it", "The same"], answer: 0, explain: "SEO and speed trade-offs." },
        { q: "What is hydration?", options: ["Making server-rendered HTML interactive", "Caching"], answer: 0, explain: "Mismatches cause bugs." },
        { q: "How do frameworks prevent XSS by default?", options: ["They escape text", "They block all scripts"], answer: 0, explain: "Raw HTML APIs bypass it." },
        { q: "What is code splitting?", options: ["Loading only needed JavaScript", "Splitting CSS files"], answer: 0, explain: "Per route or feature." }
    ]
};
