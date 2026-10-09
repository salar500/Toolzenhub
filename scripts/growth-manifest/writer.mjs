/**
 * Growth manifest writer: the ONLY code that writes a manifest, and only ever to one fixed place.
 *
 *   <repository root>/growth-export/toolzenhub-manifest.json
 *
 * There is no way to name another destination. The write is atomic in effect: the bytes go to a uniquely named temporary file
 * in the same directory (created exclusively, owner-only), are flushed, read back and compared, and only then renamed over the
 * destination, so the destination is either the previous complete file or the new complete file and never partial JSON. On any
 * failure the temporary file is removed and the previous output is left exactly as it was.
 *
 * Refused, with nothing written: a destination directory or file that is a symbolic link, a directory where the file belongs,
 * anything that resolves outside the repository, an unreadable or unwritable location.
 *
 * `fsApi` exists so tests can inject failures; production uses node:fs.
 */
import crypto from "node:crypto";
import nodeFs from "node:fs";
import path from "node:path";

import { computeFileHash } from "./canonical.mjs";

export const OUTPUT_DIR = "growth-export";
export const OUTPUT_FILE = "toolzenhub-manifest.json";
export const OUTPUT_RELATIVE_PATH = `${OUTPUT_DIR}/${OUTPUT_FILE}`;

const failure = (code, message) => ({ ok: false, path: OUTPUT_RELATIVE_PATH, fileHash: null, errors: [{ code, id: OUTPUT_RELATIVE_PATH, message }] });

/** Where the manifest would be written, without touching the file system. */
export function plannedOutput(root) {
  return { relativePath: OUTPUT_RELATIVE_PATH, absolutePath: path.join(path.resolve(root), OUTPUT_DIR, OUTPUT_FILE) };
}

/**
 * Inspects the destination without creating anything. Returns { ok, directoryExists, errors }; used by check mode so the
 * same refusals apply to a check and to a write.
 */
export function inspectDestination(root, fsApi = nodeFs) {
  let realRoot;
  try {
    realRoot = fsApi.realpathSync(root);
  } catch {
    return { ok: false, directoryExists: false, errors: [{ code: "OUTPUT_UNSAFE", id: OUTPUT_DIR, message: "the repository root cannot be resolved" }] };
  }
  const dir = path.join(realRoot, OUTPUT_DIR);
  let stat;
  try {
    stat = fsApi.lstatSync(dir);
  } catch (cause) {
    if (cause?.code === "ENOENT") return { ok: true, directoryExists: false, errors: [] };
    return { ok: false, directoryExists: false, errors: [{ code: "OUTPUT_UNSAFE", id: OUTPUT_DIR, message: `the output directory cannot be inspected (${cause?.code ?? "error"})` }] };
  }
  if (stat.isSymbolicLink()) return { ok: false, directoryExists: true, errors: [{ code: "OUTPUT_UNSAFE", id: OUTPUT_DIR, message: "the output directory is a symbolic link; refusing to write through it" }] };
  if (!stat.isDirectory()) return { ok: false, directoryExists: true, errors: [{ code: "OUTPUT_UNSAFE", id: OUTPUT_DIR, message: "the output path exists and is not a directory" }] };
  let realDir;
  try {
    realDir = fsApi.realpathSync(dir);
  } catch {
    return { ok: false, directoryExists: true, errors: [{ code: "OUTPUT_UNSAFE", id: OUTPUT_DIR, message: "the output directory cannot be resolved" }] };
  }
  if (realDir.toLowerCase() !== path.join(realRoot, OUTPUT_DIR).toLowerCase()) return { ok: false, directoryExists: true, errors: [{ code: "OUTPUT_UNSAFE", id: OUTPUT_DIR, message: "the output directory resolves outside the repository" }] };
  const file = path.join(dir, OUTPUT_FILE);
  try {
    const fileStat = fsApi.lstatSync(file);
    if (fileStat.isSymbolicLink()) return { ok: false, directoryExists: true, errors: [{ code: "OUTPUT_UNSAFE", id: OUTPUT_RELATIVE_PATH, message: "the output file is a symbolic link; refusing to replace it" }] };
    if (!fileStat.isFile()) return { ok: false, directoryExists: true, errors: [{ code: "OUTPUT_UNSAFE", id: OUTPUT_RELATIVE_PATH, message: "the output path exists and is not a regular file" }] };
  } catch (cause) {
    if (cause?.code !== "ENOENT") return { ok: false, directoryExists: true, errors: [{ code: "OUTPUT_UNSAFE", id: OUTPUT_RELATIVE_PATH, message: `the output file cannot be inspected (${cause?.code ?? "error"})` }] };
  }
  return { ok: true, directoryExists: true, errors: [] };
}

/** Writes `bytes` to the fixed destination atomically. Returns { ok, path, fileHash, errors }. */
export function writeManifestAtomically({ root, bytes, fsApi = nodeFs }) {
  if (!(bytes instanceof Uint8Array) || bytes.length === 0) return failure("OUTPUT_INVALID", "there are no bytes to write");
  const expectedHash = computeFileHash(bytes);
  const inspected = inspectDestination(root, fsApi);
  if (!inspected.ok) return { ok: false, path: OUTPUT_RELATIVE_PATH, fileHash: null, errors: inspected.errors };

  const realRoot = fsApi.realpathSync(root);
  const dir = path.join(realRoot, OUTPUT_DIR);
  const destination = path.join(dir, OUTPUT_FILE);
  let temporary = null;
  let fd = null;
  try {
    if (!inspected.directoryExists) {
      fsApi.mkdirSync(dir); // non-recursive: the repository root exists, only this one directory is created
      const created = fsApi.lstatSync(dir);
      if (created.isSymbolicLink() || !created.isDirectory()) return failure("OUTPUT_UNSAFE", "the output directory is not a plain directory after creation");
    }
    temporary = path.join(dir, `.${OUTPUT_FILE}.${crypto.randomBytes(8).toString("hex")}.tmp`);
    fd = fsApi.openSync(temporary, "wx", 0o600);
    let offset = 0;
    while (offset < bytes.length) offset += fsApi.writeSync(fd, bytes, offset, bytes.length - offset);
    fsApi.fsyncSync(fd);
    fsApi.closeSync(fd);
    fd = null;
    const written = fsApi.readFileSync(temporary);
    if (computeFileHash(written) !== expectedHash || written.length !== bytes.length) throw Object.assign(new Error("the temporary file does not hold the intended bytes"), { code: "VERIFY" });
    fsApi.renameSync(temporary, destination);
    temporary = null;
    const final = fsApi.readFileSync(destination);
    if (computeFileHash(final) !== expectedHash) return failure("OUTPUT_VERIFY", "the written file does not match the intended bytes");
    return { ok: true, path: OUTPUT_RELATIVE_PATH, fileHash: expectedHash, errors: [] };
  } catch (cause) {
    return failure("OUTPUT_WRITE", `the manifest could not be written (${cause?.code ?? cause?.message ?? "error"}); any previous output is unchanged`);
  } finally {
    if (fd !== null) {
      try {
        fsApi.closeSync(fd);
      } catch {
        /* nothing more can be done */
      }
    }
    if (temporary !== null) {
      try {
        fsApi.rmSync(temporary, { force: true });
      } catch {
        /* the temporary name is unique and ignored by .gitignore */
      }
    }
  }
}
