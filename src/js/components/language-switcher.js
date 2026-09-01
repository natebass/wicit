import { getLocale, setLocale, t } from "../i18n/index.js";
import { LOCALES, SUPPORTED_LOCALES } from "../i18n/locales.js";

/**
 * The language picker shown in the header.
 *
 * Languages are listed under their own names, since someone looking for their language will not
 * recognize its English name. Each option carries its own `lang`, so the browser picks a font that
 * can render the script, and its English name as a tooltip.
 */
export function LanguageSwitcher() {
  const active = getLocale();
  const options = SUPPORTED_LOCALES.map((code) => {
    const { name, nativeName } = LOCALES[code];
    return `<option value="${code}" lang="${code}" title="${name}"${
      code === active ? " selected" : ""
    }>${nativeName}</option>`;
  }).join("");

  return `
    <div id="language-switcher">
      <label for="language-select">${t("header.languageLabel")}</label>
      <select
        id="language-select"
        class="form-control"
        title="${t("header.languageTitle")}"
      >${options}</select>
    </div>
  `;
}

/**
 * Wire the switcher up once, at startup.
 *
 * The listener is delegated from the document because changing the language re-renders the header,
 * which would discard a listener bound to the `<select>` itself.
 */
export function initLanguageSwitcher() {
  document.addEventListener("change", (event) => {
    const select = event.target.closest?.("#language-select");
    if (select) setLocale(select.value);
  });
}
