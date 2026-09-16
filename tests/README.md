# Test Layout

`tests/index.test.ts` is the sample suite. Source modules are imported through
the package-local `#src/<name>` mapping, so tests exercise the same specifiers
the library publishes.

Conventions:

- declare every test as a named function above the `describe` block;
- start each test with `expect.hasAssertions()` and pass
  `{ timeout: TEST_TIMEOUT }` to `it`, so a hung test always fails a CI run;
- keep one behaviour per test and at most five assertion calls per test;
- add `tests/<feature>.test.ts` as the library grows, and share setup through a
  small `tests/harness.ts` when several suites need the same composition;
- add fixtures under `tests/snapshots/` for stable, product-visible expected
  output.

The baseline has no fixtures and therefore defines no refresh command. When
snapshots are introduced, document the repository-local refresh command here
with deterministic inputs, exact fixture ownership, and semantic review.
Type-aware static checking is provided by the repository's Oxlint command.
