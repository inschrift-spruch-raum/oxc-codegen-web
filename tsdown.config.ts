import { defineConfig } from 'tsdown'

/**
 * Build the published library entries directly from `src/`. Add one entry per
 * published module and mirror it in the `exports` map of `package.json`;
 * TypeScript performs the separate no-emit checks, while tsdown owns runtime
 * and declaration output.
 */
export default defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  outDir: 'lib',
  format: ['esm'],
  platform: 'node',
  target: 'es2024',
  fixedExtension: false,
  dts: true,
  clean: true,
  deps: { dts: { neverBundle: true } },
  tsconfig: 'tsconfig.json',
})
