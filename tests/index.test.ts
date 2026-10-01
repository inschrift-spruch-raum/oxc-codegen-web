import { parseSync } from "oxc-parser";
import { describe, expect, it } from "vitest";

import { printSync } from "../dist/index.js";

const PARSE_OPTIONS = {
  preserveParens: false,
  experimentalRawTransfer: true,
};

function parseProgram(sourceText: string) {
  const { program, errors } = parseSync("index.test.js", sourceText, PARSE_OPTIONS);
  if (errors.length > 0) throw new Error(`fixture parse failed: ${errors[0].message}`);
  return program;
}

function testPrintsProgram(): void {
  expect.hasAssertions();
  const program = parseProgram("const value=1;");
  expect(printSync(program).code).toBe("const value = 1;\n");
}

function testPrintsSourceMap(): void {
  expect.hasAssertions();
  const sourceText = "const value=1;";
  const program = parseProgram(sourceText);
  const result = printSync(program, {
    sourcemap: true,
    sourceFilename: "index.test.js",
    sourceText,
  });
  expect(result.code).toBe("const value = 1;\n");
  expect(result.map).toMatchObject({
    version: 3,
    sources: ["index.test.js"],
    sourcesContent: [sourceText],
  });
}

describe("public API", () => {
  it("prints a parsed program", testPrintsProgram);
  it("prints a parsed program with a source map", testPrintsSourceMap);
});
