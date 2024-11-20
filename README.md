# jshtml

Programmatically build HTML with pure JavaScript arrays and objects.

`jshtml` can be considered a replacement for JSX for building HTML programatically on a sever or in the browser without
a transpilation step.

Here's a comparison of JSX vs `jshtml`:

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

To use it, just copy the contents of `jshtml.js` into your project.

`jshtml` is currently under active development and a stable version will eventually be published to pacakge registries
NPM and JSR.
