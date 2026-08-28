/**
 * The "Do I qualify for WIC?" wizard shell that wraps every step. The router renders the active step
 * into `#qualify-outlet` and keeps this chrome mounted across step navigation.
 */
export function QualifyShell() {
  return `
    <div class="col-md-8 col-md-offset-2" id="content">
      <form id="qualify">
        <h2>Do I qualify for WIC?</h2>
        <div id="qualify-outlet"></div>
      </form>
      <p class="info">
        If you have any ideas on how we can improve this feature, please tweet us
        <a href="https://twitter.com/wicitapp">@wicitapp</a>.
      </p>
    </div>
  `;
}
