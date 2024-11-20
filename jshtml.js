import { assert } from "@std/assert/assert";

const jshtml = {
  /**
   * TODO:
   * - [ ] Add assertions for output (each step)
   * - [ ] Add assertions in intermediate steps
   * - [ ] Add support for `rawHtml` (& ensure no children)
   * - [ ] Add check for no children in void tag
   * - [ ] Add check for no props in fragment
   * - [ ] Add documentation (and examples?)
   * - [ ] Validate HTML tag names
   * - [ ] Remove usage of `Array.includes`
   * - [ ] Add error test cases
   * - [ ] Test error feedback quality in various scenairos
   * - [ ] Add module level docs
   * - [ ] Add a configuration to turn off asserts
   * - [ ] Add a renderToDom function (is it really needed?)
   * - [ ] Include links to HTML spec where it's relevant
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

    // Array
    const { tag, props, children } = jshtml._destructure(element);
    if (typeof tag === "string") {
      // HTML tag
      jshtml._assert(jshtml._isValidTag(tag), `Invalid tag name: ${tag}`);
      const { rawHtml, ...attrs } = props;
      const attrsStr = jshtml.attrsToStr(attrs);

      if (jshtml.VOID_TAGS.includes(tag)) {
        // Void Tag
        if (children.length > 0) throw Error("Void tag cannot have children");
        if (rawHtml) throw Error("Void tags can't have a 'rawHtml' prop");
        return `<${tag}${attrsStr}>`;
      }

      if (rawHtml) {
        // Raw HTML (not escaped)
        if (children.length > 0) throw Error("'rawHtml' and children can't be present together");
        return `<${tag}${attrsStr}>${rawHtml}</${tag}>`;
      }

      // Normal tag with children
      const childrenStr = children.map(jshtml.renderToHtml).join("");
      return `<${tag}${attrsStr}>${childrenStr}</${tag}>`;
    } else if (typeof tag === "function") {
      // Function component
      return jshtml.renderToHtml(tag(props, ...children));
    } else if (Array.isArray(tag) && tag.length === 0) {
      // List of elements
      return children.map(jshtml.renderToHtml).join("");
    }
    assert(false, "'element[0]' must be a string, function, or []");
  },

  /**
   * Create a serializable JSON representation from an element
   *
   * TODO:
   * - [ ] Test functionality
   * - [ ] Add more assetions (?)
   * - [ ] Add result key assertions in destructure (?)
   *
   * @param element
   */
  renderToJson(element) {
    if (!Array.isArray(element)) return element;
    const { tag, props, children } = jshtml._destructure(element);
    if (typeof tag === "string") {
      return [tag, props, ...children.map(this.renderToJson)];
    } else if (typeof tag === "function") {
      return this.renderToJson(tag(props, ...children));
    } else if (Array.isArray(tag) && tag.length === 0) {
      return element;
    }
    assert(false, "'element[0]' must be a string, function, or []");
  },

  /* Destructure an element into tag, props, and children */
  _destructure(element) {
    jshtml._assert(Array.isArray(element) && element.length > 0, "'element' must be a non-empty array");
    const result = jshtml._isObject(element[1])
      ? { tag: element[0], props: element[1], children: element.slice(2) }
      : { tag: element[0], props: {}, children: element.slice(1) };
    jshtml._assert(jshtml._isObject(result), "'result' must be an object");
    return result;
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

  /* Checks if a tag name is valid according to the HTML spec */
  _isValidTag(name) {
    const regex = /^[a-zA-Z_:][a-zA-Z0-9\-_:.]*$/;
    return regex.test(name);
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
