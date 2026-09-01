import { t } from "../../i18n/index.js";

/**
 * Qualify step 1: California residency. "No" ends the quiz (residency reason);
 * "Yes" advances into the category branch.
 */
export function ResidencyStep() {
  return `
    <p>${t("qualify.residency.intro")}</p>
    <p class="warning">${t("qualify.residency.warning")}</p>
    <div class="form-group qualify residency">
      <span class="form-group-label">${t("qualify.residency.question")}</span>
      <button type="button" data-nav="/qualify/result?success=false&reason=residency">
        ${t("qualify.residency.no")}
      </button>
      <button type="button" data-nav="/qualify/category/pregnant">
        ${t("qualify.residency.yes")}
      </button>
    </div>
  `;
}
