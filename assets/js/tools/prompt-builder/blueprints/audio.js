/* =========================================================
   ToolZen Hub
   AI Prompt Builder blueprints: audio (Stage 7)

   Voiceover, podcast, music and sound effects are separate jobs
   with their own questions: a voice brief never asks about
   instruments and a music brief never asks about pronunciation.
   Voice cloning of a real person is never suggested without their
   consent.
========================================================= */

import { text, area, choose, more } from "./shared.js";

const CATS = [{ id: "audio" }];
const PLANNING_CATS = [{ id: "assistants" }, { id: "audio" }];

const sentence = (parts) => parts.filter(Boolean).join(" ");

const RIGHTS = "You have the right to use it: check the product's licence terms for commercial use, and never imitate a real person's voice without their consent.";

export const BLUEPRINTS = {

    voiceover: {
        deliverable: "a voiceover",
        style: "descriptive",
        categories: CATS,
        depth: "standard",
        questions: [
            area("script", "The script", { essential: true, long: true, rows: 6 }),
            text("language", "Language and accent", { essential: true, placeholder: "English, neutral Indian accent" }),
            text("voice", "Voice", { placeholder: "Warm, mid-pitched adult voice, calm and confident" }),
            choose("pace", "Pace", ["Slow and clear", "Natural", "Brisk", "Varies with the content"]),
            area("pronounce", "Words to pronounce carefully", { rows: 2, hint: "Names, brands, acronyms, with how to say them.", placeholder: "Wi-Fi: \"why-fye\"; ToolZen: \"tool-zen\"" }),
            choose("use", "For", ["A video", "An advert", "An e-learning course", "An audiobook or story", "A phone or app message"])
        ],
        brief: (a) => ({
            text: sentence([`Voice: ${a.voice || "a clear, natural adult voice"}.`, `Language and accent: ${a.language}.`, a.pace ? `Pace: ${a.pace.toLowerCase()}.` : "", a.use ? `For ${a.use.charAt(0).toLowerCase()}${a.use.slice(1)}.` : "", a.pronounce ? `Pronunciation: ${a.pronounce.replace(/\n/g, "; ")}.` : "", `Script:\n${a.script}`])
        }),
        stages: [
            { at: "standard", name: "Prepare the script", objective: "Text written for speaking.", submit: "Your script, in a general assistant.", ask: (a) => `Prepare this script for text to speech in ${a.language}: split long sentences, spell out numbers, dates and abbreviations as they should be said, and mark pauses with a line break. Do not change the meaning.\n\n${a.script}`, expect: "A speakable script.", done: "Read aloud, nothing trips." },
            { at: "standard", name: "Generate", objective: "The audio.", submit: "The prepared script in the voice product; choose the voice and pace in its controls.", ask: () => "Generate the voiceover with the voice and pace described.", expect: "Audio takes.", done: "Pronunciation and pace are right." },
            { at: "detailed", name: "Fix lines", objective: "Correct single lines.", submit: "Only the lines that are wrong.", ask: () => "Regenerate only these lines with the same voice and settings: [paste the lines].", expect: "Corrected lines.", done: "They match the rest." }
        ],
        refine: ["audio"],
        quality: ["Every name and term is pronounced right.", "The pace suits the use, with natural pauses.", "There are no clicks, cuts or sudden changes of tone between lines.", RIGHTS],
        prepare: { required: ["The final script.", "A list of names and terms with how to say them."], optional: ["A sample of the voice style you want."] },
        next: ["Listen on headphones and on a phone speaker.", "Keep the voice settings to use the same voice next time."]
    },

    podcast: {
        deliverable: "a podcast episode plan and script",
        categories: PLANNING_CATS,
        depth: "standard",
        questions: [
            area("topic", "Episode topic", { essential: true, rows: 2 }),
            choose("format", "Format", ["Solo", "Interview", "Two hosts", "Panel"], { essential: true }),
            text("duration", "Length", { placeholder: "25 minutes" }),
            text("audience", "Listeners", { placeholder: "Small business owners" }),
            area("guest", "Guest and what they know", { rows: 2, showIf: (a) => a.format === "Interview" || a.format === "Panel" }),
            area("facts", "Facts and stories to use", { rows: 3 })
        ],
        brief: (a) => ({
            goal: `Plan a ${a.format.toLowerCase()} podcast episode about: ${a.topic}`,
            context: [["Length", a.duration], ["Listeners", a.audience], ["Guest", a.guest], ["Facts and stories", a.facts]],
            requirements: ["A cold open, an introduction, segments with timings, and a close with one takeaway.", /Interview|Panel/.test(a.format) ? "Questions for the guest that draw out stories, with follow-ups." : "A script written for speaking.", "Timings that add up to the length."],
            format: ["A segment table with timings, then the script or questions."],
            avoid: ["Facts or quotes I did not give you; mark claims that need a source."]
        }),
        stages: [
            { at: "standard", name: "Run of show", objective: "The structure.", submit: "The main prompt.", ask: () => "Give the segment table with timings only.", expect: "A run of show.", done: "It fits the length." },
            { at: "standard", name: "Script or questions", objective: "What is said.", submit: "Approval of the structure.", ask: () => "Write the script or the guest questions for each segment.", expect: "Script or questions.", done: "Ready to record." }
        ],
        refine: ["clarity", "style", "accuracy"],
        quality: ["The episode has one clear takeaway.", "Timings add up.", "Facts are yours or checked."],
        prepare: { required: ["The topic and the takeaway."], optional: ["Guest background.", "Stories and examples."] },
        next: ["Send the questions to the guest in advance.", "Record a short test for levels before the full episode."]
    },

    music: {
        deliverable: "a music track",
        style: "descriptive",
        categories: CATS,
        depth: "standard",
        questions: [
            text("genre", "Genre", { essential: true, placeholder: "Lo-fi hip hop" }),
            text("mood", "Mood", { essential: true, placeholder: "Calm, warm, focused" }),
            text("instruments", "Instruments", { placeholder: "Soft piano, vinyl crackle, mellow drums, no vocals" }),
            more(text("tempo", "Tempo", { placeholder: "Slow, around 80 beats per minute" })),
            more(text("duration", "Length", { placeholder: "2 minutes" })),
            more(choose("use", "For", ["Background for a video", "A podcast intro", "A game or app", "Listening on its own"])),
            choose("vocals", "Vocals", ["No vocals (instrumental)", "Vocals with my lyrics", "Wordless vocals"]),
            area("lyrics", "Lyrics", { rows: 5, showIf: (a) => a.vocals === "Vocals with my lyrics" })
        ],
        brief: (a) => ({
            text: sentence([`${a.genre} track.`, `Mood: ${a.mood}.`, a.tempo ? `Tempo: ${a.tempo}.` : "", a.instruments ? `Instruments: ${a.instruments}.` : "", a.duration ? `About ${a.duration}.` : "", a.use ? `For ${a.use.charAt(0).toLowerCase()}${a.use.slice(1)}.` : "", a.vocals ? `${a.vocals}.` : "", a.lyrics ? `Lyrics:\n${a.lyrics}` : ""]),
            avoid: ["imitating a named artist or a copyrighted song"]
        }),
        stages: [
            { at: "standard", name: "Generate", objective: "First versions.", submit: "The main prompt.", ask: () => "Generate the track as described.", expect: "A few versions.", done: "One fits the mood." },
            { at: "standard", name: "Adjust", objective: "Closer to the brief.", submit: "The best version.", ask: () => "Keep the melody and mood; change only: [for example fewer drums, softer ending].", expect: "An adjusted version.", done: "It fits where it will be used." }
        ],
        refine: ["audio"],
        quality: ["The mood fits where it will be used.", "It loops or ends cleanly, as needed.", "It does not sound like a copy of a known song.", RIGHTS],
        prepare: { required: ["Where the music will be used and how long it must be."], optional: ["Lyrics you wrote.", "A description of tracks you like (not the tracks themselves)."] },
        next: ["Check the product's licence before using the track in anything public or commercial.", "Play it under your video or voice at the real volume."]
    },

    "sound-effects": {
        deliverable: "sound effects",
        style: "descriptive",
        categories: CATS,
        depth: "short",
        questions: [
            area("sound", "The sound", { essential: true, rows: 2, placeholder: "Footsteps on wet gravel, slow walk" }),
            text("environment", "Environment", { placeholder: "Outdoors, light rain, distant traffic" }),
            text("duration", "Length", { placeholder: "4 seconds" }),
            choose("character", "Character", ["Realistic", "Cartoon", "Sci-fi", "Retro game"])
        ],
        brief: (a) => ({
            text: sentence([`${a.sound}.`, a.environment ? `Environment: ${a.environment}.` : "", a.character ? `${a.character} style.` : "", a.duration ? `About ${a.duration}.` : "", "No music, no voices."])
        }),
        stages: [],
        refine: ["audio"],
        quality: ["It sounds right at the moment it plays, with the picture or voice.", "It starts and ends cleanly.", RIGHTS],
        prepare: { required: ["The moment the sound is for."], optional: [] },
        next: ["Generate a few versions and pick by listening with the picture."]
    }

};
