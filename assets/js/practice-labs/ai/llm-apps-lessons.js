/* =========================================================
   ToolZen Hub
   Building LLM Applications path: lessons (original to this site). No model is called: the application logic around
   a model (chunking, retrieval, budgeting, validation, retries) is real JavaScript run against tests in an isolated
   worker, and model behaviour is shown with deterministic teaching models and schema tasks.
========================================================= */

export const lessons = [
    { id: "llm-architecture", title: "The architecture of an LLM application", level: "intermediate", prerequisite: "AI and LLM Foundations and JavaScript basics.",
        objectives: ["Name the parts of an LLM application", "Trace a request through retrieval, prompting and validation", "Decide what belongs in code rather than in the prompt"],
        intro: "An LLM application is mostly ordinary software around a model call: it authenticates the user, retrieves relevant data, builds a prompt within a token budget, calls the model API (with streaming, timeouts and retries), validates the output, possibly runs tools, and logs everything for evaluation. Rules that must always hold, such as permissions and refunds limits, belong in code, not only in the prompt.",
        blocks: [
            { type: "order", heading: "Your turn: one request through the app", prompt: "Order what ShopLite's support assistant does for one customer question.", items: ["Authenticate the customer and load their permissions", "Retrieve the most relevant help passages and order data", "Build the prompt within the token budget", "Call the model with a timeout and retries", "Validate the output (schema, tool arguments, policy)", "Show the answer and log the exchange for evaluation"], explain: "Retrieval and budgeting before the call; validation and logging after it." },
            { type: "quiz", questions: [
                { q: "Where should 'refunds above ₹5,000 need a human' be enforced?", options: ["In code that checks every refund tool call", "Only in the system prompt"], answer: 0, explain: "Prompts guide the model; code enforces policy." }
            ] }
        ],
        why: "Teams that treat the model as one component, surrounded by tested code, ship reliable AI features.",
        analogy: "The model is a talented new employee; the application is the process, checks and supervision around them.",
        mistakes: ["Business rules only in the prompt.", "No timeouts or retries on model calls.", "No logging, so problems cannot be evaluated."],
        check: [{ q: "Name three parts of an LLM app besides the model call.", a: "For example retrieval, prompt building, output validation, tools and logging." }, { q: "Where do must-hold rules live?", a: "In code." }],
        summary: "Build LLM apps as software around a model call: retrieve, budget, call robustly, validate, act safely and log." },
    { id: "llm-rag", title: "Retrieval-augmented generation in practice", level: "intermediate",
        objectives: ["Chunk documents with overlap", "Rank chunks by cosine similarity", "Fit retrieved text into a token budget"],
        intro: "RAG quality depends on its plumbing. Documents are split into chunks small enough to be specific but large enough to keep meaning, with some overlap so sentences at boundaries are not lost. Chunks are embedded and ranked by similarity to the question, and the best are added to the prompt until the token budget, minus space reserved for instructions and the answer, is used.",
        blocks: [
            { type: "jsrun", heading: "Your turn: chunk a document", exercise: "llm-x-chunk" },
            { type: "jsrun", heading: "Your turn: rank by similarity", exercise: "llm-x-topk" },
            { type: "jsrun", heading: "Your turn: fit the context budget", exercise: "llm-x-budget" }
        ],
        why: "Most wrong RAG answers come from bad chunks, bad ranking or truncated context, not from the model.",
        analogy: "Chunking is cutting a book into index cards; retrieval is picking the right cards; the budget is the size of the desk.",
        mistakes: ["Chunks so large that retrieval is vague.", "Raw dot products instead of cosine similarity.", "No space reserved for the answer."],
        check: [{ q: "Why overlap chunks?", a: "So information spanning a boundary appears whole in at least one chunk." }, { q: "Why reserve tokens?", a: "Instructions and the answer also need room in the context window." }],
        summary: "Chunk with overlap, rank by cosine similarity and fill the context within a budget that leaves room for the answer." },
    { id: "llm-tools-safety", title: "Tool calling, validation and guardrails in code", level: "advanced",
        objectives: ["Validate model-proposed tool calls", "Design least-privilege tools", "Combine prompt and code guardrails"],
        intro: "When a model proposes an action, the application decides whether to run it. Parse the output safely, allow only known tools, validate every argument against strict rules, check the user's permission and require confirmation for actions with real effects. Treat model output exactly like untrusted user input.",
        blocks: [
            { type: "jsrun", heading: "Your turn: validate a tool call", exercise: "llm-x-validate-call" },
            { type: "schema", heading: "Your turn: produce a valid tool call", exercise: "pe-s-tool-call" }
        ],
        why: "Prompt injection becomes dangerous only when unchecked output can trigger actions; validation closes that door.",
        analogy: "The model fills in a request form; your code is the clerk who checks it before anything happens.",
        mistakes: ["JSON.parse without a try.", "Passing model text into queries or commands.", "Tools with broad permissions."],
        check: [{ q: "How should model output be treated?", a: "As untrusted input: parsed safely and validated." }, { q: "What is a least-privilege tool?", a: "One that can only do the narrow thing its task needs." }],
        summary: "Parse model output safely, allow-list tools, validate arguments and permissions, and confirm risky actions." },
    { id: "llm-reliability", title: "Reliability, cost and latency", level: "advanced",
        objectives: ["Retry with exponential backoff", "Estimate cost and latency", "Use streaming and caching"],
        intro: "Model APIs fail and rate-limit (429), so calls need timeouts and retries with exponential backoff and jitter, respecting Retry-After. Cost scales with input and output tokens, so retrieval and prompts should be lean. Streaming shows the answer as it is generated, improving perceived speed; caching repeated requests saves cost; a smaller model often suffices for simple steps.",
        blocks: [
            { type: "jsrun", heading: "Your turn: backoff delays", exercise: "llm-x-backoff" },
            { type: "aiviz", kind: "context", heading: "Try it: the context budget", text: "Every token in the window is paid for and adds latency. Shrink the document and see how much room is left for the answer." }
        ],
        why: "Users abandon slow assistants and finance teams notice token bills; reliability engineering applies to AI too.",
        analogy: "Backoff is waiting longer between knocks when nobody answers, instead of hammering the door.",
        mistakes: ["Immediate retries in a loop.", "Sending whole documents every time.", "One large model for every small task."],
        check: [{ q: "What does exponential backoff do?", a: "Doubles the wait between retries, up to a cap." }, { q: "Two ways to cut cost?", a: "Shorter prompts with better retrieval, caching, and smaller models for simple steps." }],
        summary: "Make calls robust with timeouts and backoff, keep tokens lean, stream answers and cache what repeats." },
    { id: "llm-testing", title: "Testing and evaluating LLM applications", level: "advanced",
        objectives: ["Unit-test the code around the model", "Build an evaluation set for the model's behaviour", "Run evaluations before releases"],
        intro: "Test an LLM app in two layers. The deterministic code (chunking, ranking, validation, budgeting, retries) gets ordinary unit tests, as in this path's exercises. The model's behaviour gets an evaluation set: realistic and adversarial inputs with expected properties (grounded facts, refusals, format), scored by rules or reviewers, re-run on every prompt or model change and tracked over time.",
        blocks: [
            { type: "write", heading: "Your turn: design evaluation inputs", exercise: "ai-w-eval-inputs" },
            { type: "quiz", questions: [
                { q: "A prompt change improves 3 hand-tried answers. Ship it?", options: ["Only after the full evaluation set shows no regressions", "Yes"], answer: 0, explain: "Evaluate the whole set." },
                { q: "Which part should have classic unit tests?", options: ["Chunking, validation and other code around the model", "The model's exact wording"], answer: 0, explain: "Test code deterministically; evaluate model behaviour by properties." }
            ] }
        ],
        why: "Without both layers, teams cannot tell whether a change made the assistant better or worse.",
        analogy: "Unit tests check the car's parts; the evaluation set is the road test.",
        mistakes: ["No tests for the surrounding code.", "Exact-text assertions on model output.", "Evaluating once and never again."],
        check: [{ q: "What are the two testing layers?", a: "Unit tests for the deterministic code and an evaluation set for model behaviour." }, { q: "When do you re-run evaluations?", a: "On every prompt, model, retrieval or data change." }],
        summary: "Unit-test the code around the model and evaluate its behaviour with a versioned evaluation set on every change." }
];

export const interview = {
    howTo: "Answer each question before opening the explanation.",
    description: "8 LLM application interview questions with explained answers: architecture, RAG plumbing, tool validation, reliability, cost and evaluation.",
    coding: [],
    quiz: [
        { q: "Where should hard business rules live?", options: ["In code", "Only in the prompt"], answer: 0, explain: "Prompts can be bypassed." },
        { q: "Why chunk with overlap?", options: ["Keep boundary information intact", "Use more tokens"], answer: 0, explain: "Better retrieval." },
        { q: "Why cosine similarity?", options: ["Compares direction, not vector length", "It is faster than everything"], answer: 0, explain: "Normalised." },
        { q: "How to treat model output?", options: ["As untrusted input", "As trusted code"], answer: 0, explain: "Validate everything." },
        { q: "How to handle 429 responses?", options: ["Backoff with jitter, respect Retry-After", "Retry immediately"], answer: 0, explain: "Exponential backoff." },
        { q: "Two ways to reduce latency?", options: ["Streaming and smaller prompts or models", "Bigger prompts"], answer: 0, explain: "Also caching." },
        { q: "What is unit-tested in an LLM app?", options: ["The deterministic code around the model", "The model's wording"], answer: 0, explain: "Evaluate behaviour separately." },
        { q: "When re-run evaluations?", options: ["On every prompt, model or data change", "Once a year"], answer: 0, explain: "Catch regressions." }
    ]
};
