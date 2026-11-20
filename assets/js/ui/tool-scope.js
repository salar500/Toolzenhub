/* =========================================================
   ToolZen Hub
   Tool scope: what a tool leaves running when the workspace shows another page

   A tool page used to be left by a normal page load, which ends everything the tool started. The ecosystem workspace (ui/workspace-nav.js)
   swaps the page content in place instead, so a tool's timers, animation frames, window and document listeners, workers and audio would
   outlive its markup (a stopwatch would keep ticking, a handler would look for fields that are gone). This module records those, and only
   those started by tool code, and ends them when the workspace leaves the tool.

   A registration is the tool's when the call stack that made it passes through a tool module (TOOL_PATHS). Calls made by the site's own
   code (header, footer, sidebar) are never recorded, so the shell is never touched. Nothing here changes what a tool does while it is shown.
   Elements inside the old markup need no clean-up: they go with it.
========================================================= */

const TOOL_PATHS = ["/assets/js/tools/", "/assets/js/calculators/", "/assets/js/learning/", "/assets/js/pages/tool-page"];

const owned = {
    timeouts: new Set(),
    intervals: new Set(),
    frames: new Set(),
    listeners: [],
    workers: new Set(),
    audio: new Set()
};

let installed = false;
let active = false;

const original = {};

function fromTool() {

    if (!active) return false;

    const stack = new Error().stack ?? "";

    return TOOL_PATHS.some(path => stack.includes(path));

}

function isGlobalTarget(target) {

    return target === window || target === document || target === document.documentElement || target === document.body;

}

/** Starts recording. Safe to call more than once. Must run before the first tool starts, so that tool is covered too. */
export function installToolScope() {

    if (installed || typeof window === "undefined") return;

    installed = true;
    active = true;

    original.setTimeout = window.setTimeout;
    original.setInterval = window.setInterval;
    original.clearTimeout = window.clearTimeout;
    original.clearInterval = window.clearInterval;
    original.requestAnimationFrame = window.requestAnimationFrame;
    original.cancelAnimationFrame = window.cancelAnimationFrame;
    original.addEventListener = EventTarget.prototype.addEventListener;
    original.removeEventListener = EventTarget.prototype.removeEventListener;

    window.setTimeout = function (...args) {
        const id = original.setTimeout.apply(this, args);
        if (fromTool()) owned.timeouts.add(id);
        return id;
    };

    window.setInterval = function (...args) {
        const id = original.setInterval.apply(this, args);
        if (fromTool()) owned.intervals.add(id);
        return id;
    };

    window.requestAnimationFrame = function (callback) {
        const id = original.requestAnimationFrame.call(this, callback);
        if (fromTool()) owned.frames.add(id);
        return id;
    };

    EventTarget.prototype.addEventListener = function (type, listener, options) {

        if (isGlobalTarget(this) && listener && fromTool()) {
            owned.listeners.push([this, type, listener, options]);
        }

        return original.addEventListener.call(this, type, listener, options);

    };

    if (typeof window.Worker === "function") {

        const NativeWorker = window.Worker;

        window.Worker = function (...args) {
            const worker = new NativeWorker(...args);
            if (fromTool()) owned.workers.add(worker);
            return worker;
        };

        window.Worker.prototype = NativeWorker.prototype;

    }

    for (const name of ["AudioContext", "webkitAudioContext"]) {

        if (typeof window[name] !== "function") continue;

        const NativeAudio = window[name];

        window[name] = function (...args) {
            const context = new NativeAudio(...args);
            if (fromTool()) owned.audio.add(context);
            return context;
        };

        window[name].prototype = NativeAudio.prototype;

    }

}

/** Ends everything the tool that is leaving started. Returns how many things were ended (for the record, not for logic). */
export function releaseToolScope() {

    if (!installed) return 0;

    let count = 0;

    for (const id of owned.timeouts) { original.clearTimeout.call(window, id); count++; }
    for (const id of owned.intervals) { original.clearInterval.call(window, id); count++; }
    for (const id of owned.frames) { original.cancelAnimationFrame.call(window, id); count++; }

    for (const [target, type, listener, options] of owned.listeners) {
        original.removeEventListener.call(target, type, listener, options);
        count++;
    }

    for (const worker of owned.workers) {
        try { worker.terminate(); } catch { /* already gone */ }
        count++;
    }

    for (const context of owned.audio) {
        try { context.close(); } catch { /* already closed */ }
        count++;
    }

    owned.timeouts.clear();
    owned.intervals.clear();
    owned.frames.clear();
    owned.listeners.length = 0;
    owned.workers.clear();
    owned.audio.clear();

    return count;

}
