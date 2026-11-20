/* =========================================================
   ToolZen Hub
   Python exercises: the module Web Worker that starts Pyodide (vendored, same-origin) on request and runs the shared
   harness. Once Python is loaded, network APIs are removed from the worker, so learner code cannot reach the network.
========================================================= */

import { HARNESS } from "./py-harness.js";

let pyodide = null;

function lockDown() {
    for (const name of ["fetch", "XMLHttpRequest", "WebSocket", "EventSource", "importScripts", "indexedDB", "caches", "BroadcastChannel"]) {
        try { Object.defineProperty(self, name, { value: undefined, configurable: false, writable: false }); } catch { /* not present */ }
    }
}

self.onmessage = async (event) => {
    const { type } = event.data;
    if (type === "load") {
        try {
            const { loadPyodide } = await import("../../vendor/pyodide/pyodide.mjs");
            pyodide = await loadPyodide({ indexURL: new URL("../../vendor/pyodide/", import.meta.url).href });
            pyodide.runPython(HARNESS);
            lockDown();
            self.postMessage({ type: "ready", version: pyodide.version });
        } catch (error) {
            self.postMessage({ type: "failed", message: String(error?.message ?? error) });
        }
        return;
    }
    if (type === "run" && pyodide) {
        const { code, fn, tests } = event.data;
        try {
            const run = pyodide.globals.get("__tz_run");
            const text = run(code, fn, JSON.stringify(tests));
            run.destroy();
            self.postMessage({ type: "result", result: JSON.parse(text) });
        } catch (error) {
            self.postMessage({ type: "result", result: { error: String(error?.message ?? error), results: [], passed: 0, total: tests.length, logs: "" } });
        }
    }
};
