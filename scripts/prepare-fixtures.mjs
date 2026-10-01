#!/usr/bin/env node

// Prepare the external fixture repositories used by the upstream conformance tests.
// These are Git repositories rather than npm packages, so they are kept outside the package
// contents and checked out at the same revisions as the Oxc monorepo.

import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

const FIXTURE_REPOSITORIES = [
  {
    name: "Test262",
    repository: "tc39/test262",
    path: "tasks/coverage/test262",
    revision: "0a888ef3715cf6c8a8c34b843173e675c6f708f6",
    paths: ["test"],
  },
  {
    name: "TypeScript",
    repository: "microsoft/TypeScript",
    path: "tasks/coverage/typescript",
    revision: "f29aeb9f825d96feea27841f3f7342dbf0df68a8",
    paths: ["tsc/testdata/tests/cases/compiler", "tsc/testdata/tests/cases/conformance"],
  },
  {
    name: "ESTree conformance",
    repository: "oxc-project/estree-conformance",
    path: "tasks/coverage/estree-conformance",
    revision: "1e8b22159790c3e83817a019dbc1e8e289406028",
    paths: ["tests/acorn-jsx/pass"],
  },
];

const WORKSPACE_ROOT = join(import.meta.dirname, "..");

function runGit(args, cwd) {
  const result = spawnSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (result.status !== 0) {
    const details = result.stderr.trim();
    throw new Error(`git ${args.join(" ")} failed${details ? `: ${details}` : ""}`);
  }

  return result.stdout.trim();
}

function ensureRemote(directory, repositoryUrl) {
  try {
    runGit(["remote", "set-url", "origin", repositoryUrl], directory);
  } catch {
    runGit(["remote", "add", "origin", repositoryUrl], directory);
  }
}

function prepareRepository({ name, repository, path, revision, paths }) {
  const directory = join(WORKSPACE_ROOT, path);
  const gitDirectory = join(directory, ".git");
  const repositoryUrl = `https://github.com/${repository}.git`;

  mkdirSync(dirname(directory), { recursive: true });
  mkdirSync(directory, { recursive: true });

  if (!existsSync(gitDirectory)) {
    runGit(["init", "--quiet"], directory);
  }
  ensureRemote(directory, repositoryUrl);

  let currentRevision;
  try {
    currentRevision = runGit(["rev-parse", "HEAD"], directory);
  } catch {
    currentRevision = undefined;
  }

  if (currentRevision !== revision) {
    console.log(`Fetching ${name} fixture revision ${revision}...`);
    runGit(["fetch", "--quiet", "--depth", "1", "origin", revision], directory);
  }

  // Always restore the pinned checkout before applying sparse-checkout. This keeps a local edit
  // or an untracked fixture from changing the test set on a later run.
  runGit(["reset", "--hard", revision], directory);
  runGit(["clean", "-f", "-d", "-x", "-q"], directory);
  runGit(["sparse-checkout", "init", "--no-cone"], directory);
  runGit(["sparse-checkout", "set", "--no-cone", ...paths], directory);
  console.log(`${name} fixtures are ready.`);
}

for (const repository of FIXTURE_REPOSITORIES) {
  prepareRepository(repository);
}

console.log("All upstream codegen fixtures are ready.");
