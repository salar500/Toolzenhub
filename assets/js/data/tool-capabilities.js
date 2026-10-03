/* =========================================================
   ToolZen Hub
   Tool Capability Contract

   Describes WHAT A TOOL SUPPORTS, so future calculators,
   converters, timers and utilities can say so in one common
   vocabulary instead of inventing ad hoc metadata.

   METADATA DOES NOT CREATE FUNCTIONALITY.
   A capability is declared true only when the tool's own code
   actually does it. Declaring a capability changes nothing on
   the page: nothing renders a button, a chart or a download
   because a flag says so. Nothing in the site consumes these
   flags yet (see "Consumers" below); they are descriptive data
   that tests keep honest.

   TOOL TYPE
     A stable machine-readable kind of tool. Every tool in the
     catalog is a "calculator" today; the other values exist so
     a future family can be described without changing this
     file. Listing a type here creates no tool, page or route.
     (The catalog's older `type: "simple" | "advanced"` is a
     different, unused hint about complexity.)

   CAPABILITIES
     A flat set of yes/no flags, declared per published tool in
     data/calculators.js:

         capabilities: {
             reset: true,
             compare: true
         }

     Anything not written is false, so an entry never lists the
     unsupported ones. Only `true` or `false` are accepted;
     unknown keys, other values and a declaration on a tool
     that is not published all fail loudly when the catalog
     loads.

     Flags are deliberately simple. A capability that later
     needs configuration (download formats, whether shared
     state is sensitive, where history is stored) can become a
     structured value then; no tool needs that today.

   Consumers
     Tests (tests/unit/tool-capabilities.test.mjs) and future
     capability-driven UI. Search, relationships, the shared
     tool page and the generated HTML do not read capabilities.
========================================================= */


/* =========================================================
   TOOL TYPES
========================================================= */

export const TOOL_TYPES = Object.freeze([
    "calculator",
    "converter",
    "timer",
    "timezone",
    "developer",
    "utility"
]);

export const DEFAULT_TOOL_TYPE =
    "calculator";


/* =========================================================
   CAPABILITIES
   key -> what it means when true
========================================================= */

export const CAPABILITIES = Object.freeze({

    reset:
        "a control puts every input back to its default",

    compare:
        "the tool compares two or more scenarios side by side",

    chart:
        "results are drawn as a chart",

    table:
        "results include a table",

    modal:
        "part of the tool opens in a dialog",

    print:
        "the tool offers a print view",

    download:
        "the tool produces a downloadable file",

    share:
        "the tool offers a way to share a result",

    copy:
        "the tool offers copy-to-clipboard for a result",

    presets:
        "ready-made input sets can be chosen",

    history:
        "earlier calculations are kept and listed",

    savedState:
        "inputs are saved between visits",

    urlState:
        "inputs or results are encoded in the page URL",

    unitSelection:
        "the visitor chooses the unit of an input",

    multipleInputs:
        "the tool takes more than one input",

    validation:
        "invalid input is detected and reported to the visitor",

    explanation:
        "the page explains how to use the tool or how it works",

    examples:
        "the page includes a worked example",

    schedule:
        "the tool produces a period-by-period schedule",

    realtime:
        "results update as inputs change, without a button",

    timer:
        "the tool runs against the clock",

    localProcessing:
        "the visitor's input is processed in the browser and never sent to a server"

});

export const CAPABILITY_KEYS =
    Object.freeze(
        Object.keys(CAPABILITIES)
    );


/* =========================================================
   VALIDATION
========================================================= */

function fail(
    where,
    message
) {

    throw new Error(
        `${where}: ${message}`
    );

}


/*
 * undefined -> "calculator". Anything else must be one of
 * TOOL_TYPES.
 */

export function resolveToolType(
    declared,
    where = "tool"
) {

    if (declared === undefined) {
        return DEFAULT_TOOL_TYPE;
    }

    if (!TOOL_TYPES.includes(declared)) {

        fail(
            where,
            `unknown tool type ${JSON.stringify(declared)} ` +
            `(allowed: ${TOOL_TYPES.join(", ")})`
        );

    }

    return declared;

}


/*
 * The declared flags (or nothing) -> one boolean for EVERY
 * capability key, in CAPABILITY_KEYS order. Missing means false.
 */

export function resolveCapabilities(
    declared,
    where = "tool"
) {

    if (declared !== undefined) {

        if (
            declared === null ||
            typeof declared !== "object" ||
            Array.isArray(declared)
        ) {

            fail(
                where,
                "capabilities must be an object of " +
                "capability: true | false"
            );

        }

        for (const [key, value] of Object.entries(declared)) {

            if (!CAPABILITY_KEYS.includes(key)) {

                fail(
                    where,
                    `unknown capability "${key}" ` +
                    `(allowed: ${CAPABILITY_KEYS.join(", ")})`
                );

            }

            if (typeof value !== "boolean") {

                fail(
                    where,
                    `capability "${key}" must be true or false, ` +
                    `not ${JSON.stringify(value)}`
                );

            }

        }

    }

    return Object.freeze(
        Object.fromEntries(
            CAPABILITY_KEYS.map(
                key => [
                    key,
                    declared?.[key] === true
                ]
            )
        )
    );

}


/*
 * Resolves and checks one catalog entry. A tool that is not
 * published has no code, so it supports nothing and may not
 * declare anything: metadata must never make a Coming Soon
 * tool look functional.
 */

export function describeTool({
    id,
    status,
    toolType,
    capabilities
}) {

    const where =
        `Tool "${id}"`;

    if (
        status !== "published" &&
        capabilities !== undefined
    ) {

        fail(
            where,
            `is "${status}", so it cannot declare capabilities ` +
            "(declare them when the tool exists)"
        );

    }

    return {
        toolType:
            resolveToolType(toolType, where),
        capabilities:
            resolveCapabilities(capabilities, where)
    };

}


/* =========================================================
   READING
========================================================= */

export function getToolCapabilities(
    tool
) {

    return (
        tool?.capabilities ??
        resolveCapabilities(undefined)
    );

}


/*
 * An unknown key is a mistake in the caller, not "false".
 */

export function hasToolCapability(
    tool,
    capability
) {

    if (!CAPABILITY_KEYS.includes(capability)) {

        throw new Error(
            `Unknown capability "${capability}"`
        );

    }

    return getToolCapabilities(tool)[capability];

}
