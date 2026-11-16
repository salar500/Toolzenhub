/* =========================================================
   ToolZen Hub
   AI Workbench: blueprint loader

   A task's blueprint family is loaded only when the task is chosen,
   so the page starts with the taxonomy and the compiler alone.
========================================================= */

import { getTask } from "./taxonomy.js";

const FAMILY_LOADERS = {
    content: () => import("./blueprints/content.js"),
    images: () => import("./blueprints/images.js"),
    video: () => import("./blueprints/video.js"),
    audio: () => import("./blueprints/audio.js"),
    software: () => import("./blueprints/software.js"),
    testing: () => import("./blueprints/testing.js"),
    research: () => import("./blueprints/research.js"),
    improve: () => import("./blueprints/improve.js"),
    plan: () => import("./blueprints/plan.js")
};

/** The blueprint of a task, or null for an unknown task. */
export async function loadBlueprint(taskId) {

    const task = getTask(taskId);

    if (!task || !FAMILY_LOADERS[task.family]) {
        return null;
    }

    const module = await FAMILY_LOADERS[task.family]();

    return module.BLUEPRINTS[taskId] ?? null;

}

export const familyLoader = (family) => FAMILY_LOADERS[family] ?? null;
