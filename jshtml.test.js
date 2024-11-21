import jshtml from "./jshtml.js";
import { assertEquals, assertThrows } from "@std/assert";

const { renderToHtml } = jshtml;

Deno.test(`${renderToHtml.name} - renders empty elements`, () => {
  assertEquals(renderToHtml(null), "");
  assertEquals(renderToHtml(false), "");
  assertEquals(renderToHtml(undefined), "");
  assertEquals(renderToHtml(""), "");
});

Deno.test(`${renderToHtml.name} - renders strings with proper escaping`, () => {
  const input = "Tom & Jerry's < 'quotes' >";
  const expected = "Tom &amp; Jerry&#39;s &lt; &#39;quotes&#39; &gt;";
  assertEquals(renderToHtml(input), expected);
});

Deno.test(`${renderToHtml.name} - renders other primitive types as strings`, () => {
  assertEquals(renderToHtml(23), "23");
  assertEquals(renderToHtml(true), "true");
  assertEquals(renderToHtml(123n), "123");
});

Deno.test(`${renderToHtml.name} - renders a void HTML tag without attributes`, () => {
  const input = ["img"];
  const expected = "<img>";
  assertEquals(renderToHtml(input), expected);
});

Deno.test(`${renderToHtml.name} - renders a void HTML tag with attributes`, () => {
  const input = [`img`, { src: "https://example.com/image.jpg", alt: 'An "image"', loading: "lazy" }];
  const expected = '<img src="https://example.com/image.jpg" alt="An &quot;image&quot;" loading="lazy">';
  assertEquals(renderToHtml(input), expected);
});

Deno.test(`${renderToHtml.name} - renders an HTML element without children or attributes`, () => {
  const input = [`div`];
  const expected = "<div></div>";
  assertEquals(renderToHtml(input), expected);
});

Deno.test(`${renderToHtml.name} - renders an HTML tag with attributes only`, () => {
  const input = [`div`, { class: "container", style: "margin-top:10px;" }];
  const expected = '<div class="container" style="margin-top:10px;"></div>';
  assertEquals(renderToHtml(input), expected);
});

Deno.test(`${renderToHtml.name} - renders an HTML tag with children only`, () => {
  const input = [`div`, "Hello, ", null, [`strong`, "world"], "!"];
  const expected = "<div>Hello, <strong>world</strong>!</div>";
  assertEquals(renderToHtml(input), expected);
});

Deno.test(`${renderToHtml.name} - renders an HTML tag with attributes and children`, () => {
  const input = [
    `div`,
    { class: "container", style: "margin-top:10px;" },
    "Hello <>, ",
    null,
    [`strong`, "world"],
    "!",
  ];
  const expected = '<div class="container" style="margin-top:10px;">Hello &lt;&gt;, <strong>world</strong>!</div>';
  assertEquals(renderToHtml(input), expected);
});

Deno.test(`${renderToHtml.name} - renders a function component`, () => {
  function Greeting({ name, children }) {
    return [`div`, [`strong`, "Hello, ", name, "!"], ...children];
  }
  const input = [Greeting, { name: "JSX" }, [`span`, "Hello, world"]];
  const expected = "<div><strong>Hello, JSX!</strong><span>Hello, world</span></div>";
  assertEquals(renderToHtml(input), expected);
});

Deno.test(`${renderToHtml.name} - renders a list of elements starting with []`, () => {
  const input = [
    [],
    [`h1`, "Hello, ", [`strong`, "world"], "!"],
    [`div`, { class: "main" }, "Goodbye, ", [`strong`, "world"], "!"],
  ];
  const expected = '<h1>Hello, <strong>world</strong>!</h1><div class="main">Goodbye, <strong>world</strong>!</div>';
  assertEquals(renderToHtml(input), expected);
});

Deno.test(`${renderToHtml.name} - renders unsanitized HTML with 'rawHtml' prop`, () => {
  const input = [`div`, { class: "container", rawHtml: "<script>alert('XSS')</script>" }];
  const expected = "<div class=\"container\"><script>alert('XSS')</script></div>";
  assertEquals(renderToHtml(input), expected);
});

Deno.test(`${renderToHtml.name} - throws for invalid element types`, () => {
  assertThrows(() => renderToHtml({}), "Invalid 'element'");
  assertThrows(() => renderToHtml(Symbol("invalid")), "Invalid 'element'");
  assertThrows(() => renderToHtml(() => {}), "Invalid 'element'");
});

Deno.test(`${renderToHtml.name} - throws error for invalid tag names`, () => {
  assertThrows(() => renderToHtml([`invalid_tag_name!`]), "Invalid tag name: invalid_tag_name!");
});

Deno.test(`${renderToHtml.name} - throws error when void tag has children`, () => {
  assertThrows(() => renderToHtml([`img`, {}, "Some content"]), "Void tag img can't have children");
});

Deno.test(`${renderToHtml.name} - throws error when void tag has a 'rawHtml' prop`, () => {
  assertThrows(
    () => renderToHtml([`img`, { rawHtml: "<script>alert('XSS')</script>" }]),
    "Void tag img can't have a 'rawHtml' prop",
  );
});

Deno.test(`${renderToHtml.name} - throws error when 'rawHtml' and 'children' are used together`, () => {
  assertThrows(
    () => renderToHtml([`div`, { rawHtml: "<span>raw</span>" }, "This is text"]),
    Error,
    "'rawHtml' and 'children' must not be used together",
  );
});

Deno.test(`${renderToHtml.name} - throws error for invalid fragment props`, () => {
  assertThrows(
    () => renderToHtml([[], { class: "container" }]),
    Error,
    "Fragment [] must not have any props",
  );
});

Deno.test(`${renderToHtml.name} - throws error for invalid tag in array`, () => {
  const input = [{}, {}, "Invalid tag"];
  assertThrows(() => renderToHtml(input), "'element[0] must be a string, function, or []");
});

Deno.test(`${renderToHtml.name} - throws error if children are included twice for a function component`, () => {
  function Greeting({ name, children }) {
    return [`div`, [`strong`, "Hello, ", name, "!"], ...children];
  }
  const input = [Greeting, { name: "JSX", children: "Hello, world" }, [`span`, "Hello, world"]];
  assertThrows(() => renderToHtml(input), Error, "Include children within or after 'props' but not both");
});

const { renderToJson } = jshtml;

Deno.test(`${renderToJson.name} - returns element as-is if not an array`, () => {
  assertEquals(renderToJson("text"), "text");
  assertEquals(renderToJson(123), 123);
  assertEquals(renderToJson(true), true);
  assertEquals(renderToJson(null), null);
});

Deno.test(`${renderToJson.name} - converts a JSHTML element to JSON`, () => {
  const input = [`div`, { class: "container" }, "Hello", [`span`, {}, "World"]];
  const expected = [`div`, { class: "container" }, "Hello", ["span", "World"]];
  assertEquals(renderToJson(input), expected);
});

Deno.test(`${renderToJson.name} - renders a function component to JSON`, () => {
  function Greeting({ name, children = [] }) {
    return [`div`, { class: "greeting" }, `Hello, ${name}!`, ...children];
  }
  const input = [Greeting, { name: "JSX" }, [`span`, "Goodbye, world"]];
  const expected = ["div", { class: "greeting" }, "Hello, JSX!", ["span", "Goodbye, world"]];
  assertEquals(renderToJson(input), expected);
});

Deno.test(`${renderToJson.name} - returns a fragment as-is`, () => {
  const input = [[], "Hello", "world"];
  const expected = [[], "Hello", "world"];
  assertEquals(renderToJson(input), expected);
});

Deno.test(`${renderToJson.name} - throws error for invalid tag in array`, () => {
  const input = [{}, {}, "Invalid tag"];
  assertThrows(() => renderToJson(input), "'element[0]' must be a string, function, or []");
});

Deno.test(`${renderToJson.name} - throws error if children are included twice for a function component`, () => {
  function Greeting({ name, children }) {
    return [`div`, [`strong`, "Hello, ", name, "!"], ...children];
  }
  const input = [Greeting, { name: "JSX", children: "Hello, world" }, [`span`, "Hello, world"]];
  assertThrows(() => renderToJson(input), Error, "Insclude children within or after 'props' but not both");
});

const { escapeForHtml } = jshtml;

Deno.test(`${escapeForHtml.name} - escapes &, <, >, \", and '`, () => {
  const input = 'Tom & Jerry\'s < "quotes" >';
  const escapedOutput = "Tom &amp; Jerry&#39;s &lt; &quot;quotes&quot; &gt;";
  assertEquals(escapeForHtml(input), escapedOutput);
});

Deno.test(`${escapeForHtml.name} - escapes XSS attack vectors`, () => {
  const xssInput = `<script>alert('XSS')</script>`;
  const escapedOutput = `&lt;script&gt;alert(&#39;XSS&#39;)&lt;/script&gt;`;
  assertEquals(escapeForHtml(xssInput), escapedOutput);
});

Deno.test(`${escapeForHtml.name} - throws for non-string input`, () => {
  const message = "'unsafeStr' must be a string";
  assertThrows(() => escapeForHtml(123), Error, message);
  assertThrows(() => escapeForHtml(null), Error, message);
  assertThrows(() => escapeForHtml(undefined), Error, message);
  assertThrows(() => escapeForHtml({}), Error, message);
});

const { attrsToStr } = jshtml;

Deno.test(`${attrsToStr.name} - renders empty object`, () => {
  assertEquals(attrsToStr({}), "");
});

Deno.test(`${attrsToStr.name} - renders a mix of different value types`, () => {
  const input = {
    class: "btn primary",
    disabled: true,
    id: "submit-btn",
    onClick: 'alert("clicked")',
    dataRole: null,
    style: undefined,
    draggable: false,
    height: 34,
  };
  const expected = ` class="btn primary" disabled id="submit-btn" onClick="alert(&quot;clicked&quot;)" height="34"`;
  const result = attrsToStr(input);
  assertEquals(result, expected);
});

Deno.test(`${attrsToStr.name} - throws for non-object inputs`, () => {
  const input = "test";
  const msg = "'attrs' must be an object";
  assertThrows(() => attrsToStr(input), msg);
});

Deno.test(`${attrsToStr.name} - throws for illegal attribute names`, () => {
  const input = { "illegal>attr": "value" };
  const msg = "Illegal attribute name: illegal-attr";
  assertThrows(() => attrsToStr(input), msg);
});

const { isValidAttr } = jshtml;

Deno.test(`${isValidAttr.name} - returns false for the empty string`, () => {
  assertEquals(isValidAttr(""), false);
});

Deno.test(`${isValidAttr.name} - returns true for a valid attribute name`, () => {
  assertEquals(isValidAttr("data-id"), true);
  assertEquals(isValidAttr("class"), true);
  assertEquals(isValidAttr("aria-label"), true);
});

Deno.test(`${isValidAttr.name} - returns false for invalid characters`, () => {
  assertEquals(isValidAttr("data id"), false); // space
  assertEquals(isValidAttr("data<id"), false); // `<`
  assertEquals(isValidAttr('data"id'), false); // `"`
  assertEquals(isValidAttr("data'id"), false); // `'`
  assertEquals(isValidAttr("data=id"), false); // `=`
  assertEquals(isValidAttr("data/id"), false); // `/`
  assertEquals(isValidAttr("data\\id"), false); // `\`
});

Deno.test(`${isValidAttr.name} - returns false for control characters`, () => {
  assertEquals(isValidAttr("data\u0000id"), false); // Null character
  assertEquals(isValidAttr("data\u001Fid"), false); // Unit Separator
});

Deno.test(`${isValidAttr.name} - returns false for noncharacters`, () => {
  assertEquals(isValidAttr("data\uFDD0id"), false); // Noncharacter U+FDD0
  assertEquals(isValidAttr("data\uFFFEid"), false); // Noncharacter U+FFFE
  assertEquals(isValidAttr("data\uFFFFid"), false); // Noncharacter U+FFFF
});

Deno.test(`${isValidAttr.name} - throws for non-string input`, () => {
  assertThrows(() => isValidAttr(123), "'name' must be a string");
  assertThrows(() => isValidAttr({}), "'name' must be a string");
  assertThrows(() => isValidAttr(null), "'name' must be a string");
  assertThrows(() => isValidAttr(undefined), "'name' must be a string");
});

const { isValidTag } = jshtml;

Deno.test(`${isValidTag.name} - returns false for invalid tag names`, () => {
  assertEquals(isValidTag(""), false);
  assertEquals(isValidTag("123"), false); // Starts with a number
  assertEquals(isValidTag("-tag"), false); // Starts with a hyphen
  assertEquals(isValidTag("ta@ag"), false); // Contains invalid character
});

Deno.test(`${isValidTag.name} - returns true for valid HTML tag names`, () => {
  assertEquals(isValidTag("div"), true);
  assertEquals(isValidTag("p"), true);
  assertEquals(isValidTag("span"), true);
  assertEquals(isValidTag("h1"), true);
});

Deno.test(`${isValidTag.name} - returns false for invalid custom element names`, () => {
  assertEquals(isValidTag("-custom-element"), false); // Starts with hyphen
  assertEquals(isValidTag("custom..element"), false); // Double periods
});

Deno.test(`${isValidTag.name} - returns true for valid custom element names`, () => {
  assertEquals(isValidTag("custom-element"), true);
  assertEquals(isValidTag("my-widget"), true);
  assertEquals(isValidTag("app-container"), true);
  assertEquals(isValidTag("x-tag"), true);
  assertEquals(isValidTag("my-custom-element"), true); // multiple hyphens
  assertEquals(isValidTag("custom-element-"), true); // ends with hyphen
  assertEquals(isValidTag("widget-🌟"), false); // Emoji
});

Deno.test(`${isValidTag.name} - supports Unicode characters for custom elements`, () => {
  assertEquals(isValidTag("x-élement"), true);
  assertEquals(isValidTag("tag-アニメ"), true);
});

Deno.test(`${isValidTag.name} - throws an error when 'name' is not a string`, () => {
  assertThrows(() => isValidTag(123), Error, "'name' must be a string");
  assertThrows(() => isValidTag(null), Error, "'name' must be a string");
  assertThrows(() => isValidTag(undefined), Error, "'name' must be a string");
});
