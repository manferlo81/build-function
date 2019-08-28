import { compileExp, TransformExpression } from "../../src";
import { $get, $literal, $trans } from "../helpers/expressions";

describe("transform expression", () => {

  test("should throw on invalid transform expression", () => {

    const base = { type: "trans" };
    const invalid = [
      base,
      { ...base, oper: "!" },
      { ...base, exp: $literal(0) },
    ];

    invalid.forEach((expression) => {

      expect(() => compileExp(expression as any, {})).toThrow();

    });

  });

  test("should cache transform expression", () => {

    const expression1: TransformExpression = $trans(
      "!",
      $get("a"),
    );
    const expression2: TransformExpression = $trans(
      "!",
      $get("a"),
    );

    const cache = {};
    const same = compileExp(expression1, cache) === compileExp(expression2, cache);

    expect(same).toBe(true);
  });

});
