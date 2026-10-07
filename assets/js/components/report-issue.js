/* =========================================================
   ToolZen Hub
   Report-an-issue line (reusable trust pattern)

   For tools whose answers depend on rules that change (tax, rates).
   It points at the only reporting channel that genuinely works
   today: the public GitHub Issues page of this project. There is no
   contact backend and no published email, so nothing here pretends
   to "send" anything.

   Reports there are public and need a free GitHub account; the
   markup says so, so nobody is surprised. If a real contact channel
   is ever connected, change REPORT_ISSUE_URL (and the wording) here
   and every tool using it follows.
========================================================= */

export const REPORT_ISSUE_URL = "https://github.com/salar500/Toolzenhub/issues/new";

function escapeAttribute(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;");

}

/**
 * @param {object} options
 * @param {string} options.toolName   shown in the pre-filled issue title
 * @param {string} options.prompt     the visible question
 * @param {string} options.linkText   the link text
 */
export function reportIssueMarkup({ toolName, prompt, linkText }) {

    const url = `${REPORT_ISSUE_URL}?title=${encodeURIComponent(`${toolName}: `)}`;

    return `
                <p class="report-issue">
                    ${escapeAttribute(prompt)}
                    <a href="${escapeAttribute(url)}" target="_blank" rel="noopener noreferrer">${escapeAttribute(linkText)}<span class="report-issue__ext"> (opens GitHub in a new tab)</span></a>.
                    <span class="report-issue__note">Reports are public and need a free GitHub account. Please don't include personal or financial details.</span>
                </p>`;

}
