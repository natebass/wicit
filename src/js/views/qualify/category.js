const STEPS = {
  pregnant: {
    className: "pregnant",
    label: "Are you pregnant?",
    no: "/qualify/category/breastfeeding",
    yes: "/qualify/income",
  },
  breastfeeding: {
    className: "breastfeeding",
    label: "Are you breastfeeding a child that is less than one year-old?",
    no: "/qualify/category/infant",
    yes: "/qualify/income",
  },
  infant: {
    className: "infant",
    label: "Do you have a child that is less than six months-old?",
    no: "/qualify/category/child",
    yes: "/qualify/income",
  },
  child: {
    className: "child",
    label: "Do you have a child that is less than five years-old?",
    no: "/qualify/category/other-programs",
    yes: "/qualify/income",
  },
  "other-programs": {
    className: "otherprograms",
    label: `Do you currently receive any of the following:
      <ul>
        <li>Medi-Cal?</li>
        <li>Food Stamps/SNAP?</li>
        <li>TANF?</li>
        <li>FDPIR?</li>
        <li>WIC benefits from another state?</li>
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
    return `
      <p class="warning">That step doesn't exist. Start the
        <a href="/qualify/residency" data-link>quiz</a> over.</p>
    `;
  }
  return `
    <div class="form-group qualify category ${step.className}">
      <span class="form-group-label">${step.label}</span>
      <button type="button" data-nav="${step.no}">No</button>
      <button type="button" data-nav="${step.yes}">Yes</button>
    </div>
  `;
}
