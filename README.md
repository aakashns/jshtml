# jshtml

_Build HTML with pure JavaScript arrays and objects_

`jshtml` can be considered a replacement for [JSX](https://facebook.github.io/jsx/) for building HTML programatically on
a sever or in the browser without a transpilation step. Here's a comparison of JSX vs `jshtml`:

```javascript
// With JSX

function App() {
  return (
    <html>
      <head>
        <title>Custom JSX</title>
      </head>
      <body>
        <div class="container" style="margin-top:30px;">
          <Greeting name="World" />
          <p>Welcome to JSX</p>
        </div>
      </body>
    </html>
  );
}

function Greeting({ name }) {
  return <strong>Hello, {name}!</strong>;
}
```

```javascript
// With jshtml

function App() {
  return [
    `html`,
    [`head`, [`title`, "Custom JSX"]],
    [`body`, [
      `div`,
      { class: "container", style: "margin-top:30px" },
      [Greeting, { name: "World" }],
      [`p`, "Welcome to JSX"],
    ]],
  ];
}

function Greeting({ name }) {
  return [`h1`, "Hello, ", name, "!"];
}
```

## Rendering to HTML

The main function `jshtml` exports is `renderToHtml`, which turns a tree of JSX elements into a valid spec-compliant
HTML string:

```javascript
const input = [
  `div`,
  { class: "container", style: "margin-top:10px;" },
  "Hello <>, ",
  null,
  [`strong`, "world"],
  "!",
];
const expected = '<div class="container" style="margin-top:10px;">Hello &lt;&gt;, <strong>world</strong>!</div>';
console.log(renderToHtml(input) == expected); // true
```

You can also use `jshtml.renderToJson` to convert a tree of JSX elements into serializable JSON that can be sent safely
across the wire. The output of `renderToJson` can be passed to `renderToHtml` to generate HTML.

## Custom Components

You can define custom `jshtml` components using pure functions:

```javascript
function Greeting({ name }, ...children) {
  return [`h1`, "Hello, ", name, "!"];
}
```

And use them as follows:

```javascript
function App() {
  return [
    `div`,
    [Greeting, { name: "World" }],
    [`p`, "Welcome to JSX"],
  ];
}
```

**NOTE**: There's no support for state, hooks, lifecycle methods, class components etc. since `jshtml` is primarly
intended for creating HTML strings.

## Installation

To use `jshtml`, just copy the contents of `jshtml.js` into your project.

`jshtml` is currently under active development and a stable version will eventually be published to pacakge registries
NPM and JSR.
