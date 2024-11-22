# `jshtml` - Clean & Performant HTML in Pure JavaScript

`jshtml` is a lightweight library for writing clean and performant HTML in pure JavaScript. Create HTML elements and
custom components naturally using JavaScript arrays and functions, then render them to spec-compliant HTML strings or
serializable JSON.

`jshtml` provides a [JSX](https://facebook.github.io/jsx)-like developer experience without requiring any transpilation
or build tools. `jshtml` has no dependencies and can be used to render HTML on a server on within the browser. The
following example shows how to construct and render `jshtml` elements:

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

This will output clean, spec-compliant HTML (without any spaces or indentation):

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

## Installation & Usage

Currently, you can use `jshtml` by copying the `jshtml.js` file into your project. The library will soon be available on
NPM and JSR.

To use it, just import `jshtml` from `jshtml.js`:

```javascript
import jshtml from "./jshtml.js";
```

Construct `jshtml` elements using arrays and functions as shown below, and render them using `jshtml.renderToHtml` or
`jshtml.renderToJson`.

## How to Write JSHTML

### HTML Tags

HTML elements are represented as arrays where the first element is a string representing the tag name:

```javascript
// Basic elements
const element1 = [
  `div`,
  "Hello world",
];

const element2 = [`br`];

const element3 = [
  `p`,
  { class: "text" },
  "Some text",
];

// Nesting elements
const element4 = [
  `div`,
  [`h1`, "Title"],
  [`p`, "Paragraph"],
];
```

### Attributes (Props)

Attributes (also referred to as "props") can be optionally specified as an object in the second position of the array:

```javascript
const element = [
  `button`,
  {
    type: "submit",
    class: "btn primary",
    disabled: true,
    "data-id": "123",
  },
  "Submit",
];
```

Non-string attribute values are handled as follows while rendering:

- Boolean attributes (like `disabled`) will be included if set to true `true`, and omitted if `false`
- Attributes with `null` and `undefined` values are omitted
- Other values are automatically converted to strings and properly escaped

### Children

Children can be provided in two ways:

1. As additional array elements after the tag and props:

```javascript
const element1 = [
  `div`,
  [`h1`, "Title"],
  [`p`, "First paragraph"],
  [`p`, "Second paragraph"],
];

const element2 = [
  `div`,
  { class: "container" },
  [`h1`, "Title"],
  [`p`, "First paragraph"],
  [`p`, "Second paragraph"],
];
```

2. As the `children` prop (must be an array of elements):

```javascript
[`div`, {
  class: "container",
  children: [
    [`h1`, "Title"],
    [`p`, "Paragraph"],
  ],
}];
```

Individual children can be:

- Strings (automatically escaped to prevent XSS attacks)
- Numbers (converted to strings)
- Arrays representing `jshtml` elements
- `null`, `undefined`, or `false` (ignored)

### Components

Components are regular JavaScript functions that accept a single object containing props and children and return
`jshtml` element:

```javascript
function Button({ type = "button", onClick, children }) {
  return [
    `button`,
    {
      type,
      class: "btn",
      onclick: onClick,
    },
    ...children,
  ];
}
```

Once defined, they can be used in place of regular HTML tags:

```javascript
// Usage
const element = [
  Button,
  {
    type: "submit",
    onClick: "handleClick()",
  },
  "Click me",
];
```

The syntax for defining and using components is nearly identical to the JSX syntax used by libraries like React. Use
components to break your HTML page into modular, reusable pieces.

### Raw HTML

For cases where you need to insert pre-formatted HTML, use the `rawHtml` prop:

```javascript
const element = [
  `div`,
  {
    rawHtml: "<strong>Pre-formatted</strong> HTML",
  },
];
```

Note: Use this carefully as the content is not escaped!

## Rendering

### To HTML

Convert JSHTML elements to HTML strings:

```javascript
const element = [
  `div`,
  { class: "greeting" },
  "Hello, World!",
];
const html = jshtml.renderToHtml(element);
// <div class="greeting">Hello, World!</div>
```

### To Serializable JSON

Convert JSHTML elements to JSON-safe format (useful for sending over network):

```javascript
const element = [
  `div`,
  { class: "greeting" },
  "Hello, World!",
];
const json = jshtml.renderToJson(element);
// ["div", { "class": "greeting" }, "Hello, World!"]
```

The output of `renderToJson` can be passed to `renderToHtml` to generate the same HTML output as the original element.

## Comparison with JSX

`jshtml` provides a similar developer experience to JSX but with several advantages:

- ✅ No build tools or transpilation needed
- ✅ Works with vanilla JavaScript
- ✅ Fully typed and predictable
- ✅ Smaller bundle size
- ✅ Easier to debug (just arrays and objects)
- ✅ Can be serialized to JSON
- ✅ Runtime validation of tags and attributes

The main difference in syntax is using arrays instead of XML-like notation:

```javascript
// JSX
<div className="container">
  <h1>{title}</h1>
  <p>Content</p>
</div>;

// jshtml
[
  `div`,
  { class: "container" },
  [`h1`, title],
  [`p`, "Content"],
];
```

Both approaches support components, props, and children with very similar patterns, making it easy to transition between
them.

NOTE: `jshtml` does not support state, hooks, lifecycle methods and other such features for building dynamic UIs as its
primary purpose is togenerate HTML strings.
