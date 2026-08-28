import { basePath } from "../lib/paths.js";

/**
 * Default site header.
 * The navigation links use `data-link` so the router intercepts them.
 * The active item is highlighted by the router's `updateActiveNav`.
 *
 * @see router.js
 */
export function Header() {
  return `
    <div>
      <div class="logo">
        <img src="${basePath("image/logo.png")}" title="WICit, Where and How to Get and Use WIC." alt='Find WIC logo.'/>
        <p>Where and how to get and use WIC</p>
      </div>
      <div id="menu-wrapper">
        <ul id="main-menu">
          <li><a href="/map" data-link>Who Accepts WIC?</a></li>
          <li><a href="/qualify/residency" data-link>Do I Qualify?</a></li>
          <li><a href="/about" data-link>What Is WIC?</a></li>
          <li><a href="/search" data-link>Which Foods Qualify?</a></li>
        </ul>
      </div>
    </div>
  `;
}
