/**
 * Growth manifest dependency tracing: which repository files can influence the exported manifest.
 *
 * The dirty-source gate (source-state.mjs) must cover every such file, so the set is TRACED from the code, never a
 * hand-kept list. Pure: the caller supplies `readText(repoRelativePath)` (null when the file does not exist).
 *
 * What is traced:
 *  - STATIC imports and re-exports ("import ... from", "import 'x'", "export ... from"), transitively.
 *  - DYNAMIC imports with a string literal: the target file is always a dependency. Its own imports are followed only when
 *    `followDynamicFrom(importer)` says the importer actually EXECUTES them. For the catalogs that is the article catalog (the
 *    loader runs each article content module); the tool catalog's loaders are never called, so a tool implementation is
 *    recorded as a file but its imports do not influence the manifest and are not followed.
 *  - Producer modules may use a computed dynamic import only where `allowComputedDynamic` lists them (registry.mjs loads a
 *    fixed list of catalog modules, which the caller names as explicit roots).
 *
 * Fail closed: a bare package specifier, a root-absolute or computed dynamic specifier elsewhere, a require() call, a relative
 * specifier without a file extension, a target that does not exist or leaves the repository, or a file that cannot be read
 * is an ERROR, because a dependency that cannot be classified cannot be protected.
 */
import path from "node:path";

const posix = path.posix;
const EXTENSIONS = /[.](?:m?js|json)$/;

/**
 * Constructs the tracer cannot see through. A module that uses one can read a file, load code or reach the network without
 * naming it in an import, so outside the producer such a module is refused rather than silently under-protected.
 */
const OPAQUE_CONSTRUCTS = [
  ["import.meta", /\bimport\s*\.\s*meta\b/],
  ["createRequire", /\bcreateRequire\b/],
  ["eval", /\beval\s*\(/],
  ["Function constructor", /\bnew\s+Function\b|(^|[^.\w$])Function\s*\(/],
  ["fetch / network API", /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\b/],
  ["process.binding", /\bprocess\s*\.\s*(?:binding|dlopen)\b/],
];
/** Node built-ins that read the file system, run processes or code, or reach the network. */
const OPAQUE_BUILTINS = new Set(["fs", "fs/promises", "child_process", "vm", "worker_threads", "module", "net", "http", "https", "http2", "dns", "dgram", "tls", "cluster", "inspector", "v8", "repl"]);

/** Removes block and line comments. Strings are left alone, which can only over-report, never miss, a specifier. */
export function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:"'`\\])\/\/[^\n]*/g, "$1");
}

/** The import specifiers found in source text: { static, dynamicLiteral, computedDynamic, requires }. */
export function findSpecifiers(source) {
  const code = stripComments(source);
  const staticSpecs = [];
  const literal = [];
  for (const m of code.matchAll(/\b(?:import|export)\s+(?:[^"'`;()]*?\sfrom\s*)?["']([^"'\n]+)["']/g)) staticSpecs.push(m[1]);
  for (const m of code.matchAll(/\bimport\s*\(\s*(["'])([^"'\n]+)\1\s*[,)]/g)) literal.push(m[2]);
  // computed imports are counted on code with string literals blanked, so the text of a message cannot look like an import
  const blanked = code.replace(/"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`/g, '""');
  const allDynamic = [...blanked.matchAll(/\bimport\s*\(/g)].length;
  // constructs through which a module can read inputs, or load code, that no import statement reveals
  const constructs = [];
  for (const [name, pattern] of OPAQUE_CONSTRUCTS) if (pattern.test(blanked)) constructs.push(name);
  return { static: staticSpecs, dynamicLiteral: literal, computedDynamic: Math.max(0, allDynamic - literal.length), requires: /\brequire\s*\(/.test(blanked), constructs };
}

/**
 * Traces the module graph from `roots` (repo-relative posix paths). Returns { ok, files, errors } where `files` is the sorted
 * list of every repository file that can affect the export (the roots included).
 */
export function traceDependencies({ roots, readText, followDynamicFrom = () => false, allowComputedDynamic = () => false, isProducer = () => false }) {
  const errors = [];
  const files = new Set();
  const queue = [...roots];
  const add = (code, id, message) => errors.push({ code, id, message });

  const resolve = (importer, spec) => {
    if (!(spec.startsWith("./") || spec.startsWith("../"))) return null;
    const target = posix.normalize(posix.join(posix.dirname(importer), spec));
    return target;
  };

  while (queue.length > 0) {
    const file = queue.pop();
    if (files.has(file)) continue;
    if (file.startsWith("../") || file.startsWith("/") || file === ".." || !EXTENSIONS.test(file)) {
      add("DEP_UNCLASSIFIABLE", file, "a dependency must be a repository file with a .js, .mjs or .json extension");
      continue;
    }
    const text = readText(file);
    if (text === null || text === undefined) {
      add("DEP_MISSING", file, "a dependency of the export does not exist or cannot be read");
      continue;
    }
    files.add(file);
    if (file.endsWith(".json")) continue;

    const found = findSpecifiers(text);
    if (found.requires) add("DEP_UNCLASSIFIABLE", file, "uses require(), which cannot be traced");
    if (found.computedDynamic > 0 && !allowComputedDynamic(file)) add("DEP_UNCLASSIFIABLE", file, "has a dynamic import with a computed specifier, which cannot be traced");
    if (!isProducer(file)) {
      for (const name of found.constructs) add("DEP_UNCLASSIFIABLE", file, `uses ${name}, which can read inputs or load code that no import reveals`);
      for (const spec of [...found.static, ...found.dynamicLiteral]) {
        if (spec.startsWith("node:") && OPAQUE_BUILTINS.has(spec.slice(5))) add("DEP_UNCLASSIFIABLE", file, `imports ${spec}, which can read files or run code that no import reveals`);
      }
    }

    for (const spec of found.static) {
      if (spec.startsWith("node:")) continue;
      const target = resolve(file, spec);
      if (target === null) add("DEP_UNCLASSIFIABLE", file, `imports ${JSON.stringify(spec)}, which is neither a relative path nor a Node built-in`);
      else queue.push(target);
    }
    for (const spec of found.dynamicLiteral) {
      if (spec.startsWith("node:")) continue;
      const target = resolve(file, spec);
      if (target === null) {
        add("DEP_UNCLASSIFIABLE", file, `dynamically imports ${JSON.stringify(spec)}, which is neither a relative path nor a Node built-in`);
        continue;
      }
      if (followDynamicFrom(file)) queue.push(target);
      else if (!EXTENSIONS.test(target) || target.startsWith("../")) add("DEP_UNCLASSIFIABLE", file, `dynamically imports ${JSON.stringify(spec)}, which is not a repository file`);
      else if (readText(target) === null || readText(target) === undefined) add("DEP_MISSING", target, "a dynamically imported module does not exist");
      else files.add(target);
    }
  }
  // A package.json in any directory above a traced module can change how it is loaded (its "type", "imports" and "exports"),
  // so each one that exists is a dependency too.
  for (const file of [...files]) {
    const parts = file.split("/");
    for (let i = 0; i < parts.length; i++) {
      const candidate = [...parts.slice(0, i), "package.json"].join("/");
      if (!files.has(candidate) && readText(candidate) !== null && readText(candidate) !== undefined) files.add(candidate);
    }
  }
  return { ok: errors.length === 0, files: [...files].sort(), errors };
}
