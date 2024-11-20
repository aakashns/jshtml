import jshtml from "./jshtml.js";
import { assertEquals, assertThrows } from "@std/assert";

const { attrsToStr, escapeForHtml } = jshtml;

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
