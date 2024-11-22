# `jshtml` - Clean & Performant HTML in Pure JavaScript

`jshtml` is a lightweight library for writing clean and performant HTML in pure JavaScript. Write components naturally
using JavaScript functions and arrays, then render them to spec-compliant HTML strings or serializable JSON.

`jshtml` provides a [JSX](https://facebook.github.io/jsx)-like developer experience without requiring any transpilation
or build tools. `jshtml` has no dependencies and can be used on a server on within a browser.

The following example shows how to construct and render `jshtml` elements:

```javascript
import jshtml from "./jshtml.js";

// Define your components using regular JavaScript functions
function App() {
  const title = "My JSHTML App";
  const items = ["Apple", "Banana", "Orange"];

  // Use nested arrays to create HTML elements
  return [
    `html`,
    [`head`, [`title`, title]],
    [
      `body`,
      { class: "container" }, // Use objects for attributes
      [Header, { title }],
      [
        `main`,
        [`h2`, "Favorite Fruits"],
        [`ul`, { children: items.map((item) => [`li`, item]) }],
      ],
      [Footer, [`p`, "Visit our website for more."]],
    ],
  ];
}

// Components can accept props
function Header({ title }) {
  return [`header`, [`h1`, { class: "title" }, title]];
}

// Components can accept children
function Footer({ children }) {
  return [`footer`, [`p`, "© 2024 JSHTML"], ...children];
}

// Render to a spec-compliant HTML string
const html = jshtml.renderToHtml([App]);
console.log(html);
```

This will output clean, spec-compliant HTML (wihtout spaces or indentation):

```html
<html>
  <head>
    <title>My JSHTML App</title>
  </head>
  <body class="container">
    <header>
      <h1 class="title">My JSHTML App</h1>
    </header>
    <main>
      <h2>Favorite Fruits</h2>
      <ul>
        <li>Apple</li>
        <li>Banana</li>
        <li>Orange</li>
      </ul>
    </main>
    <footer>
      <p>© 2024 JSHTML</p>
      <p>Visit our website for more.</p>
    </footer>
  </body>
</html>
```

## Installation

Currently, you can use JSHTML by copying the `jshtml.js` file into your project. The library will soon be available on
NPM and JSR.

```javascript
import jshtml from "./jshtml.js";
```

## How to Write JSHTML

### HTML Tags

HTML elements are represented as arrays where the first element is the tag name as a string:

```javascript
// Basic elements
[`div`, "Hello world"][`br`][`p`, { class: "text" }, "Some text"] // Nesting elements
  [`div`, [`h1`, "Title"], [`p`, "Paragraph"]];
```

### Attributes (Props)

Attributes are specified as an object in the second position of the array:

```javascript
[`button`, {
  type: "submit",
  class: "btn primary",
  disabled: true,
  "data-id": "123",
}];
```

Special cases:

- Boolean attributes (like `disabled`) will be included if `true`, omitted if `false`
- `null` and `undefined` values are omitted
- Values are automatically converted to strings and properly escaped

### Children

Children can be provided in two ways:

1. As additional array elements after the tag and props:

```javascript
[`div`, [`h1`, "Title"], [`p`, "First paragraph"], [`p`, "Second paragraph"]];
```

2. As a `children` prop:

```javascript
[`div`, {
  class: "container",
  children: [
    [`h1`, "Title"],
    [`p`, "Paragraph"],
  ],
}];
```

Children can be:

- Strings (automatically escaped)
- Numbers (converted to strings)
- Arrays (nested elements)
- `null`, `undefined`, or `false` (ignored)
- Component function calls

### Components

Components are regular JavaScript functions that return JSHTML elements:

```javascript
function Button({ type = "button", onClick, children }) {
  return [`button`, {
    type,
    class: "btn",
    onclick: onClick,
  }, ...children];
}

// Usage
[Button, {
  type: "submit",
  onClick: "handleClick()",
}, "Click me"];
```

### Raw HTML

For cases where you need to insert pre-formatted HTML, use the `rawHtml` prop:

```javascript
[`div`, {
  rawHtml: "<strong>Pre-formatted</strong> HTML",
}];
```

Note: Use this carefully as the content is not escaped!

## Rendering

### To HTML

Convert JSHTML elements to HTML strings:

```javascript
const element = [`div`, { class: "greeting" }, "Hello, World!"];
const html = jshtml.renderToHtml(element);
// <div class="greeting">Hello, World!</div>
```

### To Serializable JSON

Convert JSHTML elements to JSON-safe format (useful for sending over network):

```javascript
const element = [`div`, { class: "greeting" }, "Hello, World!"];
const json = jshtml.renderToJson(element);
// ["div", { "class": "greeting" }, "Hello, World!"]
```

## Comparison with JSX

JSHTML provides a similar developer experience to JSX but with several advantages:

✅ No build tools or transpilation needed ✅ Works with vanilla JavaScript ✅ Fully typed and predictable ✅ Smaller
bundle size ✅ Easier to debug (just arrays and objects) ✅ Can be serialized to JSON ✅ Runtime validation of tags and
attributes

The main difference in syntax is using arrays instead of XML-like notation:

```javascript
// JSX
<div className="container">
  <h1>{title}</h1>
  <p>Content</p>
</div>;

// JSHTML
[`div`, { class: "container" }, [`h1`, title], [`p`, "Content"]];
```

Both approaches support components, props, and children with very similar patterns, making it easy to transition between
them.
