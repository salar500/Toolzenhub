# 04 Learning-science evidence

**PROPOSED — NOT APPROVED FOR IMPLEMENTATION**

**Owner decision recorded 2026-10-28:** the Option B scope baseline in doc 18 was approved with conditions. Only what doc 18 records as approved is approved; everything else in this document remains a proposal for Master Prompt 2 to develop. No implementation has started.

Practice Labs & Smart Flashcards ecosystem, Prompt 1 of 3 (research and requirements). Written 2026-10-28. Nothing here is a rule, a build queue or an approval; the rulebook is `docs/product-decision-rules.md`.

Evidence labels used throughout: **OBSERVED** (seen on a public page or in the repository this session), **CLAIMED** (stated by the source about itself, not verified), **INFERRED** (reasoned from observations), **UNKNOWN** (not established). **VERIFIED/HYPOTHESIS** follow rulebook 12.

## How the sources were checked

Each source below was located through a web search that returned the journal reference, abstract or a university or publisher page; the full text of Dunlosky et al. 2013 was **not** opened (the sources found for it were press releases and secondary summaries, so what is said of it is **secondary**). Where a principle has no source consulted this session it is marked **not researched** and the design stance is a hypothesis. Nothing here says that any technique or algorithm guarantees retention or learning improvement.

## Principles, sources and design decisions

| Principle | Source consulted | What the source says (as checked) | Check level | Decision for browser-local practice |
|---|---|---|---|---|
| Active recall and retrieval practice | Roediger and Karpicke 2006, Psychological Science 17(3), 249-255 | Students who took recall tests retained more at 2 days and 1 week than students who only restudied, although restudying looked better after 5 minutes; students who restudied felt more confident. Authors conclude testing is a powerful learning tool, not only a way to assess. | Abstract-level, via search results | Every card and lab asks the learner to produce or choose an answer before seeing the answer. No claim about size of benefit. |
| Spaced repetition | Cepeda, Pashler, Vul, Wixted and Rohrer 2006, Psychological Bulletin 132(3), 354-380 (PubMed 16719566) | A quantitative synthesis of 839 assessments in 317 experiments from 184 articles: the best gap between study sessions depends on how long the material must be kept; spacing and retention interval act together. | Abstract-level, via search results | A spacing schedule helps in general, but no single interval is "optimal"; use fixed, explainable intervals and say so. |
| Ranking of study techniques | Dunlosky, Rawson, Marsh, Nathan and Willingham 2013, Psychological Science in the Public Interest 14(1), 4-58 | Rated practice testing and distributed practice as high utility; elaborative interrogation, self-explanation and interleaved practice as moderate; summarisation, highlighting and rereading as low. | Secondary summaries only | Supports retrieval and spacing as the core mechanisms; no gamification or highlighting features. |
| Feedback timing and quality | Hattie and Timperley 2007, Review of Educational Research 77(1), 81-112 | Feedback can help or hurt; a model asks where the learner is going, how they are going and where to next; feedback about the task and process is more useful than about the person. | Abstract-level, via search results | Feedback names the failed condition, explains the reasoning, and points to a next step; it never praises or judges the person. Immediate versus delayed feedback was not researched further, so immediate feedback after an explicit Check is a design choice, not an evidence-based optimum. |
| Interleaving | Dunlosky et al. 2013 (rating only) | Rated moderate utility. | Secondary | Mixed-topic review is available as a topic filter default of all topics; no claim of effect size. |
| Worked examples and cognitive load | Not consulted at primary level. A search returned only an encyclopedia article naming Sweller and Cooper's work on worked examples. | The worked-example effect is attributed to Sweller and Cooper; primary papers were not opened. | **Not verified** | Each lab opens with one worked example because it is a common instructional pattern (HYPOTHESIS), and one task is shown at a time to keep the screen simple. |
| Deliberate practice | Not researched this session | n/a | **Not researched** | Progressive difficulty with a written rubric (a design choice). |
| Mastery-based progression | Not researched this session | n/a | **Not researched** | No mastery indicators are proposed (doc 07 item 48 REJECT): a few self-graded cards cannot establish mastery. |
| Error correction | Hattie and Timperley (feedback) only | See feedback row | Abstract-level | Missed cards are revisited in a session and, with saving on, move back to the first box. |
| Transfer from recall to application | Not researched this session | n/a | **Not researched** | The lab-to-flashcard loop pairs applying a skill (lab) with recalling the concept (card); its effect is a HYPOTHESIS to be tested by the owner, not claimed. |

## Spaced-repetition schedulers

**SM-2** (SuperMemo, read at super-memory.com): intervals 1 day, 6 days, then the previous interval multiplied by the item's easiness factor (initial 2.5); the factor is updated after each repetition by `EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))` with a floor of 1.3; response quality q runs from 0 to 5; a quality below 3 restarts the repetitions. OBSERVED.

**FSRS** (Anki documentation): an alternative scheduler that fits parameters to the learner's review history by machine learning, needs several reviews to tune, has a default desired retention of 90 percent, warns that workloads rise sharply above that, advises staying below 97 percent, and says low review counts (under a few hundred) are a common reason it may not perform well. The FSRS project's own algorithm pages could not be read in detail this session (the page fetched did not describe the model); the three-variable description (difficulty, stability, retrievability) comes from a search summary and is secondary. OBSERVED for the Anki statements; INFERRED for the rest.

**Leitner-style boxes** (proposed): five boxes with fixed intervals of 1, 3, 7, 14 and 30 days; known moves up a box, not known returns to box 1. This is a well-known simple scheme. No source was consulted this session for its effectiveness, so it is proposed purely for explainability, determinism and low cost, not as the "best" schedule.

### Recommendation

Use the **Leitner-style fixed-interval box scheduler** (FR-FC-016). Reasons: it is a pure function of the saved state, the grade and a date, so it can be tested exactly; a learner can see why a card is due; it needs no optimiser, no review history and no AI; and it matches a deck of about 36 cards a learner will see repeatedly. **Reject FSRS for this stage**: it adds an optimiser and a parameter set, depends on review history that a new, opt-in, browser-local tool will not have, is hard to explain to a learner, and its benefit at this scale is not established here. Revisit only if real usage shows learners with hundreds of reviews and a clear need. User control: saving is opt-in, progress can be reset and exported (doc 12).

## Limits

The claims in this document rest on abstracts, publisher or repository pages and secondary summaries read this session. No meta-analysis beyond Cepeda et al. was read; no reading was done on effect sizes, age or expertise moderators, or on code-specific learning. The package therefore makes no claim of learning improvement and bans such claims in page wording (FR-LRN-013).
