const jshtml = {
  /**
   * TODO:
   * - [ ] Add assertions for output (each step)
   * - [ ] Add support for `rawHtml` (& ensure no children)
   * - [ ] Add check for no children in void tag
   * - [ ] Add check for no props in fragment
   * - [ ] Add documentation
   *
   * @param element
   */
  renderToHtml(element) {
    // Empty
    if (element === null || element === undefined || element === false) return "";

    // Text
    const elType = typeof element;
    if (elType === "string") return jshtml.escapeForHtml(element);

    // Other Primitive Types
    if (elType === "number" || elType === "boolean" || elType === "bigint") return element.toString();

    // HTML Tag or Function
    if (!Array.isArray(element)) throw Error("'element' must be an array");
    const tag = element[0];
    let props, children;
    if (jshtml._isObject(element[1])) {
      props = element[1];
      children = element.slice(2);
    } else {
      props = {};
      children = element.slice(1);
    }

    if (typeof tag === "string") {
      const attrsStr = jshtml.attrsToStr(props);
      if (jshtml.VOID_TAGS.includes(tag)) {
        if (children.length > 0) throw Error("Void tag cannot have children");
        return `<${tag}${attrsStr}>`;
      } else {
        const prefix = tag === "html" ? "<!doctype html>" : "";
        const childrenStr = children.map(jshtml.renderToHtml).join("");
        return `${prefix}<${tag}${attrsStr}>${childrenStr}</${tag}>`;
      }
    } else if (typeof tag === "function") {
      return jshtml.renderToHtml(tag(props, ...children));
    } else if (Array.isArray(tag) && tag.length === 0) {
      return children.map(jshtml.renderToHtml).join("");
    }

    throw Error("'element[0]' must be a string, function, or []");
  },

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
