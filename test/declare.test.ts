import { createEnv, DeclareWithValue, findInEnv } from "../src";
import { compileDecl } from "../src/compile";
import { $literal } from "./helpers/expressions";

describe("variable declaration", () => {

  test("should compile declaration", () => {

    const declare = "id";
    const resolve = compileDecl(declare, {});

    const scope = createEnv(null);
    resolve(scope);

    expect(findInEnv(scope, declare)).toBeTruthy();

  });

  test("should cache variable declaration", () => {

    const declare1: DeclareWithValue = { id: "value", value: $literal(true) };
    const declare2: DeclareWithValue = { id: "value", value: $literal(true) };

    const cache = {};
    const same = compileDecl(declare1, cache) === compileDecl(declare2, cache);

    expect(same).toBe(true);

  });

});