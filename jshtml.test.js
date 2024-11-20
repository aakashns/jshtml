import jshtml from "./jshtml.js";
import { assertEquals, assertThrows } from "@std/assert";

const { renderToHtml, escapeForHtml, attrsToStr } = jshtml;

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
  function Greeting({ name }) {
    return [`strong`, "Hello, ", name, "!"];
  }
  const input = [Greeting, { name: "JSX" }];
  const expected = "<strong>Hello, JSX!</strong>";
  assertEquals(renderToHtml(input), expected);
});

Deno.test("renders a list of elements starting with []", () => {
  const input = [
    [],
    [`h1`, "Hello, ", [`strong`, "world"], "!"],
    [`div`, { class: "main" }, "Goodbye, ", [`strong`, "world"], "!"],
  ];
  const expected = '<h1>Hello, <strong>world</strong>!</h1><div class="main">Goodbye, <strong>world</strong>!</div>';
  assertEquals(renderToHtml(input), expected);
});

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
