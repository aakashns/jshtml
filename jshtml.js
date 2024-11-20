const jshtml = {
  /**
   * Converts &, <, >, ", ' to escaped HTML codes to prevent XSS attacks
   * @param {string} unsafeStr - The string to be sanitized
   */
  escapeForHtml(unsafeStr) {
    jshtml._assert(typeof unsafeStr === "string", `'unsafeStr' must be a string`);
    const CODES = { "&": "amp", "<": "lt", ">": "gt", '"': "quot", "'": "#39" };
    const result = unsafeStr.replace(/[&<>"']/g, (c) => `&${CODES[c]};`);
    jshtml._assert(typeof result === "string", `'result' must be a string`);
    return result;
  },

  /**
   * Converts an object of HTML attributes to a string
   * Handles boolean, null, and undefined values
   * Rejects illegal names and escapes values
   * @param {Object} attrs - HTML attribute key-value pairs
   */
  attrsToStr(attrs) {
    jshtml._assert(jshtml._isObject(attrs), `'attrs' must be an object`);
    const emptyVals = [null, undefined, false];
    const result = Object.keys(attrs)
      .filter((name) => emptyVals.indexOf(attrs[name]) === -1)
      .map((name) => {
        jshtml._assert(jshtml._isValidAttr(name), `Illegal attribute name: ${name}`);
        const value = attrs[name];
        if (value === true) return ` ${name}`;
        return ` ${name}="${jshtml.escapeForHtml(value.toString())}"`;
      })
      .join("");
    jshtml._assert(typeof result === "string", `'result' must be a string`);
    return result;
  },

  /* Checks if an attribute name is valid according to the HTML spec */
  _isValidAttr(name) {
    // deno-lint-ignore no-control-regex
    const illegalChars = /[ "'>\/= \u0000-\u001F\uFDD0-\uFDEF\uFFFF\uFFFE]/;
    return !illegalChars.test(name);
  },

  _isObject(val) {
    return typeof val === "object" && val !== null && !Array.isArray(val);
  },

  /* Names of void (self-closing) HTML tags e.g. <br> */
  VOID_TAGS: [
    "area",
    "base",
    "br",
    "col",
    "command",
    "embed",
    "hr",
    "img",
    "input",
    "keygen",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
  ],

  /* Makes an assertion and throws if it fails */
  _assert(expr, msg = "") {
    if (!expr) throw new jshtml.AssertionError(msg);
  },

  /* Error thrown when an assertion fails */
  AssertionError: class extends Error {},
};

export default jshtml;
