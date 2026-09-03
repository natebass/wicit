import { t } from "../i18n/index.js";

/**
 * Default site footer.
 */
export function Footer() {
  return `
    <div class="footer-inner">
      <p>${t("footer.disclaimer")}</p>
    </div>
  `;
}
