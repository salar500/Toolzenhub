/* =========================================================
   ToolZen Hub
   Image Compressor & Resizer: the worker

   A narrow message contract, no UI state:

     in   { id, op: "inspect" | "process", ...request }
     out  { id, ok: true,  result }
          { id, ok: false, error: { code, message } }

   The work itself is image-pipeline.js, the same code the page
   runs on the main thread when a worker is not available.
========================================================= */

import {
    inspectImage,
    processImage,
    createWorkerEnv,
    serializeError
} from "./image-pipeline.js";

const env = createWorkerEnv();

self.onmessage = async (event) => {

    const { id, op, ...request } = event.data;

    try {

        let result;

        if (op === "inspect") {
            result = await inspectImage(request, env);
        } else if (op === "process") {
            result = await processImage(request, env);
        } else {
            throw new Error(`unknown operation ${op}`);
        }

        self.postMessage({ id, ok: true, result });

    } catch (problem) {

        self.postMessage({ id, ok: false, error: serializeError(problem) });

    }

};
