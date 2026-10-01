# oxc-codegen-web

[English](README.md) | 中文

面向 JavaScript、TypeScript、JSX 和 TSX AST 的快速同步代码生成器。

`oxc-codegen-web` 接收符合 ESTree 或 TS-ESTree 的 AST，输出格式化后的源代码，并可选生成标准 Source Map v3。

## 安装

```sh
pnpm add oxc-codegen-web
```

`oxc-codegen-web` 是仅支持 ESM 的包，要求 Node.js `^20.19.0` 或 `>=22.12.0`。

## 快速开始

配合 [`oxc-parser`](https://www.npmjs.com/package/oxc-parser) 解析并打印源代码：

```js
import { parseSync } from "oxc-parser";
import { printSync } from "oxc-codegen-web";

const { program } = parseSync("input.js", "const answer=6*7");
const { code } = printSync(program);

console.log(code);
// const answer = 6 * 7;
```

生成 Source Map 时传入原始文件名和源文本：

```js
const sourceText = "const answer=6*7";
const { program } = parseSync("input.js", sourceText);
const result = printSync(program, {
  sourcemap: true,
  sourceFilename: "input.js",
  sourceText,
});

console.log(result.code);
console.log(result.map);
```

## 开发

在仓库根目录运行：

```sh
pnpm install
pnpm test
pnpm run build
```

`pnpm test` 只构建并运行仓库内测试。运行 `pnpm run test:conformance` 会按上游固定 revision 准备 Test262、TypeScript 和 ESTree JSX fixture，再运行对照测试；所有对照输出都来自同版本官方发布的 `oxc-codegen` 包。fixture 保存在被 Git 忽略的 `tasks/coverage/` 目录中，首次准备需要 Git 和网络访问。

`pnpm run build` 会生成 `dist/` 下的运行时和声明文件。

## 设计

大多数 Oxc 包使用原生绑定。本包直接在 JavaScript 中处理已经存在的 AST，避免跨越 JS/native 边界序列化整个对象图，并为 JavaScript 与 TypeScript 工作负载构建专用的打印器。

更多实现说明见 [DESIGN.md](DESIGN.md)。
