/**
 * Qualify step 1: California residency. "No" ends the quiz (residency reason);
 * "Yes" advances into the category branch.
 */
export function ResidencyStep() {
  return `
    <p>
      This short survey is designed to help you figure out if you qualify for WIC. Your answers are
      <em>not</em> saved, this is just for you to figure out if you qualify for WIC.
    </p>
    <p class="warning">
      Please keep in mind, this is just a guide. Only local WIC Agency staff can determine for
      certain if you qualify for WIC services. Call&nbsp;<a href="tel://888-942-9675">1-888-WIC-WORKS</a>
      to find out for sure if you qualify.
    </p>
    <div class="form-group qualify residency">
      <span class="form-group-label">Do you live in California?</span>
      <button type="button" data-nav="/qualify/result?success=false&reason=residency">no</button>
      <button type="button" data-nav="/qualify/category/pregnant">yes</button>
    </div>
  `;
}
