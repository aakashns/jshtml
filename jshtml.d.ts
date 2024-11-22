declare module "jshtml" {
  type JshtmlPrimitive = string | number | bigint | boolean | undefined | null;
  type JshtmlProps = Record<string, any>;
  type JshtmlComponent = (props: JshtmlProps & { children?: JshtmlElement[] }) => JshtmlElement;
  type JshtmlElement = JshtmlPrimitive | [string | JshtmlComponent, JshtmlProps?, ...JshtmlElement[]];

  interface Jshtml {
    renderToHtml(element: JshtmlElement): string;
    renderToJson(element: JshtmlElement): any;
    parseArray(element: [string | JshtmlComponent, ...any[]]): {
      tag: string | JshtmlComponent;
      props: JshtmlProps;
      children: JshtmlElement[];
    };
    escapeForHtml(unsafeStr: string): string;
    attrsToStr(attrs: JshtmlProps): string;
    isValidAttr(name: string): boolean;
    isValidTag(name: string): boolean;
    VOID_TAGS: readonly string[];
    AssertionError: typeof Error;
  }

  const jshtml: Jshtml;
  export default jshtml;
}
