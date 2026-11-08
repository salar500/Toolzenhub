/* =========================================================
   ToolZen Hub
   Regular Expressions path: runs a learner's pattern against an exercise's tests off the main thread, so the page can
   stop a catastrophically backtracking pattern by terminating this worker.
========================================================= */

import { runRegex } from "./regex.js";

self.onmessage = (event) => {
    const { exercise, pattern, flags } = event.data;
    self.postMessage(runRegex(exercise, pattern, flags));
};
