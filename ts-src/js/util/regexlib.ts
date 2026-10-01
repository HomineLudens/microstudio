// Shared regex/string validation helpers used both client- and server-side.
// Loaded as a plain (non-module) script — see server/concatenator.coffee.
// `this.RegexLib = ...` assigns a property on the global object (safe to
// re-run without redeclaration conflicts, unlike a lexical `const`/`class`).
// Also `require()`d directly from server/session/session.coffee, so the
// trailing CommonJS interop guard must be preserved.
declare var module: { exports: unknown } | undefined;

interface RegexLibType {
  email: RegExp;
  nick: RegExp;
  filename: RegExp;
  slug: RegExp;
  csscolor: RegExp;
  slugify(text: string): string;
  fixFilename(text: string): string;
  fixFilePath(text: string): string;
  fixNick(text: string): string;
}

(this as any).RegexLib = {
  email:
    /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,25}|[0-9]{1,3})(\]?)$/,
  nick: /^[a-zA-Z0-9_]{5,30}$/,
  filename: /^[a-z0-9_]{1,30}$/,
  slug: /^[a-zA-Z0-9_]{1,30}$/,
  csscolor: /^(#[0-9A-Fa-f]{3,6})|(hsl\(\d+,\d+%,\d+%\))|(rgb\(\d+,\d+,\d+\))$/,

  slugify(text: string): string {
    return text
      .normalize("NFD")
      .replace(/[^a-zA-Z0-9_]/g, "")
      .toLowerCase();
  },

  fixFilename(text: string): string {
    return text
      .normalize("NFD")
      .replace(/[^a-zA-Z0-9_]/g, "")
      .toLowerCase();
  },

  fixFilePath(text: string): string {
    while (text.startsWith("/")) {
      text = text.substring(1);
    }
    while (text.endsWith("/")) {
      text = text.substring(0, text.length - 1);
    }
    const t = text.split("/");
    for (let i = 0; i < t.length; i++) {
      t[i] = RegexLib.fixFilename(t[i]);
    }
    return t.join("/");
  },

  fixNick(text: string): string {
    return text.normalize("NFD").replace(/[^a-zA-Z0-9_]/g, "");
  },
} as RegexLibType;

declare var RegexLib: RegexLibType;

if (typeof module !== "undefined" && module !== null) {
  module.exports = (this as any).RegexLib;
}
