# Template Contributor Notes

This repository is a standalone TypeScript library template. It is independent of any host application, framework, editor, or product. The toolchain and the conventions are the deliverable; the sample library is a single placeholder module so that nothing incidental gets copied with it.

- Keep `src/index.ts` the only source file until a real capability needs its own module.
- Keep the toolchain of record identical across copies: `.oxlintrc.json`, `.oxfmtrc.json`, `tsconfig.json`, `pnpm-workspace.yaml`, `vitest.config.ts`, and `.github/workflows/`.
- Fix code instead of relaxing rules, and avoid `oxlint-disable` directives because warnings are denied.
- Add one tsdown entry and one `exports` entry per published module, and keep `main` and `types` pointing at the primary entry.
- Represent optional state with `undefined`; do not introduce `null` sentinels.
- Do not add `link:`, `file:`, workspace, or parent-directory paths. Every dependency resolves from the registry, and every documented path is repository-relative.
- Update `README.md`, `README.zh.md`, the affected JSDoc, and the tests in the same change as any behaviour change.
- Run `pnpm run fmt:check`, `pnpm run lint`, `pnpm test`, and `pnpm run build` before publishing changes.
