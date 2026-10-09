/**
 * Growth manifest character policy (schemaVersion 1), an independent implementation of the consumer contract
 * (Growth OS docs/09-INTEGRATION.md section 12a "Character policy (exact)").
 *
 * Applies to every string value and every key in a manifest. The producer rejects, it never repairs or normalizes, so
 * producer and consumer cannot drift. Text must already be NFC. The check is by code point, with no regular expressions,
 * and the source is ASCII-only, so no invisible character can hide in a literal.
 *
 * REJECTED: C0 controls except TAB (U+0009) and LF (U+000A); DEL and C1 controls (U+007F-U+009F); U+00AD; U+061C;
 * U+180E; U+200B; U+200E and U+200F; U+2028 and U+2029; U+202A-U+202E; U+2060-U+206F; U+FEFF; U+FFF9-U+FFFD;
 * noncharacters U+FDD0-U+FDEF and every code point ending in FFFE or FFFF; private use U+E000-U+F8FF and planes 15-16;
 * lone surrogates; tag characters (U+E0000-U+E007F) except as the emoji subdivision-flag sequence U+1F3F4 + one or
 * more of U+E0020-U+E007E + U+E007F.
 * ACCEPTED on purpose: ZWNJ U+200C, ZWJ U+200D, combining marks (Telugu vowel signs and virama), CGJ U+034F, variation
 * selectors (U+FE00-U+FE0F, U+E0100-U+E01EF, U+180B-U+180D), no-break spaces and every other assigned printable
 * character.
 *
 * Field rules that are not character rules (a title forbids TAB and LF; a description allows them) belong to the
 * mappers and are not decided here.
 */

export function isForbiddenCodePoint(cp) {
  return (
    cp <= 0x08 ||
    (cp >= 0x0b && cp <= 0x1f) ||
    (cp >= 0x7f && cp <= 0x9f) ||
    cp === 0x00ad ||
    cp === 0x061c ||
    cp === 0x180e ||
    cp === 0x200b ||
    cp === 0x200e ||
    cp === 0x200f ||
    cp === 0x2028 ||
    cp === 0x2029 ||
    (cp >= 0x202a && cp <= 0x202e) ||
    (cp >= 0x2060 && cp <= 0x206f) ||
    cp === 0xfeff ||
    (cp >= 0xfff9 && cp <= 0xfffd) ||
    (cp >= 0xfdd0 && cp <= 0xfdef) ||
    (cp & 0xfffe) === 0xfffe ||
    (cp >= 0xe000 && cp <= 0xf8ff) ||
    (cp >= 0xf0000 && cp <= 0x10ffff)
  );
}

const BLACK_FLAG = 0x1f3f4;
const TAG_FIRST = 0xe0020;
const TAG_LAST = 0xe007e;
const TAG_CANCEL = 0xe007f;

/** True when the text contains anything the policy forbids. */
export function hasForbiddenCharacter(text) {
  // 0 = ordinary, 1 = just after U+1F3F4, 2 = inside a tag run that still needs its terminator
  let state = 0;
  for (let i = 0; i < text.length; ) {
    const cp = text.codePointAt(i);
    i += cp > 0xffff ? 2 : 1;
    if (cp >= 0xd800 && cp <= 0xdfff) return true; // lone surrogate (valid pairs are combined by codePointAt)
    if (isForbiddenCodePoint(cp)) return true;

    if (cp >= TAG_FIRST && cp <= TAG_LAST) {
      if (state === 0) return true;
      state = 2;
    } else if (cp === TAG_CANCEL) {
      if (state !== 2) return true;
      state = 0;
    } else if (cp >= 0xe0000 && cp <= 0xe007f) {
      return true; // other tag-block code points are never valid
    } else {
      if (state === 2) return true; // a tag run must end with the cancel tag
      state = cp === BLACK_FLAG ? 1 : 0;
    }
  }
  return state === 2;
}

/** True when the text is NFC-normalized (the check is locale independent). */
export function isNfc(text) {
  return text === text.normalize("NFC");
}

/** The reason a single string is unacceptable, or null when it passes the character policy and the NFC rule. */
export function textProblem(text) {
  if (hasForbiddenCharacter(text)) return "contains a character the manifest character policy forbids";
  if (!isNfc(text)) return "is not NFC-normalized";
  return null;
}

/**
 * Every problem in a JSON-like value: each string value and each object key is checked. Returns [{ path, message }] in
 * traversal order (array order, then the keys sorted by code unit), empty when clean. Pure; never throws on odd input.
 */
export function findTextIssues(value, path = "") {
  const issues = [];
  const visit = (node, here, depth) => {
    if (depth > 64) {
      issues.push({ path: here, message: "is nested too deeply to check" });
      return;
    }
    if (typeof node === "string") {
      const problem = textProblem(node);
      if (problem !== null) issues.push({ path: here, message: problem });
    } else if (Array.isArray(node)) {
      node.forEach((child, i) => visit(child, `${here}[${i}]`, depth + 1));
    } else if (node !== null && typeof node === "object") {
      for (const key of Object.keys(node).sort()) {
        const childPath = here ? `${here}.${key}` : key;
        const keyProblem = textProblem(key);
        if (keyProblem !== null) issues.push({ path: childPath, message: `key ${keyProblem}` });
        visit(node[key], childPath, depth + 1);
      }
    }
  };
  visit(value, path, 0);
  return issues;
}
