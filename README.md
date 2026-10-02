# oxc-codegen-web

Fast asynchronous code generation for JavaScript and TypeScript ASTs.

`oxc-codegen-web` turns an [ESTree](https://github.com/estree/estree) or
[TS-ESTree](https://typescript-eslint.io/packages/typescript-estree/) AST into formatted source
code. It supports JavaScript, JSX, TypeScript, and TSX.

The printer is a port of Oxc's Rust `oxc_codegen` crate. With the default options, both printers
produce byte-identical output: tab indentation, double-quoted strings, and no comments.

## Installation

```sh
npm install oxc-codegen-web
```

`oxc-codegen-web` is ESM-only and supports Node.js `^20.19.0` or `>=22.12.0`. The same package entry works in browser bundlers because printer builds are loaded with standard dynamic `import()`.

## Quick start

Pair it with [`oxc-parser`](https://www.npmjs.com/package/oxc-parser) to parse and print source code:

```js
import { print } from "oxc-codegen-web";
import { parseSync } from "oxc-parser";

const { program } = parseSync("input.js", "const answer=6*7");
const { code } = await print(program);

console.log(code);
// const answer = 6 * 7;
```

The first call loads only the selected JavaScript or TypeScript printer, with or without source maps.
Later calls reuse that module through the runtime's module cache.

You can also print a manually constructed AST:

```js
const program = {
  type: "Program",
  sourceType: "script",
  body: [
    {
      type: "ExpressionStatement",
      expression: {
        type: "CallExpression",
        callee: {
          type: "MemberExpression",
          object: { type: "Identifier", name: "console" },
          property: { type: "Identifier", name: "log" },
          computed: false,
          optional: false,
        },
        arguments: [{ type: "Literal", value: "Hello!" }],
        optional: false,
      },
    },
  ],
};

console.log((await print(program)).code);
// console.log("Hello!");
```

### TypeScript and TSX

Set `ts` when the AST can contain TypeScript nodes. For TSX, set both `ts` and `jsx`:

```js
const { program } = parseSync("component.tsx", "const Box = <T,>(value: T) => <div>{value}</div>");

const { code } = await print(program, {
  ts: true,
  jsx: true,
});
```

## API

### `print(node, options?)`

```ts
function print(
  node: ESTree.Program | ESTree.Statement,
  options?: Options,
): Promise<{
  code: string;
  map: SourceMap | null;
}>;
```

Prints a complete `Program` or a single statement and returns a promise for the generated source code,
and (when requested) a standard Source Map v3 object.

```js
import { print } from "oxc-codegen-web";
import { parseSync } from "oxc-parser";

const sourceText = "const answer=6*7";
const { program } = parseSync("input.js", sourceText);
const { code, map } = await print(program, {
  sourcemap: true,
  sourceFilename: "input.js",
  sourceText,
});
```

Source-map mappings require `sourceText` and nodes with valid Oxc `start` / `end` offsets.
A manually constructed AST without offsets can still be printed, but its source map has
an empty `mappings` string.

### Options

| Option                | Type      | Default | Description                                                      |
| :-------------------- | :-------- | :------ | :--------------------------------------------------------------- |
| `indent`              | `string`  | `"\t"`  | Non-empty string of spaces and/or tabs used for one indent level |
| `startingIndentLevel` | `number`  | `0`     | Starting indent level, from `0` to `1000`                        |
| `jsx`                 | `boolean` | `false` | Enable TSX-safe printing for ambiguous TypeScript syntax         |
| `ts`                  | `boolean` | `false` | Select the printer that supports TypeScript nodes                |
| `sourcemap`           | `boolean` | `false` | Return a Source Map v3 object in `map`                           |
| `sourceFilename`      | `string`  | `""`    | Original source filename recorded in the source map              |
| `sourceText`          | `string`  | -       | Original text required for source-map mappings and content       |

## Testing

```sh
pnpm install
pnpm test
```

`pnpm test` builds the package and runs the repository-local comparison suite. Run
`pnpm run test:conformance` to prepare the pinned fixture repositories and run the JSX, Test262,
and TypeScript comparison suites against the published `oxc-codegen` package. The fixture
repositories live under the ignored `tasks/coverage/` directory; the conformance command requires
Git and network access when they are not already cached.

## Why pure JavaScript?

Most Oxc packages use native bindings. This package deliberately does not: when an AST already
lives in JavaScript, passing the entire object graph across a JS/native boundary can cost more than
printing it in place. `oxc-codegen-web` avoids that serialization and uses specialized printer builds
for JavaScript and TypeScript workloads.

See [DESIGN.md](https://github.com/oxc-project/oxc/blob/main/packages/codegen/DESIGN.md) for the
implementation details and performance constraints.

## Current limitations

- Comments are not printed.
- Minified output is not supported.

## Benchmarks

Representative time per `print` call:

| Fixture                      |     Bytes |       Time |
| :--------------------------- | --------: | ---------: |
| `tiny.js`                    |        26 |  0.0001 ms |
| `RadixUIAdoptionSection.jsx` |     2,518 |  0.0070 ms |
| `react.development.js`       |    72,141 |  0.1518 ms |
| `binder.ts`                  |   193,077 |  0.3364 ms |
| `App.tsx`                    |   415,340 |  1.2912 ms |
| `lodash.js`                  |   544,096 |  0.7977 ms |
| `kitchen-sink.tsx`           |   732,222 |  4.2924 ms |
| `antd.js`                    | 6,683,633 | 16.9652 ms |

These figures come from one machine and are illustrative, not a regression baseline.
Results vary between runs, most noticeably for large fixtures such as `antd.js`.
