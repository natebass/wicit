import { t } from "../i18n/index.js";

/**
 * Not found (404) page.
 */
export function NotFoundView() {
  return `
    <div class="col-md-8 col-md-offset-2" id="content">
      <h2>${t("notFound.heading")}</h2>
      <p>${t("notFound.body")}</p>
      <ul>
        <li><a href="/map" data-link>${t("nav.map")}</a></li>
        <li><a href="/qualify/residency" data-link>${t("nav.qualify")}</a></li>
        <li><a href="/about" data-link>${t("nav.about")}</a></li>
        <li><a href="/search" data-link>${t("nav.search")}</a></li>
      </ul>
    </div>
  `;
}
