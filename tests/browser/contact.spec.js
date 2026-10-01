/**
 * M0.10 — Contact form, according to the CURRENT implementation.
 *
 * The form is intentionally NOT connected to any backend: the submit button is disabled, a notice
 * says so, and a forced submit shows "Your message was not sent". The test verifies that it never
 * pretends to succeed, never sends anything over the network, never clears what the user typed, and
 * never logs user data. Nothing external is contacted (the suite blocks external network anyway).
 */
import { test, expect, expectClean } from "../helpers/test-base.mjs";

const NAME = "Zed UniqueName";
const EMAIL = "zed.unique@example.org";
const MESSAGE = "A very unique message body 12345";

test.describe("contact form", () => {
  test("honest UI: notice, disabled submit, required fields", async ({ page, go, watch }) => {
    await go("contact.html");
    await expect(page.locator("h1")).toHaveText("Contact Us");
    await expect(page.locator(".contact-form__notice")).toContainText("isn't accepting messages yet");
    const button = page.locator(".contact-form button[type=submit]");
    await expect(button).toBeDisabled();
    await expect(button).toHaveText("Sending unavailable");
    await expect(button).toHaveAttribute("aria-disabled", "true");

    // field semantics
    await expect(page.locator("#name")).toHaveAttribute("required", "");
    await expect(page.locator("#email")).toHaveAttribute("type", "email");
    await expect(page.locator("#email")).toHaveAttribute("required", "");
    await expect(page.locator("#message")).toHaveAttribute("required", "");

    // status area exists, is a polite live region, and is empty (hidden) until needed
    const status = page.locator("#contact-status");
    await expect(status).toHaveAttribute("role", "status");
    await expect(status).toHaveAttribute("aria-live", "polite");
    await expect(status).toBeHidden();
    expectClean(watch);
  });

  test("pressing Enter in a field does not submit anything", async ({ page, go }) => {
    await go("contact.html");
    const requests = [];
    page.on("request", (r) => requests.push(r.url()));
    await page.locator("#name").fill(NAME);
    await page.locator("#email").fill(EMAIL);
    await page.locator("#message").fill(MESSAGE);
    const url = page.url();
    requests.length = 0;
    await page.locator("#name").press("Enter");
    await page.locator("#email").press("Enter");
    expect(page.url(), "URL must not change (no GET submission with ?name=…)").toBe(url);
    expect(requests, "no network activity").toEqual([]);
    await expect(page.locator("#contact-status")).toBeHidden();
    await expect(page.locator("#message")).toHaveValue(MESSAGE);
  });

  test("a forced submit says the message was NOT sent, keeps the text, and sends nothing", async ({ page, go, watch }) => {
    const logged = [];
    page.on("console", (m) => logged.push(m.text()));
    await go("contact.html");
    const requests = [];
    page.on("request", (r) => requests.push(`${r.method()} ${r.url()}`));
    await page.locator("#name").fill(NAME);
    await page.locator("#email").fill(EMAIL);
    await page.locator("#message").fill(MESSAGE);
    const url = page.url();
    requests.length = 0;

    await page.locator(".contact-form").evaluate((f) => f.requestSubmit());

    const status = page.locator("#contact-status");
    await expect(status).toBeVisible();
    await expect(status).toHaveText("Your message was not sent. The contact form isn't connected yet.");
    await expect(status).not.toContainText(/thank|success|sent!/i);
    // nothing cleared, nothing navigated, nothing transmitted, nothing logged
    await expect(page.locator("#name")).toHaveValue(NAME);
    await expect(page.locator("#email")).toHaveValue(EMAIL);
    await expect(page.locator("#message")).toHaveValue(MESSAGE);
    expect(page.url()).toBe(url);
    expect(requests, "no network activity on submit").toEqual([]);
    const leaked = logged.filter((t) => t.includes(NAME) || t.includes(EMAIL) || t.includes(MESSAGE));
    expect(leaked, "user-entered data must never reach the console").toEqual([]);
    expectClean(watch);
  });

  test("browser validation blocks an empty or malformed form (the handler never runs)", async ({ page, go }) => {
    await go("contact.html");
    // empty
    await page.locator(".contact-form").evaluate((f) => f.requestSubmit());
    await expect(page.locator("#name:invalid")).toHaveCount(1);
    await expect(page.locator("#contact-status")).toBeHidden();
    // malformed e-mail
    await page.locator("#name").fill(NAME);
    await page.locator("#email").fill("not-an-email");
    await page.locator("#message").fill(MESSAGE);
    await page.locator(".contact-form").evaluate((f) => f.requestSubmit());
    await expect(page.locator("#email:invalid")).toHaveCount(1);
    await expect(page.locator("#contact-status")).toBeHidden();
  });

  test("breadcrumb home link works", async ({ page, go, siteRoot }) => {
    await go("contact.html");
    await page.locator("#legal-breadcrumb-home").click();
    await expect(page).toHaveURL((u) => u.pathname === siteRoot);
  });
});
