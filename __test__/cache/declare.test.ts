import { VariableDeclaration } from "../../src";
import { compileDecl } from "../../src/compile";
import { $literal } from "../helpers/expressions";

describe("compile variable declaration with cache", () => {

  test("should cache single variable declaration", () => {

    const declare1: VariableDeclaration = { id: "value", value: $literal(true) };
    const declare2: VariableDeclaration = { id: "value", value: $literal(true) };

    const cache = {};
    const same = compileDecl(declare1, cache) === compileDecl(declare2, cache);

    expect(same).toBe(true);

  });

  test("should cache variable declaration with different format", () => {

    const declare1: VariableDeclaration = "value";
    const declare2: VariableDeclaration = { id: "value" };
    const declare3: VariableDeclaration = { id: "value", value: undefined };

    const cache = {};

    const first = compileDecl(declare1, cache);

    expect(compileDecl(declare2, cache)).toBe(first);
    expect(compileDecl(declare3, cache)).toBe(first);

  });

  test("should cache single variable declaration from 1 item array", () => {

    const declare1: VariableDeclaration = { id: "value", value: $literal(true) };
    const declare2: [VariableDeclaration] = [{ id: "value", value: $literal(true) }];

    const cache = {};
    const same = compileDecl(declare1, cache) === compileDecl(declare2, cache);

    expect(same).toBe(true);

  });

  test("should cache multiple variable declarations", () => {

    const declare1: VariableDeclaration[] = [
      "a",
      { id: "b" },
      { id: "c", value: $literal(true) },
    ];
    const declare2: VariableDeclaration[] = [
      "a",
      { id: "b" },
      { id: "c", value: $literal(true) },
    ];

    const cache = {};
    const same = compileDecl(declare1, cache) === compileDecl(declare2, cache);

    expect(same).toBe(true);

  });

});
