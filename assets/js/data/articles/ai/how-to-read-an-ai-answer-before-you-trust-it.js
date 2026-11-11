/* =========================================================
   ToolZen Hub
   Article Data

   Body content only. Metadata lives in data/articles.js.

   Article:
   How to Read an AI Answer Before You Trust It

   Category:
   AI

   The question: what in an assistant's answer needs checking, and how? The method is the one the AI Answer
   Evidence Checklist applies: find the figures, the sources and the absolute wording, see what the answer leaves
   out, and ask the assistant to show its working. No accuracy statistics are quoted; the claims are about method.
========================================================= */


const article = {

    introduction:
        "An assistant's answer arrives fluent, confident and complete, whether or not it is right. Fluency is not evidence. The good news is that a wrong answer usually leaves marks that can be found in a minute: a figure with no source, a date that may have passed, an \"always\" where there is an exception, and a silence where an assumption should be. This guide is the reading method, and what to do with what you find.",

    author: { name: "ToolZen Hub", type: "Organization", role: "AI Workflow Guides" },

    tags: ["AI Answers", "Verification", "ChatGPT", "Working with AI"],

    keyTakeaways: [
        "Confidence and fluency are not evidence. Read an AI answer the way you would read a stranger's: for what can be checked.",
        "Figures, money, percentages and dates are the first things to verify; they are also the easiest to get wrong and the easiest to check.",
        "A named source must be found, not trusted. A study, a report or a law that cannot be located counts as unsupported.",
        "Absolute words (always, never, guaranteed, the only) are where answers overreach; ask for the exception.",
        "Notice what is missing: no source, no assumption, no date for the figures, no limitation.",
        "Put the questions back to the assistant in the same chat: what it is least sure of, where each figure comes from, what would make it wrong."
    ],

    calculator: {
        description:
            "Paste the answer and get the list of statements to check, each with how to check it, what the answer leaves out, and the questions to ask back. It finds what to verify; it does not know what is true."
    },

    tableOfContents: [
        { id: "fluency-is-not-evidence", label: "Fluency Is Not Evidence" },
        { id: "start-with-the-figures", label: "Start With the Figures" },
        { id: "find-the-source-yourself", label: "Find the Source Yourself" },
        { id: "absolute-words", label: "Absolute Words" },
        { id: "what-is-missing", label: "What Is Missing" },
        { id: "ask-the-assistant-to-show-its-working", label: "Ask the Assistant to Show Its Working" },
        { id: "article-faq-title", label: "Frequently Asked Questions" }
    ],

    sections: [
        {
            id: "fluency-is-not-evidence",
            heading: "1. Fluency Is Not Evidence",
            paragraphs: [
                "An assistant produces the most plausible continuation of the text so far. When it knows the subject well, plausible and true coincide. When it does not, the text is just as fluent, and nothing in the tone tells you which case you are in. So the tone carries no information, and the reading has to be about content.",
                "The useful habit is to separate the answer into statements that can be checked and statements that cannot. A checkable statement names a number, a date, a source or an absolute; it can be confirmed or refuted. A general statement (\"debt funds suit some investors\") cannot be checked and should not carry weight."
            ]
        },
        {
            id: "start-with-the-figures",
            heading: "2. Start With the Figures",
            paragraphs: [
                "Money, percentages, dates and counts are the first things to check, for two reasons. They are the statements most likely to be wrong, because an assistant will produce a plausible figure where it has no exact one. And they are the easiest to check, because a figure either matches a source or it does not.",
                "For each one ask three things: where does it come from, what date does it apply to, and what is it a percentage of or a total of? \"FD rates are around 7.5%\" needs a bank, a tenure and a date before it means anything; the same sentence was true, false and in between within one year."
            ]
        },
        {
            id: "find-the-source-yourself",
            heading: "3. Find the Source Yourself",
            paragraphs: [
                "\"According to a 2023 report\", \"studies show\", \"the law requires\" sound like evidence and are not, until you have the report, the study or the section in front of you. Assistants can produce a named source that reads correctly and does not exist, or that exists and says something else. Treat a named source as a claim about the source, and check it the same way.",
                "The rule is simple: a source you cannot find is an unsupported statement. For anything you will publish, send or act on, the assistant's name is not a citation; the primary source you have seen is."
            ]
        },
        {
            id: "absolute-words",
            heading: "4. Absolute Words",
            paragraphs: [
                "\"Always\", \"never\", \"guaranteed\", \"the only\", \"completely safe\", \"risk-free\". A true statement with an absolute word usually has an exception the answer did not give, and the exception is often the part that applies to you. \"Debt funds are always more tax-efficient\" was once broadly true, then changed with the rules, and was never true for every holder.",
                "You do not need to know the exception to ask for it. \"Give one exception to each absolute statement\" is a cheap question that reliably improves an answer."
            ]
        },
        {
            id: "what-is-missing",
            heading: "5. What Is Missing",
            paragraphs: [
                "Some problems are in what the answer does not say. No source at all. No assumption stated, though the answer plainly assumed a country, a date or a version. Figures with no date, in a subject where figures change. No limitation, exception or downside, in a subject that has them. An answer with none of these is not necessarily wrong, but it has given you nothing to check it against, and that is itself a warning.",
                "A quick scan for these four is the fastest check there is, and it needs no knowledge of the subject."
            ]
        },
        {
            id: "ask-the-assistant-to-show-its-working",
            heading: "6. Ask the Assistant to Show Its Working",
            paragraphs: [
                "The assistant that wrote the answer is also the fastest way to test it, if you ask the right questions in the same chat: which of your statements are you least sure of, and why? For each figure, where does it come from and what date does it apply to? What would have to be true for this answer to be wrong? What did you assume about my situation that I did not tell you?",
                "These questions often change the answer, which is the point. An answer that survives them is worth checking further; one that collapses under them has saved you the checking."
            ]
        }
    ],

    example: {
        heading: "Example: One Paragraph, Read Properly",
        paragraphs: [
            "\"For most people in India, a bank fixed deposit is the safer choice. FD rates are currently around 7.5% for 5 years, and deposits up to ₹5 lakh are insured. According to a 2023 report, debt funds returned 6.2% on average over the same period, but returns are never guaranteed. Debt funds are always more tax-efficient because of indexation.\"",
            "To check: the 7.5% (which bank, which date), the ₹5 lakh insurance limit (an official figure with a source), the 2023 report (find it; does it say 6.2%, over which period), \"never guaranteed\" (true, but an absolute), and \"always more tax-efficient because of indexation\" (an absolute about a rule that has changed; the exception is the whole point). Missing: no assumption about the reader's tax rate or horizon, no date for the figures. Five minutes with the checklist turns a confident paragraph into four questions, and at least one of them changes the decision."
        ]
    },

    biggerPicture: {
        heading: "The Bigger Picture",
        text:
            "None of this requires distrusting assistants. It requires reading them the way a good editor reads a draft: for the claims, not the prose. Figures, sources, absolutes, omissions, then the questions back. Done once or twice it becomes automatic, and the answers you accept are the ones that earned it."
    },

    considerations: [
        "Separate checkable statements from general ones.",
        "Verify every figure: source, date, and what it measures.",
        "Find each named source yourself.",
        "Ask for the exception to each absolute statement.",
        "Scan for what is missing: source, assumption, date, limitation.",
        "Ask the assistant what it is least sure of."
    ],

    faq: [
        {
            question: "Does the AI Answer Evidence Checklist tell me whether an answer is correct?",
            answer: "No. It finds the statements that can be checked and says how, using word patterns in your browser. It knows nothing about the subject. A statement it did not list can still be wrong, and one it listed can be right."
        },
        {
            question: "Is this only for money and legal questions?",
            answer: "Those are where a wrong figure costs most, so check hardest there. But the method is the same for code (check every named API, flag and version against the documentation, and run it in a safe place), for facts you will publish, and for anything you are learning."
        },
        {
            question: "Why not just ask the assistant whether it is sure?",
            answer: "Because it will say yes in the same fluent tone. Ask specific questions instead: where does this figure come from, what date does it apply to, what is the exception, what did you assume. Specific questions get answers you can check."
        },
        {
            question: "Should I stop using assistants for facts?",
            answer: "No. Use them to draft, to find the right questions and to point at sources, then verify the parts that matter. An assistant plus five minutes of checking is faster than either searching from scratch or trusting blindly."
        },
        {
            question: "Is my pasted answer sent anywhere?",
            answer: "No. The checklist is built in your browser and nothing is stored. Remove anything confidential before you share the checklist itself."
        }
    ]

};

export default article;
