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
      <h3>You probably qualify for WIC!</h3>
      <p class="success">
        Your next step is to talk to a WIC agent. Call&nbsp;<a href="tel://888-942-9675">1-888-WIC-WORKS</a>
        to get started.
      </p>
    `;
  }

  if (reason === "residency") {
    return `
      <h3>Sorry, you have to live in-state to qualify for WIC in California.</h3>
      <p class="warning">
        If you're moving here, WIC can work with you. Give them a call at&nbsp;<a href="tel://888-942-9675">1-888-WIC-WORKS</a>.
      </p>
    `;
  }

  if (reason === "category") {
    return `
      <h3>Sorry, WIC is for people who identify with one of the following:</h3>
      <ul>
        <li>Women who are pregnant, breastfeeding, or just had a baby.</li>
        <li>Children under 5 years old (including foster children)</li>
        <li>Families with low to medium income (working families may qualify)</li>
      </ul>
      <p class="warning">
        A WIC agent may be able to help you find a different program that can help. To talk to a WIC
        agent, call&nbsp;<a href="tel://888-942-9675">1-888-WIC-WORKS</a>.
      </p>
    `;
  }

  if (reason === "income") {
    return `
      <h3>You might not qualify for WIC.</h3>
      <p class="warning">
        WIC is for families making less than 185% of the Federal Poverty Level ($23,850 for a family
        of four in 2014). You should still talk to a WIC agent at&nbsp;<a href="tel://888-942-9675">1-888-WIC-WORKS</a>
        to find out for sure whether you qualify.
      </p>
    `;
  }

  return `
    <h3>Whoops!</h3>
    <p class="warning">
      Told you we don't save your data! You can take the&nbsp;<a href="/qualify/residency" data-link>quiz</a>
      again though.
    </p>
  `;
}
