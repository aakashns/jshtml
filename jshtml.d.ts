declare module "jshtml" {
  class AssertionError extends Error {}

  interface JSHTML {
    renderToHtml(element: any): string;
    renderToJson(element: any): any;
    readonly VOID_TAGS: string[];
    readonly AssertionError: typeof AssertionError;
    _parseArray(element: any[]): { tag: any; props: any; children: any[] };
    _escapeForHtml(unsafeStr: string): string;
    _attrsToStr(attrs: any): string;
    _isValidAttr(name: string): boolean;
    _isValidTag(name: string): boolean;
    _isObject(val: any): boolean;
    _assert(expr: boolean, msg?: string): void;
    _makeAssert(predicate: (value: any) => boolean, msg?: string): (value: any) => any;
  }

  const jshtml: JSHTML;
  export default jshtml;
}
