// Public entry point. It lazily imports the printer build selected by the caller's options.
//
// The printer is built 4 times from `print/`, over 2 build-time feature flags.
//
// 1. Source map support - costs a little speed even when it's unused.
// 2. TypeScript support - costs JS-only ASTs a swathe of field checks and switch arms.
//
// The most important effect of separate JS and TS builds is not the reduced logic when printing a JS AST,
// but that they receive differently-shaped AST node objects. If both JS-shape and TS-shape ASTs
// pass through the same functions, every function becomes polymorphic, which is a large slow-down.
// Having specialized code paths for JS and TS-shape ASTs avoids this problem - most functions remain monomorphic.
//
// Each combination is its own build, lazy-loaded depending on the `sourcemap` and `ts` options.
// Explicit dynamic imports keep the entry point usable in both Node.js and browsers, and let bundlers
// emit one code-split chunk per printer.

import { State } from "./state.ts";

import type { CodegenResult, Options } from "./print/options.ts";
import type * as ESTree from "@oxc-project/types";

export type { CodegenResult, Options, SourceMap } from "./print/options.ts";

/**
 * All printer builds are compiled from `print/index.ts`, so they share its exports.
 */
type PrintModule = typeof import("./print/index.ts");
type PrinterLoader = () => Promise<PrintModule>;

/**
 * Passed on when the caller supplies no options, so the printer never has to check for their absence.
 */
const EMPTY_OPTIONS: Options = {};

/**
 * Printer builds, indexed by `(ts ? 1 : 0) + (sourcemap ? 2 : 0)`.
 *
 * Keeping the imports explicit lets native ESM and browser bundlers load only the selected build.
 */
const PRINTER_LOADERS: readonly PrinterLoader[] = [
  // @ts-expect-error Generated sibling module.
  () => import("./print_js.js") as Promise<PrintModule>,
  // @ts-expect-error Generated sibling module.
  () => import("./print_ts.js") as Promise<PrintModule>,
  // @ts-expect-error Generated sibling module.
  () => import("./print_js_maps.js") as Promise<PrintModule>,
  // @ts-expect-error Generated sibling module.
  () => import("./print_ts_maps.js") as Promise<PrintModule>,
];

/** Loaded printer modules, cached by their `(ts, sourcemap)` combination. */
const printers: Array<Promise<PrintModule> | undefined> = [];

function printerIndex(options: Options): number {
  let index = 0;
  if (options.ts === true) index = 1;
  if (options.sourcemap === true) {
    if (typeof options.sourceText !== "string") {
      throw new TypeError("`sourceText` must be a string when `sourcemap` is true");
    }
    if (options.sourceFilename !== undefined && typeof options.sourceFilename !== "string") {
      throw new TypeError("`sourceFilename` must be a string when supplied");
    }
    index |= 2;
  }
  return index;
}

/**
 * Print `node`, returning a promise for the generated code and optional source map.
 *
 * The first call for a `(ts, sourcemap)` combination asynchronously loads the corresponding
 * printer module. Later calls reuse the cached module, while the printing operation itself remains
 * synchronous inside the loaded build.
 *
 * @param node - AST node to print, a `Program` or a single statement
 * @param options - Printing options (optional)
 * @returns Promise for the object holding the generated code
 */
export async function print(
  node: ESTree.Program | ESTree.Statement,
  options?: Options,
): Promise<CodegenResult> {
  // Printing starts after the selected module has loaded. Snapshot caller-supplied options so a
  // mutation while that promise is pending cannot make module selection and execution disagree.
  const effectiveOptions = options == null ? EMPTY_OPTIONS : { ...options };
  const index = printerIndex(effectiveOptions);

  let printer = printers[index];
  if (printer === undefined) {
    printer = PRINTER_LOADERS[index]();
    printers[index] = printer;
  }

  const { printSync } = await printer;

  // State is created here, not in the printer, so that all 4 builds share one class
  // and therefore see one object shape.
  return printSync(node, new State(effectiveOptions), effectiveOptions);
}
