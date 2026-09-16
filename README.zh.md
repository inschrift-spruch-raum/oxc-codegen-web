# template

[English](README.md) | 中文

自带完整工具链的 TypeScript 库模板。仓库需要的所有内容——编译器设置、静态分析配置、测试运行器、构建流水线、CI 工作流与贡献规则——都在本目录内,所有开发输入都从本仓库根目录解析。

工具链与约定才是交付物。示例库只有一个占位模块,这样复制模板时不会把多余的实现一起带走。

## 仓库布局

```text
.
├── .github/workflows/
│   ├── ci.yml                    # 每次变更执行安装、lint、测试与构建
│   └── release.yml               # 构建并把打包产物发布到 GitHub Release
├── src/
│   ├── README.md                 # 源码模块的增长规则
│   └── index.ts                  # 全部示例库:GREETING 与 greet()
├── tests/
│   ├── README.md                 # 测试与快照约定
│   ├── index.test.ts             # 占位模块的示例测试
│   └── snapshots/
│       └── README.md             # 可选的产品可见 fixture 契约
├── .gitignore                    # 生成产物排除
├── .oxfmtrc.json                 # 格式化配置
├── .oxlintrc.json                # 类型感知的 Oxlint 配置
├── AGENTS.md                     # 仓库本地贡献规则
├── LICENSE                       # 模板许可证
├── README.md                     # 仓库与使用契约
├── package.json                  # 导出、脚本与锁定版本的开发工具链
├── pnpm-lock.yaml                # 可复现的 registry 依赖图
├── pnpm-workspace.yaml           # 包管理器策略
├── tsconfig.json                 # 编译器与类型感知 lint 工程
├── tsdown.config.ts              # 从源码直接构建运行时与声明
└── vitest.config.ts              # 测试运行器配置
```

## 快速开始

所有命令都在本目录运行:

```sh
pnpm install
pnpm run fmt:check
pnpm run lint
pnpm test
pnpm run build
```

`lint` 对 `src` 与 `tests` 启用类型感知分析并拒绝警告。`build` 把 `src/` 编译为 `lib/` 下可直接打包的 ESM JavaScript 与声明文件,不运行安装期 lifecycle build。额外参数会透传给 tsdown,因此本地调试可用 `pnpm run build --sourcemap` 产出 source map;默认 `build` 不产 map。

## 示例模块

`src/index.ts` 只导出一个常量和一个函数:

```ts
import { GREETING, greet } from 'template'

greet()   // 'hello world'
GREETING  // 'hello world'
```

把它替换成你真正要写的库。第一个真实模块落地时删掉这个占位文件。

## 如何增长

- 一个能力一个模块:`src/<feature>.ts`;一个能力需要多个文件时用 `src/<feature>/`;
- 模块多于一个后,把 `src/index.ts` 收成纯 re-export barrel——不含逻辑、不产生副作用、不加 default export;
- 面向消费者的选项放在独立的 `src/config.ts` 属主里,而不是藏在实现常量中;
- 进程、时钟、传输与存储访问都放在一个小组件接口之后,让测试替换而不是 mock 全局对象;
- 失败通过一个小的 `Error` 子类抛出,让调用方能精确捕获;
- 可选状态用 `undefined` 表示,库内从不使用 `null` 哨兵;
- 每个发布的模块都要在 `package.json` 里有一个 tsdown entry 与一个 `exports` 条目。

## 创建你的库

1. 重命名 `package.json` 中的包,并更新 `description` 与 `keywords`。
2. 替换 `src/index.ts` 与 `tests/index.test.ts` 中的示例测试。
3. 让 `exports` 映射、`main`/`types` 字段与 tsdown entry 映射和实际发布的模块保持一致。
4. 更新 `README.md`、`README.zh.md`、`AGENTS.md` 与 `LICENSE`。
5. 只有当公共依赖与分发产物就绪时,才把 `private` 设为 `false`。

工具链文件保持原样。`.oxlintrc.json` 是契约:修代码而不是放宽规则;优先直接改代码而不是添加 `oxlint-disable`,因为警告会被拒绝。

## CI

模板自带两个 GitHub Actions 工作流:

- `.github/workflows/ci.yml` — 每次推送到 `main` 与每个 pull request:冻结 lockfile 安装、Oxlint、测试与构建。
- `.github/workflows/release.yml` — 每次推送到 `main`:执行同样的检查,然后用 `pnpm pack` 打包到 `dist/pkg.tgz`,并把它发布到以 `package.json` 版本号命名的 GitHub Release(`v<version>`)。提升版本即发布新版本;同版本再次推送会刷新该 Release 的产物。

两个工作流都从 `package.json` 的 `packageManager` 读取 pnpm 版本,因此该字段要和实际使用的工具链保持一致。

## 分发检查

发布前构建并检查最终归档:

```sh
pnpm run lint
pnpm test
pnpm run build
pnpm pack --dry-run --json
```

最终包必须包含 `main`、`types`、`exports` 与 `files` 命名的每个运行时与声明文件。消费者安装现成的 `lib/` 输出;安装时不运行 `prepare` 脚本。

## 测试指引

`tests/index.test.ts` 演示了约定:具名测试函数、首行 `expect.hasAssertions()`、显式 timeout,以及通过 `#src/<name>` 导入源码。库增长时添加 `tests/<feature>.test.ts`;只有多个测试套件需要同一套组装时才引入 `tests/harness.ts`。稳定的产品可见期望输出放在 `tests/snapshots/`。
