import { t } from "../../i18n/index.js";

/**
 * The category branch, keyed by the `:step` route parameter. Each step's prompt lives in the
 * message catalogs under `label`; `render` builds the steps whose prompt is more than a sentence.
 */
const STEPS = {
  pregnant: {
    className: "pregnant",
    label: "qualify.category.pregnant",
    no: "/qualify/category/breastfeeding",
    yes: "/qualify/income",
  },
  breastfeeding: {
    className: "breastfeeding",
    label: "qualify.category.breastfeeding",
    no: "/qualify/category/infant",
    yes: "/qualify/income",
  },
  infant: {
    className: "infant",
    label: "qualify.category.infant",
    no: "/qualify/category/child",
    yes: "/qualify/income",
  },
  child: {
    className: "child",
    label: "qualify.category.child",
    no: "/qualify/category/other-programs",
    yes: "/qualify/income",
  },
  "other-programs": {
    className: "otherprograms",
    // The programs are a list rather than prose, so each one is its own key: translators get a
    // short, standalone program name instead of a sentence with markup buried in it.
    render: () => `
      ${t("qualify.category.otherPrograms")}
      <ul>
        <li>${t("qualify.category.otherPrograms.medical")}</li>
        <li>${t("qualify.category.otherPrograms.snap")}</li>
        <li>${t("qualify.category.otherPrograms.tanf")}</li>
        <li>${t("qualify.category.otherPrograms.fdpir")}</li>
        <li>${t("qualify.category.otherPrograms.otherState")}</li>
      </ul>`,
    no: "/qualify/result?success=false&reason=category",
    yes: "/qualify/result?success=true",
  },
};

/**
 * Renders the HTML content for a specific category step in a quiz based on the provided context.
 *
 * @param {Object} ctx - The context object containing parameters for the current step.
 * @param {Object} ctx.params - The parameters related to the current step.
 * @param {string} ctx.params.step - The identifier of the current step.
 * @return {string} The HTML content for the step or a warning message if the step does not exist.
 */
export function CategoryStep(ctx) {
  const step = STEPS[ctx.params.step];
  if (!step) {
    return `<p class="warning">${t("qualify.stepMissing")}</p>`;
  }
  return `
    <div class="form-group qualify category ${step.className}">
      <span class="form-group-label">${step.render ? step.render() : t(step.label)}</span>
      <button type="button" data-nav="${step.no}">${t("qualify.no")}</button>
      <button type="button" data-nav="${step.yes}">${t("qualify.yes")}</button>
    </div>
  `;
}
