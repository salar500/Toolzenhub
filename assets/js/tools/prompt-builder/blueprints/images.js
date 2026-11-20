/* =========================================================
   ToolZen Hub
   AI Prompt Builder blueprints: creating and editing images (Stage 5)

   Image prompts are one descriptive paragraph (style
   "descriptive"), because image generators read a description,
   not a list of instructions. For an edit, what must change and
   what must stay unchanged are separate, and a word that appears in
   both is reported as a conflict. No product-specific syntax or
   parameter is written into the prompt; the aspect ratio is stated
   in words, and the visitor sets it in the product's own control.
========================================================= */

import { text, area, choose, more, ASPECTS, overlapping, listText } from "./shared.js";

const CATS = [{ id: "images" }, { id: "assistants", mention: /\bimage/i }, { id: "design" }];

const subject = area("subject", "Subject", { essential: true, rows: 3, hint: "What is in the image, as specifically as you can.", placeholder: "A ceramic coffee mug, matte sage green, on a wooden table" });
const use = choose("use", "Where it will be used", ["Website or blog", "Social media post", "Advert", "Print", "Presentation", "Personal project"]);
const style = text("style", "Style", { hint: "Photo, illustration, 3D render, watercolour, flat vector…", placeholder: "Natural-light product photograph" });
const composition = text("composition", "Composition and framing", { placeholder: "Centred, close-up, slightly from above, plenty of space on the left for text" });
const lighting = text("lighting", "Lighting", { placeholder: "Soft morning light from a window on the right" });
const colours = text("colours", "Colours", { placeholder: "Warm neutrals, sage green accent" });
const aspect = choose("aspect", "Shape (aspect ratio)", ASPECTS);
const textInImage = text("words", "Text in the image, exactly", { hint: "Leave empty for no text. Image generators often misspell text: check it, or add text later in an editor." });
const avoidList = text("avoid", "Leave out", { placeholder: "No people, no logos, no clutter" });

const sentence = (parts) => parts.filter(Boolean).join(" ");

function describe(a, opening) {

    return sentence([
        `${opening} ${a.subject}.`,
        a.environment ? `Setting: ${a.environment}.` : "",
        a.style ? `Style: ${a.style}.` : "",
        a.composition ? `Composition: ${a.composition}.` : "",
        a.lighting ? `Lighting: ${a.lighting}.` : "",
        a.colours ? `Colours: ${a.colours}.` : "",
        a.materials ? `Materials and textures: ${a.materials}.` : "",
        a.aspect ? `Shape: ${a.aspect}.` : "",
        a.words ? `The image contains the text "${a.words}", spelled exactly so.` : "No text or lettering in the image.",
        a.use ? `It is for ${a.use.toLowerCase()} use.` : ""
    ]);

}

const IMAGE_QUALITY = [
    "The subject is exactly what you asked for, with nothing extra.",
    "Hands, faces, text and small details are correct when you zoom in.",
    (a) => a.words ? `The text reads "${a.words}" with no spelling mistakes.` : null,
    "You have the right to use it where you plan to: check the product's terms for commercial use.",
    "It does not copy a real person, brand or artwork you have no rights to."
];

const IMAGE_NEXT = [
    "Generate several variations and keep the best, rather than rewriting the prompt each time.",
    "Change one thing at a time between attempts so you know what made the difference.",
    "Save the prompt that worked with the image, to reuse the look."
];

const iterate = { at: "standard", name: "Refine the best result", objective: "Fix what is still wrong without losing what is right.", submit: "The best image so far.", ask: () => "This is the closest result. Keep everything else exactly the same and change only: [describe the one thing to fix].", expect: "A corrected image.", done: "The image matches the brief." };

export const BLUEPRINTS = {

    "image-generate": {
        deliverable: "an image",
        style: "descriptive",
        categories: CATS,
        depth: "standard",
        questions: [subject, use, style, area("environment", "Setting or background", { rows: 2, placeholder: "A bright, minimal kitchen" }), more(composition), more(lighting), more(colours), more(aspect), more(textInImage), more(avoidList)],
        brief: (a) => ({ text: describe(a, "An image of"), avoid: a.avoid ? [a.avoid] : [] }),
        stages: [
            { at: "standard", name: "First images", objective: "See how the product reads the brief.", submit: "The main prompt; set the shape in the product's own controls.", ask: (a) => describe(a, "An image of"), expect: "Several first images.", done: "At least one is close to what you want." },
            iterate
        ],
        refine: ["visual", "consistency"],
        quality: IMAGE_QUALITY,
        prepare: { required: ["A clear picture in your mind of the subject and where it will be used."], optional: ["Reference images that show the style or composition you want (images you have the right to use).", "Your brand colours."] },
        next: IMAGE_NEXT
    },

    "image-edit": {
        deliverable: "an edited image",
        style: "descriptive",
        categories: CATS,
        depth: "standard",
        questions: [
            area("source", "The image you start from", { essential: true, rows: 2, hint: "Describe it briefly; you will upload it to the AI product yourself.", placeholder: "A photo of our shop front on a cloudy day" }),
            area("change", "What must change", { essential: true, rows: 3, placeholder: "Make the sky clear blue; remove the parked van" }),
            area("keep", "What must stay exactly the same", { essential: true, rows: 3, placeholder: "The shop sign, the people, the shop windows, the angle" }),
            style,
            aspect
        ],
        brief: (a) => ({
            text: sentence([`Edit the attached image (${a.source}).`, `Change only this: ${a.change}.`, a.style ? `Match this style: ${a.style}.` : "Match the original photo's style, lighting and colour.", a.aspect ? `Shape: ${a.aspect}.` : "Keep the original shape."]),
            keep: [a.keep, "everything not mentioned above"].filter(Boolean)
        }),
        conflicts: (a) => {
            const both = overlapping(a.change, a.keep);
            return both.length ? [`"${listText(both)}" appears both in what must change and what must stay the same. Decide which, or the AI will guess.`] : [];
        },
        stages: [
            { at: "standard", name: "The edit", objective: "One change at a time.", submit: "The original image and the main prompt.", ask: (a) => `Edit the attached image. Change only this: ${a.change}. Keep exactly the same: ${a.keep}.`, expect: "The edited image.", done: "The change is made and nothing else moved." },
            { ...iterate, name: "Check what stayed", ask: (a) => `Compare the edited image with the original. List anything that changed other than: ${a.change}. Then redo the edit keeping those parts as in the original.` }
        ],
        refine: ["visual"],
        quality: ["Everything on the \"stay the same\" list is unchanged, checked side by side with the original.", "Edges around the edited area look natural.", ...IMAGE_QUALITY.slice(3)],
        prepare: { required: ["The original image in good quality.", "A short list of what must change and what must not."], optional: ["A reference image for the change (for example the sky you want)."] },
        next: ["Keep the original file; never overwrite it.", "Make one change per round: several changes at once make it harder to keep the rest the same.", "If the photo is of people, make sure they agreed to its use and the edit does not mislead."]
    },

    "product-photo": {
        deliverable: "a product photo",
        style: "descriptive",
        categories: CATS,
        depth: "standard",
        questions: [
            area("subject", "The product", { essential: true, rows: 2, placeholder: "A 330 ml amber glass bottle of cold-pressed juice with a white label" }),
            choose("background", "Background", ["Plain white (catalogue)", "Plain colour", "Lifestyle scene", "Flat lay"]),
            area("environment", "Scene, if lifestyle", { rows: 2, showIf: (a) => /Lifestyle|Flat/.test(a.background), placeholder: "A sunny kitchen counter with fresh oranges" }),
            choose("real", "Your real product?", ["Yes: I will upload a photo of it", "No: an illustration of the idea is fine"], { hint: "With a photo, the AI is told to keep the product exactly as it is." }),
            more(text("materials", "Materials and textures to show", { placeholder: "Glass with condensation, matte paper label" })),
            more(lighting),
            more(aspect)
        ],
        brief: (a) => ({
            text: sentence([
                /upload/.test(a.real) ? "Using the attached photo of my product, create" : "Create",
                `a product photograph of ${a.subject}.`,
                /white/.test(a.background) ? "Pure white background, soft shadow under the product." : /colour/.test(a.background) ? "A plain, single-colour background." : "",
                a.environment ? `Scene: ${a.environment}.` : "",
                a.materials ? `Show clearly: ${a.materials}.` : "",
                a.lighting ? `Lighting: ${a.lighting}.` : "Even studio lighting, no harsh reflections.",
                a.aspect ? `Shape: ${a.aspect}.` : "",
                "The product is sharp and fills most of the frame; label text exactly as on the real product."
            ]),
            keep: /upload/.test(a.real) ? ["the product's shape, colour, label and proportions exactly as in the photo"] : [],
            avoid: ["props that hide the product", "text that is not on the product"]
        }),
        stages: [
            { at: "standard", name: "Photos", objective: "Usable product images.", submit: "The main prompt and your product photo.", ask: () => "Create the product photo as described.", expect: "Product images.", done: "The product looks like the real one." },
            iterate
        ],
        refine: ["visual"],
        quality: ["The product looks exactly like the one you sell: shape, colour, label.", "Nothing suggests features the product does not have.", ...IMAGE_QUALITY.slice(1)],
        prepare: { required: ["A clear, well-lit photo of the real product if you sell it.", "Your marketplace's image rules (background, size)."], optional: ["Photos of competitors' listings for the style only, never to copy."] },
        next: ["Check the marketplace's rules: many require a real photo on a white background for the main image.", "Use generated scenes for secondary images if allowed."]
    },

    thumbnail: {
        deliverable: "a thumbnail or banner",
        style: "descriptive",
        categories: CATS,
        depth: "standard",
        questions: [
            area("subject", "What it shows", { essential: true, rows: 2, placeholder: "A surprised person holding a giant phone showing a chart going up" }),
            choose("placement", "For", [
                { value: "YouTube thumbnail", label: "YouTube thumbnail" },
                { value: "blog header", label: "Blog header" },
                { value: "social media banner", label: "Social banner" },
                { value: "event or sale banner", label: "Event or sale banner" }
            ], { essential: true }),
            textInImage,
            colours,
            style,
            avoidList
        ],
        brief: (a) => ({
            text: sentence([`An image showing ${a.subject}, used as a ${a.placement.replace(/^event/, "promotional event")}.`, "Bold, simple composition that reads at a small size, one clear focal point, high contrast.", a.colours ? `Colours: ${a.colours}.` : "", a.style ? `Style: ${a.style}.` : "", /YouTube/.test(a.placement) ? "Shape: wide (16:9)." : "", a.words ? `Large text "${a.words}", spelled exactly, with space kept clear around it.` : "Leave clear space for a title to be added later; no text in the image."]),
            avoid: [a.avoid, "small details that disappear at thumbnail size"].filter(Boolean)
        }),
        stages: [
            { at: "standard", name: "Options", objective: "Pick a direction.", submit: "The main prompt.", ask: () => "Create four different versions of this thumbnail idea.", expect: "Four options.", done: "One reads clearly at small size." },
            iterate
        ],
        refine: ["visual"],
        quality: ["It is readable at the size people will actually see it (try it on a phone).", "Any text is spelled right, or is added later in an editor.", ...IMAGE_QUALITY.slice(3)],
        prepare: { required: ["The title or message it goes with."], optional: ["Your channel's or brand's colours and fonts."] },
        next: ["Add the title text in an image editor if the generator gets it wrong.", "Look at it beside other thumbnails at small size before publishing."]
    },

    "image-series": {
        deliverable: "a consistent series of images",
        style: "descriptive",
        categories: CATS,
        depth: "multi",
        questions: [
            area("subject", "The character or subject", { essential: true, rows: 4, hint: "Everything that must look the same in every image: age, build, face, hair, clothes, colours, distinctive marks.", placeholder: "Mina, a 10-year-old girl, short curly black hair, round glasses, yellow raincoat, red boots" }),
            style,
            area("scenes", "The scenes, one per line", { essential: true, rows: 5, placeholder: "Mina waiting at a bus stop in the rain\nMina finding a lost kitten\nMina at home drying the kitten" }),
            colours,
            aspect
        ],
        brief: (a) => ({
            text: sentence([`Character reference: ${a.subject}.`, a.style ? `Style for every image: ${a.style}.` : "", a.colours ? `Palette: ${a.colours}.` : "", a.aspect ? `Shape: ${a.aspect}.` : "", "Create a reference sheet first: the character from the front, side and back on a plain background."]),
            keep: ["the character's face, hair, clothes, proportions and colours in every image", "the same style and palette across the series"]
        }),
        stages: [
            { at: "standard", name: "Reference sheet", objective: "Fix the look once.", submit: "The main prompt.", ask: () => "Create the character reference sheet: front, side and back views on a plain background.", expect: "A reference sheet.", done: "You are happy with the look; save this image." },
            { at: "standard", name: "Scenes", objective: "Each scene with the same character.", submit: "The reference sheet image, attached each time.", ask: (a) => `Using the attached reference sheet, keep the character exactly the same and create this scene: ${a.scenes.split("\n")[0] || "[the first scene]"}. Then do the same for each next scene: ${a.scenes.split("\n").slice(1).join("; ") || "[the other scenes]"}.`, expect: "One image per scene.", done: "Each scene shows the same character." },
            { at: "multi", name: "Consistency check", objective: "Catch drift.", submit: "All the scene images side by side.", ask: () => "Compare these images with the reference sheet and list every difference in the character (face, hair, clothes, colours, proportions). Then redo the images that drifted.", expect: "A list of differences and corrected images.", done: "The series looks like one character throughout." }
        ],
        refine: ["consistency", "visual"],
        quality: ["Side by side, the character is recognisably the same in every image.", "The style and palette do not drift.", ...IMAGE_QUALITY.slice(3)],
        prepare: { required: ["A full written description of the character.", "The list of scenes."], optional: ["Sketches or reference images you have the right to use."] },
        next: ["Keep the reference sheet and the exact description together for every future image.", "Products differ in how well they keep a character consistent; check the product's own guide for reference-image features."]
    }

};
