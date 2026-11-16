/* =========================================================
   ToolZen Hub
   AI Workbench blueprints: video (Stage 6)

   A concept and script, a storyboard and shot list, text-to-video
   and image-to-video. Generation prompts are descriptive; for
   image-to-video, what is already in the image is kept apart from
   the motion asked for. Scene by scene continuity is a stage of its
   own. No product syntax, durations or settings are invented: the
   visitor sets them in the product.
========================================================= */

import { text, area, choose, more, ASPECTS, TONES } from "./shared.js";

const CATS = [{ id: "video" }, { id: "assistants" }];
const PLANNING_CATS = [{ id: "assistants" }, { id: "video" }];

const idea = area("idea", "The idea", { essential: true, rows: 3, placeholder: "A 60-second explainer on why bread goes stale, for curious adults" });
const audience = text("audience", "Who watches it", { placeholder: "Curious adults on YouTube Shorts" });
const duration = text("duration", "Length", { essential: true, placeholder: "60 seconds" });
const aspect = choose("aspect", "Shape", ASPECTS);

const sentence = (parts) => parts.filter(Boolean).join(" ");

const VIDEO_QUALITY = [
    "People, hands and objects move naturally, with no warping between frames.",
    "The same character or object looks the same across shots.",
    "Any speech, text or logo on screen is correct, or is added in editing.",
    "You have the right to use it: check the product's terms, and do not depict real people without consent."
];

export const BLUEPRINTS = {

    "video-concept": {
        deliverable: "a video concept and script",
        categories: PLANNING_CATS,
        depth: "standard",
        questions: [idea, audience, duration, choose("platform", "Platform", ["YouTube", "YouTube Shorts, Reels or TikTok", "A website or advert", "Internal or training"]), choose("tone", "Tone", TONES), area("facts", "Facts to use", { rows: 3, hint: "Only facts you know; the AI is told not to add its own." })],
        brief: (a) => ({
            goal: `Develop a video concept and script for: ${a.idea}`,
            context: [["Audience", a.audience], ["Length", a.duration], ["Platform", a.platform], ["Tone", a.tone], ["Facts", a.facts]],
            requirements: ["A hook in the first seconds and one clear idea.", "The script in two columns: what is seen and what is heard, with timings that add up to the length.", "Plain spoken language."],
            format: ["Three concept options in one line each, then the script for the strongest."],
            avoid: ["Facts or statistics I did not give you; mark any claim that needs a source."]
        }),
        stages: [
            { at: "standard", name: "Concepts", objective: "Choose the angle.", submit: "The master prompt.", ask: () => "Give three concept options only, each with its hook.", expect: "Three concepts.", done: "You chose one." },
            { at: "standard", name: "Script", objective: "A timed script.", submit: "Your chosen concept.", ask: (a) => `Write the script for the chosen concept, seen and heard, timed to ${a.duration}.`, expect: "A two-column script.", done: "It fits the length read aloud." }
        ],
        refine: ["clarity", "style", "accuracy"],
        quality: ["The hook makes the point in the first few seconds.", "The timings add up to the length.", "Every fact is yours or checked."],
        prepare: { required: ["The one idea the video gets across.", "The length."], optional: ["Facts and sources.", "Videos whose style you like."] },
        next: ["Turn the script into shots with the task \"a storyboard and shot list\".", "Read it aloud with a timer."]
    },

    storyboard: {
        deliverable: "a storyboard and shot list",
        categories: PLANNING_CATS,
        depth: "standard",
        questions: [
            area("script", "The script or scene outline", { essential: true, long: true, rows: 8 }),
            duration,
            aspect,
            area("look", "Visual style and characters", { rows: 3, placeholder: "Warm documentary look; host: woman in her 30s, green jumper" }),
            choose("making", "How it will be made", ["Filmed", "AI-generated", "A mix", "Animation"])
        ],
        brief: (a) => ({
            goal: "Turn this script into a storyboard and shot list.",
            context: [["Length", a.duration], ["Shape", a.aspect], ["Look and characters", a.look], ["Made by", a.making], ["Script", a.script]],
            requirements: [
                "For each shot: number, duration, shot size, camera movement, what the subject does, setting, audio, and the transition to the next.",
                "Keep characters, clothing, props, lighting and screen direction continuous from shot to shot.",
                /AI|mix/.test(a.making) ? "For each AI-generated shot, add a one-paragraph description that could be given to a video generator." : "",
                "Timings must add up to the length."
            ],
            format: ["A table, one row per shot.", "Then a continuity list: what must look the same throughout."]
        }),
        stages: [
            { at: "standard", name: "Shot list", objective: "Break the script into shots.", submit: "The master prompt with the script.", ask: () => "Write the shot list table.", expect: "A shot table.", done: "Timings add up." },
            { at: "detailed", name: "Continuity", objective: "Catch breaks before production.", submit: "Nothing new.", ask: () => "Check the shot list for continuity breaks (appearance, props, lighting, direction of movement, time of day) and fix them.", expect: "Breaks and fixes.", done: "No break remains." }
        ],
        refine: ["continuity", "completeness"],
        quality: ["Every line of the script has a shot.", "Timings add up to the length.", "The continuity list covers each character and prop."],
        prepare: { required: ["The final script."], optional: ["Reference frames for the look.", "Character descriptions."] },
        next: ["Generate or film shot by shot; keep the continuity list beside you.", "Use the task \"AI video from a description\" for each generated shot."]
    },

    "text-to-video": {
        deliverable: "an AI video clip",
        style: "descriptive",
        categories: CATS,
        depth: "standard",
        questions: [
            area("scene", "The scene", { essential: true, rows: 3, placeholder: "A baker in a small kitchen pulls a loaf from the oven; steam rises" }),
            text("camera", "Camera", { placeholder: "Slow push in from a medium shot to a close-up" }),
            text("motion", "What moves, and how", { placeholder: "The baker lifts the tray; steam drifts upward; nothing else moves fast" }),
            text("look", "Look and lighting", { placeholder: "Warm morning light, shallow depth of field, documentary style" }),
            text("seconds", "Clip length", { placeholder: "5 seconds" }),
            more(aspect),
            more(text("audio", "Sound, if the product makes it", { placeholder: "Oven door, quiet kitchen ambience, no music" }))
        ],
        brief: (a) => ({
            text: sentence([`${a.scene}.`, a.camera ? `Camera: ${a.camera}.` : "", a.motion ? `Motion: ${a.motion}.` : "", a.look ? `Look: ${a.look}.` : "", a.seconds ? `About ${a.seconds} long.` : "", a.aspect ? `Shape: ${a.aspect}.` : "", a.audio ? `Sound: ${a.audio}.` : "", "One continuous shot, no cuts, no on-screen text."]),
            avoid: ["sudden changes of the subject's appearance", "extra people or objects not described"]
        }),
        stages: [
            { at: "standard", name: "First clips", objective: "See how the product reads it.", submit: "The master prompt; set length and shape in the product's controls.", ask: (a) => `${a.scene}. ${a.motion ? `Motion: ${a.motion}.` : ""}`.trim(), expect: "A few clips.", done: "One is close." },
            { at: "standard", name: "Refine", objective: "Fix motion or look.", submit: "The best clip.", ask: () => "Keep the scene and look the same; change only: [the one thing to fix, for example slower camera, no hand distortion].", expect: "An improved clip.", done: "It matches the brief." }
        ],
        refine: ["visual", "continuity"],
        quality: VIDEO_QUALITY,
        prepare: { required: ["One scene described in a sentence or two (one shot per prompt)."], optional: ["A still image of the look you want.", "The storyboard, if the clip is one of several."] },
        next: ["Generate one shot per prompt and join them in an editor.", "Keep the exact prompt that worked for each shot."]
    },

    "image-to-video": {
        deliverable: "an animated clip from an image",
        style: "descriptive",
        categories: CATS,
        depth: "standard",
        questions: [
            area("image", "What the image already shows", { essential: true, rows: 3, hint: "Describe it so the motion is planned around it; you upload the image yourself.", placeholder: "A woman in a red coat on a bridge at dusk, city lights behind" }),
            area("motion", "The motion to add", { essential: true, rows: 3, placeholder: "Her coat and hair move in a light wind; the city lights flicker; she turns her head slightly to the left" }),
            text("camera", "Camera", { placeholder: "Static, or a very slow push in" }),
            text("seconds", "Clip length", { placeholder: "5 seconds" }),
            area("keep", "Must not change", { rows: 2, placeholder: "Her face, the coat's colour, the bridge" })
        ],
        brief: (a) => ({
            text: sentence(["Animate the attached image.", `Motion: ${a.motion}.`, a.camera ? `Camera: ${a.camera}.` : "Camera: static.", a.seconds ? `About ${a.seconds} long.` : "", "Do not add new objects or people."]),
            keep: [`what the image shows (${a.image})`, a.keep].filter(Boolean)
        }),
        stages: [
            { at: "standard", name: "Animate", objective: "A first clip.", submit: "The image and the master prompt.", ask: (a) => `Animate the attached image. Motion: ${a.motion}. Keep everything in the image as it is.`, expect: "A clip.", done: "The motion is right and the image is unchanged." },
            { at: "standard", name: "Refine", objective: "Calmer, cleaner motion.", submit: "The best clip.", ask: () => "Same motion, but [slower / smaller / only the background moves]. Keep the subject's face and clothes exactly as in the image.", expect: "An improved clip.", done: "No warping or drift." }
        ],
        refine: ["visual"],
        quality: ["The first frame still matches your image.", ...VIDEO_QUALITY],
        prepare: { required: ["A high-resolution image you have the right to animate."], optional: ["A reference clip for the kind of motion."] },
        next: ["Small, slow motions give the most believable results; add more only if needed.", "Do not animate a real person without their consent."]
    }

};
