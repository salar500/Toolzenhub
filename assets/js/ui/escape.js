/* =========================================================
   ToolZen Hub
   Shared UI: text escaping

   Every shared UI primitive escapes the text it is given, so a
   tool can pass a visitor's own input (a typed value, a pasted
   document, an error message) without building an injection.
========================================================= */

export function escapeHTML(
    value = ""
) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

}
