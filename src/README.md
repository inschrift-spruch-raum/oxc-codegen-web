# Source Layout

> Template-only guidance. Replace it once the library has real modules.

The template ships one module, `src/index.ts`, so the placeholder stays obvious.
Grow it deliberately:

- add `src/<feature>.ts`, or `src/<feature>/` once a capability needs several
  files, and import between modules with explicit `./name.ts` extensions;
- keep the public surface in `src/index.ts`: with more than one module it should
  be a pure re-export barrel, with no logic, no side effects, and no default
  export;
- put consumer-facing options in `src/config.ts` instead of hiding deployment
  choices in implementation constants;
- keep process, clock, transport, and storage access behind a small interface so
  a test can replace it instead of mocking globals;
- raise failures through a small `Error` subclass so callers can catch them
  precisely;
- represent optional state with `undefined`, and never introduce `null`
  sentinels.
