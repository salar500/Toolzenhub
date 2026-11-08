/* =========================================================
   ToolZen Hub
   JavaScript exercises: the Web Worker that runs learner code. Network and storage access are removed before any code
   runs; the page stops the worker after a time limit. Nothing leaves the browser.
========================================================= */

import { runTests } from "./js-eval.js";

for (const name of ["fetch", "XMLHttpRequest", "WebSocket", "EventSource", "importScripts", "indexedDB", "caches", "BroadcastChannel", "Worker", "SharedWorker"]) {
    try { Object.defineProperty(self, name, { value: undefined, configurable: false, writable: false }); } catch { /* not present */ }
}

self.onmessage = (event) => {
    const { code, exercise } = event.data;
    self.postMessage(runTests(code, exercise));
};
