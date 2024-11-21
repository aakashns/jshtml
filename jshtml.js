const jshtml = {
  /**
   * Renders a JSHTML element into a valid spec-compliant HTML string
   * Supports raw data types and well as array-based JSHTML elements
   *
   * @param element - The JSHTML element to be rendered
   * @returns {string} - The HTML string representation of the element
   */
  renderToHtml(element) {
    const elType = typeof element;
    const rawTypes = ["string", "number", "bigint", "boolean", "undefined"];
    jshtml._assert(rawTypes.indexOf(elType) !== -1 || Array.isArray(element) || element === null, "Invalid 'element'");
    const assertResult = jshtml._makeAssert((result) => typeof result === "string", "'result' must be a string");

    // Empty
    if (element === null || element === undefined || element === false) return assertResult("");

    // Text
    if (elType === "string") return assertResult(jshtml.escapeForHtml(element));

    // Other Primitive Types
    if (elType === "number" || elType === "boolean" || elType === "bigint") return assertResult(element.toString());

    // Array
    const { tag, props, children } = jshtml._destructure(element);
    if (typeof tag === "string") {
      // HTML tag
      if (!jshtml.isValidTag(tag)) return Error(`Invalid tag name: ${tag}`);
      const { rawHtml, ...attrs } = props;
      const attrsStr = jshtml.attrsToStr(attrs);

      if (jshtml.VOID_TAGS.indexOf(tag) !== -1) {
        // Void Tag
        if (children.length > 0) throw Error(`Void tag ${tag} can't have children`);
        if (rawHtml) throw Error(`Void tag ${tag} can't have a 'rawHtml' prop`);
        return assertResult(`<${tag}${attrsStr}>`);
      }

      if (rawHtml) {
        // Raw HTML (not escaped)
        if (children.length > 0) throw Error("'rawHtml' and 'children' must not be used together");
        return assertResult(`<${tag}${attrsStr}>${rawHtml}</${tag}>`);
      }

      // Normal tag with children
      const childrenStr = children.map(jshtml.renderToHtml).join("");
      return assertResult(`<${tag}${attrsStr}>${childrenStr}</${tag}>`);
    } else if (typeof tag === "function") {
      // Function component
      return assertResult(jshtml.renderToHtml(tag({ ...props, children })));
    } else if (Array.isArray(tag) && tag.length === 0) {
      // List of elements
      if (Object.keys(props).length > 0) throw Error("Fragment [] must not have any props");
      return assertResult(children.map(jshtml.renderToHtml).join(""));
    }
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
      return [tag, props, ...children.map(jshtml.renderToJson)];
    } else if (typeof tag === "function") {
      return jshtml.renderToJson(tag(props, ...children));
    } else if (Array.isArray(tag) && tag.length === 0) {
      return element;
    }
    jshtml._assert(false, "'element[0]' must be a string, function, or []");
  },

  /* Destructure an element into tag, props, and children */
  _destructure(element) {
    jshtml._assert(Array.isArray(element) && element.length > 0, "'element' must be a non-empty array");
    const assertResult = jshtml._makeAssert((r) => typeof r === "object", "result must be an object");

    const result = jshtml._isObject(element[1])
      ? { tag: element[0], props: element[1], children: element.slice(2) }
      : { tag: element[0], props: {}, children: element.slice(1) };
    return assertResult(result);
  },

  /**
   * Converts &, <, >, ", ' to escaped HTML codes to prevent XSS attacks
   * @param {string} unsafeStr - The string to be sanitized
   */
  escapeForHtml(unsafeStr) {
    jshtml._assert(typeof unsafeStr === "string", `'unsafeStr' must be a string`);
    const assertResult = jshtml._makeAssert((res) => typeof res === "string", "result must be a string");

    const CODES = { "&": "amp", "<": "lt", ">": "gt", '"': "quot", "'": "#39" };
    return assertResult(unsafeStr.replace(/[&<>"']/g, (c) => `&${CODES[c]};`));
  },

  /**
   * Converts an object of HTML attributes to a string
   * Handles boolean, null, and undefined values
   * Rejects illegal names and escapes values
   * @param {Object} attrs - HTML attribute key-value pairs
   */
  attrsToStr(attrs) {
    jshtml._assert(jshtml._isObject(attrs), `'attrs' must be an object`);
    const assertResult = jshtml._makeAssert((res) => typeof res === "string", "result must be a string");

    const emptyVals = [null, undefined, false];
    const attrsStr = Object.keys(attrs)
      .filter((name) => emptyVals.indexOf(attrs[name]) === -1)
      .map((name) => {
        jshtml._assert(jshtml.isValidAttr(name), `Illegal attribute name: ${name}`);
        const value = attrs[name];
        if (value === true) return ` ${name}`;
        return ` ${name}="${jshtml.escapeForHtml(value.toString())}"`;
      })
      .join("");
    return assertResult(attrsStr);
  },

  /**
   * Checks if a string is a valid HTML attribute name
   * Based on {@link https://dev.w3.org/html5/spec-LC/syntax.html#syntax-attributes}
   *
   * @param {*} name - The attribute name to validate
   * @returns - `true` if `name` is valid, `false` otherwise
   */
  isValidAttr(name) {
    jshtml._assert(typeof name === "string", "'name' must be a string");
    const assertResult = jshtml._makeAssert((r) => typeof r === "boolean", "'result' must be a boolean");

    // deno-lint-ignore no-control-regex
    const nameRegex = /^[^ \x00-\x1F"'<>/=\\\uFDD0-\uFDEF\uFFFE\uFFFF]+$/;
    return assertResult(nameRegex.test(name));
  },

  /**
   * Checks if a string is a valid HTML tag or custom element name
   *
   * The following guidlines are used for validation:
   * - HTML tag name: {@link https://dev.w3.org/html5/spec-LC/syntax.html#elements-0}
   * - Custom element name: {@link https://html.spec.whatwg.org/#valid-custom-element-name}
   *
   * @param {string} name - The tag name to validate
   * @returns {boolean} `true` if `name` is valid, `false` otherwise
   */
  isValidTag(name) {
    jshtml._assert(typeof name === "string", "'name' must be a string");
    const assertResult = jshtml._makeAssert((r) => typeof r === "boolean", "'result' must be a boolean");

    const normalTagRegex = /^[a-zA-Z][a-zA-Z0-9]*$/;
    const customElementRegex =
      /^[a-z][\-.0-9_a-z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]*-[\-.0-9_a-z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]*$/u;
    return assertResult(normalTagRegex.test(name) || customElementRegex.test(name));
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

  /* Asserts a value using a function and returns it */
  _makeAssert(func, msg = "") {
    return function (value) {
      jshtml._assert(func(value), msg);
      return value;
    };
  },

  /* Error thrown when an assertion fails */
  AssertionError: class extends Error {},
};

export default jshtml;
