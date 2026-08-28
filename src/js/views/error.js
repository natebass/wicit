/**
 * Not found (404) page.
 */
export function NotFoundView() {
  return `
    <div class="col-md-8 col-md-offset-2" id="content">
      <h2>Page not found</h2>
      <p>We couldn't find that page. Try one of these instead:</p>
      <ul>
        <li><a href="/map" data-link>Who Accepts WIC?</a></li>
        <li><a href="/qualify/residency" data-link>Do I Qualify?</a></li>
        <li><a href="/about" data-link>What Is WIC?</a></li>
        <li><a href="/search" data-link>Which Foods Qualify?</a></li>
      </ul>
    </div>
  `;
}
