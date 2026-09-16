# template

English | [中文](README.zh.md)

A self-contained TypeScript library template with a pinned toolchain. Everything the repository needs — compiler settings, static-analysis configuration, test runner, build pipeline, CI workflows, and contributor rules — lives inside this directory, and every development input resolves from this repository root.

The toolchain and the conventions are the deliverable. The sample library is one placeholder module, so nothing incidental gets copied along with it.

## Repository layout

```text
.
├── .github/workflows/
│   ├── ci.yml                    # Install, lint, test, and build on every change
│   └── release.yml               # Build and publish the packed tarball to a GitHub Release
├── src/
│   ├── README.md                 # Growth rules for source modules
│   └── index.ts                  # The whole sample library: GREETING and greet()
├── tests/
│   ├── README.md                 # Test and snapshot conventions
│   ├── index.test.ts             # Sample suite for the placeholder module
│   └── snapshots/
│       └── README.md             # Optional product-visible fixture contract
├── .gitignore                    # Generated artifact exclusions
├── .oxfmtrc.json                 # Formatter configuration
├── .oxlintrc.json                # Type-aware Oxlint configuration
├── AGENTS.md                     # Repository-local contributor rules
├── LICENSE                       # Template license
├── README.md                     # Repository and usage contract
├── package.json                  # Exports, scripts, pinned dev toolchain
├── pnpm-lock.yaml                # Reproducible registry dependency graph
├── pnpm-workspace.yaml           # Package-manager policy
├── tsconfig.json                 # Compiler and type-aware lint project
├── tsdown.config.ts              # Direct source-to-runtime/declaration build
└── vitest.config.ts              # Test runner configuration
```

## Quick start

Run every command from this directory:

```sh
pnpm install
pnpm run fmt:check
pnpm run lint
pnpm test
pnpm run build
```

`lint` runs Oxlint with type-aware analysis and denies warnings for `src` and `tests`. `build` compiles `src/` into ready-to-pack ESM JavaScript and declarations under `lib/`; it does not run an install-time lifecycle build. Extra arguments pass through to tsdown, so `pnpm run build --sourcemap` emits source maps for local debugging while the default build emits none.

## The sample module

`src/index.ts` exports one constant and one function:

```ts
import { GREETING, greet } from 'template'

greet()   // 'hello world'
GREETING  // 'hello world'
```

Replace it with the library you actually want. Delete the placeholder when the first real module lands.

## How to grow

- one module per capability: `src/<feature>.ts`, or `src/<feature>/` once a capability needs several files;
- with more than one module, reduce `src/index.ts` to a pure re-export barrel — no logic, no side effects, no default export;
- consumer-facing options get their own `src/config.ts` owner instead of living as implementation constants;
- process, clock, transport, and storage access belong behind a small interface, so a test replaces it instead of mocking globals;
- failures get a small `Error` subclass so callers can catch them precisely;
- optional state is `undefined`; the library never uses `null` as a sentinel;
- every published module needs one tsdown entry and one `exports` entry in `package.json`.

## Create your library

1. Rename the package in `package.json` and update `description` and `keywords`.
2. Replace `src/index.ts` and the sample suite in `tests/index.test.ts`.
3. Keep the `exports` map, the `main` and `types` fields, and the tsdown entry map in step with the modules you publish.
4. Update `README.md`, `README.zh.md`, `AGENTS.md`, and `LICENSE`.
5. Set `private` to `false` only when the published dependencies and artifacts are ready.

Keep the toolchain files as they are. `.oxlintrc.json` is the contract: fix code instead of relaxing rules, and prefer editing over adding an `oxlint-disable` directive, because warnings are denied.

## CI

Two GitHub Actions workflows ship with the template:

- `.github/workflows/ci.yml` — every push to `main` and every pull request: install with the frozen lockfile, Oxlint, tests, and build.
- `.github/workflows/release.yml` — every push to `main`: the same checks, then `pnpm pack` into `dist/pkg.tgz` and publish that tarball to the GitHub Release tagged `v<version>` from `package.json`. Bump the version to cut a new release; re-pushing the same version refreshes that release's artifact.

Both workflows read the pnpm version from `packageManager` in `package.json`, so keep that field in sync with the toolchain you actually use.

## Distribution checks

Before publishing, build and inspect the final archive:

```sh
pnpm run lint
pnpm test
pnpm run build
pnpm pack --dry-run --json
```

The packed archive must contain every runtime and declaration file named by `main`, `types`, `exports`, and `files`. Consumers install the ready-made `lib/` output; no `prepare` script runs on install.

## Testing guidance

The sample suite in `tests/index.test.ts` shows the conventions: named test functions, `expect.hasAssertions()` first, an explicit timeout, and source imports through `#src/<name>`. Add `tests/<feature>.test.ts` as the library grows, and introduce `tests/harness.ts` only when several suites need the same composed setup. Stable, product-visible expected output belongs under `tests/snapshots/`.
