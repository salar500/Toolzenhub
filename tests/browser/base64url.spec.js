/**
 * Base64URL mode of the Base64 Encoder & Decoder (Tool Pack 27 addendum).
 * The engine is proven in tests/unit/base64url.test.mjs; these tests prove the Alphabet control and its behaviour.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const input = (page) => page.locator("#b64-input");
const output = (page) => page.locator("#b64-output");
const live = (page) => page.locator("#b64-live");
const btn = (page, name) => page.getByRole("button", { name, exact: true });
const dir = (page, which) => page.getByRole("radio", { name: which === "encode" ? "Encode text to Base64" : "Decode Base64 to text" });
const alpha = (page, which) => page.getByRole("radio", { name: which === "url" ? "URL-safe (- and _)" : "Standard (+ and /)" });
const padding = (page) => page.getByLabel("Keep = padding when encoding");

async function open(page, go) {
  await go("tools/base64-encoder-decoder/");
  await expect(page.locator("#b64-panel")).toHaveAttribute("data-ready", "true");
}

test.describe("Base64URL mode", () => {
  test("the Alphabet group exists, defaults to Standard and the padding option is hidden until URL-safe encode", async ({ page, go, watch }) => {
    await open(page, go);
    await expect(page.getByRole("group", { name: "Alphabet" })).toBeVisible();
    await expect(alpha(page, "standard")).toBeChecked();
    await expect(padding(page)).toBeHidden();
    await alpha(page, "url").check();
    await expect(padding(page)).toBeVisible();
    await expect(live(page)).toHaveText("URL-safe alphabet selected.");
    await dir(page, "decode").check();
    await expect(padding(page)).toBeHidden();
    expectClean(watch);
  });

  test("encode: Standard keeps + / and padding; URL-safe uses - _ without padding; Keep = padding restores it", async ({ page, go }) => {
    await open(page, go);
    await input(page).fill("???");
    await btn(page, "Encode").click();
    await expect(output(page)).toHaveText("Pz8/");
    await alpha(page, "url").check();
    await expect(page.locator("#b64-output-wrap")).toBeHidden();
    await btn(page, "Encode").click();
    await expect(output(page)).toHaveText("Pz8_");
    await input(page).fill("fo");
    await btn(page, "Encode").click();
    await expect(output(page)).toHaveText("Zm8");
    await padding(page).check();
    await expect(page.locator("#b64-output-wrap")).toBeHidden();
    await btn(page, "Encode").click();
    await expect(output(page)).toHaveText("Zm8=");
  });

  test("decode: URL-safe reads - _ with or without padding; the wrong alphabet gets a hint and a position", async ({ page, go }) => {
    await open(page, go);
    await dir(page, "decode").check();
    await alpha(page, "url").check();
    await input(page).fill("Pz8_");
    await btn(page, "Decode").click();
    await expect(output(page)).toHaveText("???");
    await input(page).fill("Pz8/");
    await btn(page, "Decode").click();
    await expect(page.locator("#b64-error-message")).toContainText("This looks like standard Base64. Switch the alphabet to Standard.");
    await expect(page.locator("#b64-error-message")).toContainText("position 4");
    await alpha(page, "standard").check();
    await input(page).fill("Pz8_");
    await btn(page, "Decode").click();
    await expect(page.locator("#b64-error-message")).toContainText("Switch the alphabet to URL-safe.");
  });

  test("Reset returns to Standard and clears the padding option; the page explains the difference", async ({ page, go }) => {
    await open(page, go);
    await alpha(page, "url").check();
    await padding(page).check();
    await btn(page, "Reset").click();
    await expect(alpha(page, "standard")).toBeChecked();
    await expect(padding(page)).toBeHidden();
    await expect(page.locator("main")).toContainText("URL-safe (base64url, RFC 4648 section 5)");
    await expect(page.locator("main")).toContainText("Base64 is an encoding, not encryption.");
  });

  test("keyboard: the alphabet radios cycle with the arrow keys; no horizontal overflow at 320 px", async ({ page, go }) => {
    await open(page, go);
    await alpha(page, "standard").focus();
    await page.keyboard.press("ArrowDown");
    await expect(alpha(page, "url")).toBeChecked();
    await page.setViewportSize({ width: 320, height: 800 });
    await alpha(page, "url").check();
    await expectNoHorizontalOverflow(page);
  });
});
