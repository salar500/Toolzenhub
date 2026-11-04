/* =========================================================
   ToolZen Hub
   SQL Practice Lab: the worker

   A classic Web Worker that runs the visitor's SQL with sql.js (SQLite compiled to WebAssembly, vendored in
   assets/js/vendor/sql-js). Every request gets a brand-new in-memory database built from the lab's own data, so
   nothing a visitor runs can outlive the check or reach another one. There is no network or file access here, and the
   page stops this worker if a statement runs longer than its limit (sql-runner.js).

   Messages in:  { type: "init", lib, wasm }   then   { type: "run", id, setup[], sql, verify, maxRows }
   Messages out: { type: "ready" } | { type: "initError" } | { type: "result", id, ok, sets, error }
   A result set is { columns[], rows[][], total } with at most maxRows rows; blobs become the text "[blob]".
========================================================= */

let SQL = null;

function plain(value) {
    return value instanceof Uint8Array ? "[blob]" : value;
}

function shape(sets, maxRows) {
    return sets.map((set) => ({
        columns: set.columns,
        rows: set.values.slice(0, maxRows).map((row) => row.map(plain)),
        total: set.values.length
    }));
}

self.onmessage = async (event) => {

    const message = event.data;

    if (message.type === "init") {

        try {
            importScripts(message.lib);
            SQL = await self.initSqlJs({ locateFile: () => message.wasm });
            self.postMessage({ type: "ready" });
        } catch {
            self.postMessage({ type: "initError" });
        }

        return;

    }

    if (message.type !== "run" || !SQL) {
        return;
    }

    const db = new SQL.Database();

    try {

        for (const statement of message.setup) {
            db.exec(statement);
        }

        const main = db.exec(message.sql);
        const verify = message.verify ? db.exec(message.verify) : null;

        self.postMessage({
            type: "result",
            id: message.id,
            ok: true,
            sets: shape(verify ?? main, message.maxRows)
        });

    } catch (error) {

        self.postMessage({ type: "result", id: message.id, ok: false, error: String(error?.message ?? error).slice(0, 300) });

    } finally {

        db.close();

    }

};
