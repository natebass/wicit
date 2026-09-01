# Message catalogs

Every catalog is a flat JSON object mapping a message key to the string shown to the reader.
`en.json` is the source of truth; the runtime falls back to it **per key**, so a catalog that is
empty, partial, or mid-review always renders — translated where a key exists, English everywhere
else.

Every language other than English is currently a stub (`{}`). The plumbing is complete; the
strings are not.

## Translating

1. Copy the keys you are translating out of `en.json` into the target catalog.
2. Translate the values, leaving `{placeholder}` tokens exactly as written — the runtime
   substitutes them, and a renamed token is rendered literally so the mistake is visible.
3. Keep any HTML in a value intact. Markup inside a message is trusted and rendered as-is; only
   placeholder values are escaped. Do not add markup that was not in the English string.
4. Leave out keys you have not translated. Do **not** ship a key with an empty string — an empty
   value counts as a translation and hides the English fallback.

## Plurals

Keys ending in a CLDR plural category (`.one`, `.other`, and where a language needs them `.zero`,
`.two`, `.few`, `.many`) are selected at runtime by `tCount()` from the count. Provide whichever
categories the language actually uses; `.other` is required as the fallback form.

## Adding a language

Add an entry to `../locales.js` and a `<code>.json` file here. Nothing else needs to change —
the switcher, the `<html lang>`/`dir` attributes, and number formatting all read that registry.
