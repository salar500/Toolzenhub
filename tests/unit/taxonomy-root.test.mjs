/**
 * M6: the same hierarchy checks in root-domain mode (a host other than salar500.github.io, site root "/").
 * Runs in its own process, so routes.js sees this hostname.
 */
process.env.TZ_HOST = "tools.example.org";
await import("./taxonomy.test.mjs");
