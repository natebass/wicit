import { formatCurrency, t } from "../../i18n/index.js";

/**
 * The Federal Poverty Level figure the income copy cites, and the year it was published.
 * Named here so the copy carries a formatted number the reader's locale can group, rather than a
 * hard-coded "$23,850" that reads wrong in most languages.
 */
const CITED_POVERTY_LEVEL = 23850;
const CITED_POVERTY_LEVEL_YEAR = 2014;

/**
 * The qualify result. Reads `success` and `reason` from the query string and shows the matching outcome.
 *
 * @param {Object} ctx - The context object containing query parameters.
 * @param {Object} ctx.query - The query parameters in the request.
 * @param {string} ctx.query.success - Indicates success status as a string ("true" or "false").
 * @param {string} ctx.query.reason - The reason for disqualification, if any (e.g., "residency", "category", "income").
 * @return {string} A string containing the HTML response to be displayed to the user.
 */
export function ResultStep(ctx) {
  const success = ctx.query.success === "true";
  const reason = ctx.query.reason;

  if (success) {
    return `
      <h3>${t("qualify.result.success.heading")}</h3>
      <p class="success">${t("qualify.result.success.body")}</p>
    `;
  }

  if (reason === "residency") {
    return `
      <h3>${t("qualify.result.residency.heading")}</h3>
      <p class="warning">${t("qualify.result.residency.body")}</p>
    `;
  }

  if (reason === "category") {
    return `
      <h3>${t("qualify.result.category.heading")}</h3>
      <ul>
        <li>${t("about.who.women")}</li>
        <li>${t("about.who.children")}</li>
        <li>${t("about.who.income")}</li>
      </ul>
      <p class="warning">${t("qualify.result.category.body")}</p>
    `;
  }

  if (reason === "income") {
    const body = t("qualify.result.income.body", {
      threshold: formatCurrency(CITED_POVERTY_LEVEL),
      year: CITED_POVERTY_LEVEL_YEAR,
    });
    return `
      <h3>${t("qualify.result.income.heading")}</h3>
      <p class="warning">${body}</p>
    `;
  }

  return `
    <h3>${t("qualify.result.unknown.heading")}</h3>
    <p class="warning">${t("qualify.result.unknown.body")}</p>
  `;
}
