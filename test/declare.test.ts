import { createEnv, findInEnv } from "../src";
import { compileDecl } from "../src/compile";

describe("variable declaration", () => {

  test("should return null if empty array", () => {

    expect(compileDecl([], {})).toBeNull();

  });

  test("should compile declaration", () => {

    const declare = "id";
    const resolve = compileDecl(declare, {});

    const scope = createEnv(null);

    if (resolve) {
      resolve(scope);
    }

    expect(findInEnv(scope, declare)).toBeTruthy();

  });

});
