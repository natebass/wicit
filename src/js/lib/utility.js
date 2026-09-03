/**
 * Escapes special characters in user/data text to their corresponding HTML entities before injecting into innerHTML.
 *
 * @param {string} value - The input string to be escaped. If the input is null or undefined, it will be treated as an empty string.
 * @return {string} The escaped string with special characters replaced by their HTML entity equivalents.
 */
export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
