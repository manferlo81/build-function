import { compileExpression } from "../../src";
import { $literal } from "../helpers/expressions";

describe("transform expression", () => {

  test("should throw on invalid transform expression", () => {

    const base = { type: "trans" };
    const invalid = [
      base,
      { ...base, oper: "!" },
      { ...base, exp: $literal(0) },
    ];

    invalid.forEach((expression) => {

      expect(() => compileExpression(expression as any)).toThrow();

    });

  });

});
