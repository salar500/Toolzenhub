/* =========================================================
   ToolZen Hub
   SQL Practice Lab: the runner (page side of the worker)

   run(request) -> Promise of { ok, sets } or { ok: false, error }, or { ok: false, timedOut: true }.
   The worker starts the first time a query is run. If a statement does not finish within the limit, the worker is
   terminated (a runaway query cannot be interrupted any other way) and the next run starts a fresh one.
   Imports nothing from the DOM, so the module can be loaded by the site build; it touches Worker only when called.
========================================================= */

export const RUN_LIMIT_MS = 3000;
export const START_LIMIT_MS = 20000;
export const MAX_ROWS = 200;

// ATTACH and VACUUM INTO write files into the worker's in-memory file system, which outlives a database. After a statement that
// names either, the worker is discarded so nothing written there reaches the next run.
const WRITES_FILES = /\b(attach|vacuum)\b/i;

export function createRunner({ workerUrl, libUrl, wasmUrl }) {

    let worker = null;
    let starting = null;
    let counter = 0;

    function stop() {
        worker?.terminate();
        worker = null;
        starting = null;
    }

    function start() {

        if (starting) return starting;

        worker = new Worker(workerUrl);
        const mine = worker;

        starting = new Promise((resolve) => {

            const timer = setTimeout(() => {
                if (worker === mine) stop();
                resolve(false);
            }, START_LIMIT_MS);

            mine.addEventListener("message", function onReady(event) {
                if (event.data?.type === "ready" || event.data?.type === "initError") {
                    clearTimeout(timer);
                    mine.removeEventListener("message", onReady);
                    if (event.data.type === "initError" && worker === mine) stop();
                    resolve(event.data.type === "ready");
                }
            });

            mine.addEventListener("error", () => {
                clearTimeout(timer);
                if (worker === mine) stop();
                resolve(false);
            });

            mine.postMessage({ type: "init", lib: libUrl, wasm: wasmUrl });

        });

        return starting;

    }

    async function run({ setup, sql, verify = null }) {

        if (typeof Worker === "undefined") {
            return { ok: false, unavailable: true };
        }

        const ready = await start();

        if (!ready || !worker) {
            return { ok: false, unavailable: true };
        }

        const mine = worker;
        const id = ++counter;

        return new Promise((resolve) => {

            const timer = setTimeout(() => {
                if (worker === mine) stop();
                resolve({ ok: false, timedOut: true });
            }, RUN_LIMIT_MS);

            mine.addEventListener("message", function onResult(event) {

                if (event.data?.type !== "result" || event.data.id !== id) return;

                clearTimeout(timer);
                mine.removeEventListener("message", onResult);
                if (WRITES_FILES.test(sql) && worker === mine) stop();
                resolve(event.data);

            });

            mine.postMessage({ type: "run", id, setup, sql, verify, maxRows: MAX_ROWS });

        });

    }

    return { run, stop };

}
