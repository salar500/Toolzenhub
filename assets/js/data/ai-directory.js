/* =========================================================
   ToolZen Hub
   AI products directory (owner instruction, 2026-11-15)

   External AI products, listed inside the AI Tools section at
   /ai-tools/directory/. They are not ToolZen Hub tools: each
   card says so and opens the product's official site.

   How an entry gets here (and stays):
   - The official page was opened on `verifiedOn`, and the
     summary, access and pricing say only what that page said.
   - `pricing` is the page's own wording, reduced to one of
     PRICING's keys; "check" when the page states nothing.
     No price is ever shown.
   - No ranking, rating, "popular" or "best", no paid
     placement, no referral or tracking parameter, no logo.
   - Re-check every entry at least every six months
     (scripts/ai-directory-report.mjs lists the overdue ones).
     An entry whose official address now leads to another
     product is removed, not edited to fit.

   Checked 2026-11-15 and left out until checked by hand:
   Canva, Julius AI and the OpenAI API (their pages refused
   the check); Perplexity (its pages did not describe the
   product); Windsurf, Tabnine, Gemini Code Assist for
   individuals, JetBrains AI and Postman Postbot (their
   addresses led to a different or retired product).
========================================================= */

export const VERIFIED = "2026-11-15";

/* in display order; a category is shown only when it has entries */
export const AI_CATEGORIES = Object.freeze([
    { id: "assistants", label: "AI assistants" },
    { id: "coding", label: "Coding and development" },
    { id: "testing", label: "Testing and QA" },
    { id: "data", label: "Data and analytics" },
    { id: "research", label: "Research" },
    { id: "writing", label: "Writing and editing" },
    { id: "images", label: "Images" },
    { id: "video", label: "Video" },
    { id: "audio", label: "Audio and voice" },
    { id: "meetings", label: "Meetings and transcription" },
    { id: "design", label: "Design and presentations" },
    { id: "automation", label: "Automation and agents" },
    { id: "learning", label: "Learning" },
    { id: "platforms", label: "Models and developer platforms" }
]);

export const AI_AUDIENCES = Object.freeze([
    { id: "developers", label: "Developers", phrase: "developers" },
    { id: "qa", label: "QA testers", phrase: "QA testers" },
    { id: "data", label: "Data and BI analysts", phrase: "data and BI analysts" },
    { id: "professionals", label: "General professionals", phrase: "general professionals" },
    { id: "creators", label: "Content creators", phrase: "content creators" }
]);

export const PRICING = Object.freeze({
    "free": "Free, per its site",
    "free-plan": "Free plan stated on its site",
    "free-start": "Free to start, per its site",
    "free-trial": "Free trial stated on its site",
    "open-source": "Open source",
    "paid": "Needs a paid plan",
    "check": "Check the official site for pricing"
});

export const KINDS = Object.freeze({
    "product": "Product",
    "feature": "Feature inside another product",
    "platform": "Developer platform",
    "open-source": "Open-source project"
});

const entry = (id, name, by, url, kind, categories, audiences, summary, access, pricing, note = "") =>
    Object.freeze({ id, name, by, url, kind, categories, audiences, summary, access, pricing, note, verifiedOn: VERIFIED });

export const AI_PRODUCTS = Object.freeze([

    /* assistants */
    entry("chatgpt", "ChatGPT", "OpenAI", "https://chatgpt.com/", "product", ["assistants"], ["professionals", "developers", "data", "creators"],
        "A general AI assistant for conversation, writing, coding help and creating images.", ["Web"], "check"),
    entry("claude", "Claude", "Anthropic", "https://claude.com/product/overview", "product", ["assistants"], ["professionals", "developers", "data"],
        "An AI assistant for writing and analysis that can produce documents, spreadsheets and slides from your files and connected tools.", ["Web", "Desktop", "iOS", "Android", "Browser extension"], "check"),
    entry("gemini", "Gemini", "Google", "https://gemini.google/about/", "product", ["assistants"], ["professionals", "creators"],
        "Google's AI assistant, with live voice conversations, image generation and editing, and Deep Research.", ["Web", "Desktop", "Android", "iOS"], "check"),
    entry("microsoft-copilot", "Microsoft Copilot", "Microsoft", "https://copilot.com/", "product", ["assistants"], ["professionals"],
        "Microsoft's AI assistant for chat, search, content creation and everyday tasks.", ["Web", "Windows", "Mac", "iOS", "Android"], "free", "Free with a signed-in Microsoft account, per its site."),

    /* coding */
    entry("github-copilot", "GitHub Copilot", "GitHub", "https://github.com/features/copilot", "product", ["coding"], ["developers"],
        "An AI coding assistant across the software lifecycle, from exploring code to reviewing and merging changes.", ["IDE extensions", "CLI", "Web", "Mobile"], "free-plan"),
    entry("cursor", "Cursor", "", "https://cursor.com/", "product", ["coding"], ["developers"],
        "An AI code editor whose agents help plan, write and review software.", ["Desktop (macOS)", "CLI", "Web"], "check"),
    entry("claude-code", "Claude Code", "Anthropic", "https://claude.com/product/claude-code", "product", ["coding"], ["developers", "qa"],
        "An agentic coding tool for bug fixes, tests and larger code changes, used from the terminal, an IDE, the desktop app or the web.", ["macOS", "Linux", "Windows"], "check"),
    entry("amazon-q-developer", "Amazon Q Developer", "Amazon Web Services", "https://aws.amazon.com/q/developer/", "product", ["coding"], ["developers"],
        "An AI coding assistant that writes, tests and reviews code and answers questions about AWS.", ["IDE extensions", "CLI", "AWS Console"], "free-plan", "Its site describes a perpetual free tier with a monthly limit."),
    entry("replit", "Replit", "Replit", "https://replit.com/", "product", ["coding"], ["developers", "professionals"],
        "Describe an app, site or tool in plain language, then build and publish it in the browser.", [], "free-plan"),

    /* testing and QA */
    entry("qodo", "Qodo", "Qodo", "https://www.qodo.ai/", "product", ["testing", "coding"], ["developers", "qa"],
        "AI code review that checks pull requests against your coding standards, using context from across repositories.", ["GitHub", "GitLab", "Bitbucket", "Azure DevOps", "IDE extensions"], "free-trial", "Its site also says it is free for open-source projects."),
    entry("testrigor", "testRigor", "testRigor", "https://testrigor.com/", "product", ["testing"], ["qa"],
        "Write end-to-end tests in plain English and run them on web, mobile, desktop and API targets.", ["Web", "iOS", "Android", "Windows", "API"], "free-start"),
    entry("mabl", "mabl", "mabl", "https://www.mabl.com/", "product", ["testing"], ["qa"],
        "Agentic test automation that creates, runs and maintains tests for web, mobile and API.", ["Web", "iOS", "Android", "API"], "free-trial"),
    entry("applitools", "Applitools", "Applitools", "https://applitools.com/", "product", ["testing"], ["qa", "developers"],
        "Visual AI testing that checks what users actually see in web and mobile apps, PDFs and component libraries.", ["Web", "Mobile apps", "PDF", "Storybook", "Playwright"], "free-trial"),
    entry("testim", "Testim", "Testim", "https://www.testim.io/", "product", ["testing"], ["qa"],
        "AI-assisted UI and functional test automation, including tests created from plain-language prompts and failure analysis in CI.", ["Web", "Salesforce", "iOS", "Android"], "free-start"),
    entry("katalon", "Katalon", "Katalon", "https://katalon.com/", "product", ["testing"], ["qa"],
        "A testing platform for test management, web, mobile, API and desktop automation, and cloud test runs, with AI assistance.", ["Web", "iOS", "Android", "API", "Windows"], "free-start"),
    entry("functionize", "Functionize", "Functionize", "https://www.functionize.com/", "product", ["testing"], ["qa"],
        "Agentic testing of web UI workflows, including enterprise applications such as Salesforce, ServiceNow, Workday and SAP.", ["Web"], "free-plan"),
    entry("playwright-mcp", "Playwright MCP", "Microsoft", "https://github.com/microsoft/playwright-mcp", "open-source", ["testing", "automation"], ["qa", "developers"],
        "A Model Context Protocol server that lets AI assistants drive a browser through Playwright, using accessibility snapshots rather than screenshots.", ["MCP clients (VS Code, Cursor, Claude, Copilot)", "Node.js 18+"], "open-source", "Apache-2.0 licence."),

    /* data and analytics */
    entry("copilot-in-excel", "Copilot in Excel", "Microsoft", "https://support.microsoft.com/en-us/excel/copilot/get-started-with-copilot-in-excel", "feature", ["data"], ["data", "professionals"],
        "Copilot inside Excel builds and edits workbooks with tables, charts, PivotTables and formulas that stay editable.", ["Windows", "Mac", "Web", "iPad", "iPhone", "Android"], "check", "Availability depends on your Microsoft 365 subscription and your organisation's settings."),
    entry("copilot-in-power-bi", "Copilot in Power BI", "Microsoft", "https://learn.microsoft.com/en-us/power-bi/create-reports/copilot-introduction", "feature", ["data"], ["data"],
        "Copilot in Power BI answers questions about your data, summarises reports, and helps write DAX and build report pages.", ["Power BI Desktop", "Power BI service"], "paid", "Needs paid Fabric capacity (F2 or higher) or Power BI Premium (P1 or higher); trial capacities and free SKUs are not supported."),
    entry("rows", "Rows", "Rows", "https://rows.com/product", "product", ["data"], ["data", "professionals"],
        "An AI spreadsheet that imports business data, extracts data from PDFs and answers questions in plain language.", ["Chrome extension (RowsX)", "Mobile"], "check"),
    entry("hex", "Hex", "Hex", "https://hex.tech/", "product", ["data"], ["data"],
        "An analytics platform with notebooks, conversational self-serve analysis and data apps.", [], "free-trial"),

    /* research */
    entry("elicit", "Elicit", "Elicit", "https://elicit.com/", "product", ["research"], ["professionals"],
        "An AI research assistant that searches and summarises scientific literature, with each claim tied to a source passage.", ["API", "MCP server"], "check"),
    entry("consensus", "Consensus", "Consensus", "https://consensus.app/", "product", ["research"], ["professionals"],
        "AI search over scientific papers that gives a synthesised answer with citations.", ["Web"], "check"),
    entry("gemini-notebook", "Gemini Notebook", "Google", "https://notebook.google.com/", "product", ["research"], ["professionals", "creators"],
        "A research assistant that works from the sources you give it and turns them into overviews, mind maps and slide decks.", [], "check"),
    entry("semantic-scholar", "Semantic Scholar", "Ai2", "https://www.semanticscholar.org/", "product", ["research"], ["professionals"],
        "AI-assisted search across scientific literature in every field.", ["Web", "API"], "free"),

    /* writing */
    entry("grammarly", "Grammarly", "Grammarly", "https://www.grammarly.com/", "product", ["writing"], ["professionals", "creators"],
        "An AI writing assistant that checks grammar, clarity and tone wherever you write.", ["Browser extension", "Windows", "Mac", "Microsoft Office", "Google Docs", "iOS", "Android"], "free-plan"),
    entry("deepl-write", "DeepL Write", "DeepL", "https://www.deepl.com/en/write", "product", ["writing"], ["professionals"],
        "An AI writing aid that corrects spelling, grammar and punctuation and suggests other wording and tone.", ["Web", "Windows", "Mac", "iOS", "Android", "Browser extension"], "free-trial"),
    entry("notion-ai", "Notion AI", "Notion", "https://www.notion.com/product/ai", "feature", ["writing", "meetings"], ["professionals"],
        "AI inside Notion that answers questions, drafts documents, searches connected apps and transcribes meetings.", ["Notion app"], "check"),

    /* images */
    entry("adobe-firefly", "Adobe Firefly", "Adobe", "https://firefly.adobe.com/", "product", ["images", "video"], ["creators"],
        "Adobe's AI creative studio for generating images, video and audio with several models in one place.", [], "check"),
    entry("ideogram", "Ideogram", "Ideogram", "https://ideogram.ai/", "product", ["images"], ["creators"],
        "A generative media platform for images and video, with an API.", ["iPhone", "API"], "check", "Its site says the weights of one model are published for local use under its licence."),
    entry("remove-bg", "remove.bg", "", "https://www.remove.bg/", "product", ["images"], ["creators", "professionals"],
        "Removes the background from a photo automatically, giving a transparent PNG or a plain background.", ["Web", "Windows", "Mac", "Linux", "Android", "Photoshop"], "free-start"),

    /* video */
    entry("runway", "Runway", "Runway", "https://runway.com/", "product", ["video", "images"], ["creators"],
        "AI tools to generate and edit video, images and audio, with developer APIs.", ["Web", "iPhone", "Android", "API"], "free-start"),
    entry("descript", "Descript", "Descript", "https://www.descript.com/", "product", ["video", "audio"], ["creators"],
        "Edit video and audio by editing the transcript: deleting words cuts the matching footage.", [], "free-plan"),

    /* audio */
    entry("elevenlabs", "ElevenLabs", "ElevenLabs", "https://elevenlabs.io/", "product", ["audio"], ["creators", "developers"],
        "AI speech generation, voice cloning, transcription and voice agents, with APIs and SDKs.", ["API", "SDKs"], "check"),
    entry("whisper", "Whisper", "OpenAI", "https://github.com/openai/whisper", "open-source", ["audio", "meetings"], ["developers", "data"],
        "An open-source speech recognition model that transcribes and translates speech; you run it yourself with Python.", ["Python package", "Command line"], "open-source", "MIT licence."),

    /* meetings */
    entry("otter", "Otter", "Otter.ai", "https://otter.ai/", "product", ["meetings"], ["professionals"],
        "An AI meeting notetaker that transcribes conversations and writes summaries and action items.", ["Mac", "Windows", "iOS", "Android", "Chrome", "Zoom", "Teams", "Google Meet"], "free-plan"),
    entry("fireflies", "Fireflies.ai", "Fireflies.ai", "https://fireflies.ai/", "product", ["meetings"], ["professionals"],
        "An AI notetaker that transcribes and summarises meetings and tracks action items.", ["Zoom", "Google Meet", "Microsoft Teams"], "free-plan"),

    /* design */
    entry("beautiful-ai", "Beautiful.ai", "Beautiful.ai", "https://www.beautiful.ai/", "product", ["design"], ["professionals"],
        "AI presentation software for building branded slides from templates and smart layouts.", [], "free-trial", "Its site also mentions free plans for students."),
    entry("figma-ai", "Figma AI", "Figma", "https://www.figma.com/ai/", "feature", ["design"], ["creators", "developers"],
        "AI features in Figma for generating and editing designs and code.", ["Figma"], "check"),

    /* automation */
    entry("zapier", "Zapier", "Zapier", "https://zapier.com/", "product", ["automation"], ["professionals"],
        "Automates workflows and AI agents across thousands of connected apps, with admin controls.", [], "free-start"),
    entry("n8n", "n8n", "n8n", "https://n8n.io/", "product", ["automation"], ["developers", "qa"],
        "Build AI agents and workflows from visual, inspectable steps with human approvals; it can be self-hosted.", ["Self-hosted"], "check"),
    entry("langchain", "LangChain", "LangChain", "https://www.langchain.com/", "open-source", ["automation", "platforms"], ["developers"],
        "Open-source frameworks (LangChain, LangGraph) for building AI agents, and the LangSmith platform for testing and monitoring them.", [], "open-source", "The frameworks are open source; LangSmith is a hosted platform."),
    entry("crewai", "CrewAI", "CrewAI", "https://crewai.com/", "platform", ["automation"], ["developers"],
        "A platform for building and running AI agents, with central governance for teams.", [], "check"),

    /* learning */
    entry("khanmigo", "Khanmigo", "Khan Academy", "https://www.khanmigo.ai/", "product", ["learning"], ["professionals"],
        "Khan Academy's AI tutor for learners and teaching assistant for teachers.", [], "check", "Its site says the teacher tools are free and learner and parent access is paid."),

    /* models and platforms */
    entry("claude-platform", "Claude Platform", "Anthropic", "https://platform.claude.com/docs/en/home", "platform", ["platforms"], ["developers"],
        "Anthropic's developer platform for building with Claude models: the Messages API, SDKs in several languages and managed agents.", ["API", "SDKs", "Console"], "check"),
    entry("google-ai-studio", "Google AI Studio", "Google", "https://aistudio.google.com/", "platform", ["platforms"], ["developers"],
        "Google's web studio for building with the Gemini API.", ["Gemini API"], "check"),
    entry("hugging-face", "Hugging Face", "Hugging Face", "https://huggingface.co/", "platform", ["platforms"], ["developers", "data"],
        "A hub for sharing and using machine-learning models, datasets and demo apps, with paid compute.", [], "check"),
    entry("ollama", "Ollama", "Ollama", "https://ollama.com/", "product", ["platforms"], ["developers"],
        "Run open AI models on your own computer, or in its cloud.", ["Desktop download"], "check"),
    entry("mistral", "Mistral AI", "Mistral AI", "https://mistral.ai/", "platform", ["platforms", "assistants"], ["developers"],
        "A chat assistant, a studio for building agents, model hosting, and open-weight models.", [], "check")

]);
