import jshtml from "@aakashns/jshtml";

function App() {
  return [
    ``,
    [`!doctype`, { html: true }],
    [
      `html`,
      { lang: "en" },
      [`head`, [`title`, "TODO MVC"]],
      [
        `body`,
        [`div`, [`h1`, "TODO MVC"]],
      ],
    ],
  ];
}

export default {
  async fetch() {
    const pageHtml = jshtml.renderToHtml([App]);
    const headers = { "Content-Type": "text/html" };
    return new Response(pageHtml, { headers });
  },
};
