import { t } from "../i18n/index.js";
import { LanguageSwitcher } from "./language-switcher.js";
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
        <img src="${basePath("image/logo.png")}" title="${t("header.logoTitle")}" alt='${t("header.logoAlt")}'/>
        <p>${t("header.tagline")}</p>
      </div>
      ${LanguageSwitcher()}
      <div id="menu-wrapper">
        <ul id="main-menu">
          <li><a href="/map" data-link>${t("nav.map")}</a></li>
          <li><a href="/qualify/residency" data-link>${t("nav.qualify")}</a></li>
          <li><a href="/about" data-link>${t("nav.about")}</a></li>
          <li><a href="/search" data-link>${t("nav.search")}</a></li>
        </ul>
      </div>
    </div>
  `;
}
