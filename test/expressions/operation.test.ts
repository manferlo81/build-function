import { compileExp, OperationExpression } from "../../src";
import { $get, $literal, $oper } from "../helpers/expressions";

describe("operation expression", () => {

  test("should throw on invalid operation expression", () => {

    const base = { type: "oper" };
    const invalid = [
      base,
      { ...base, oper: "+" },
      { ...base, exp: [$literal(0), $literal(0)] },
    ];

    invalid.forEach((expression) => {

      expect(() => compileExp(expression as any, {})).toThrow();

    });

  });

  test("should throw if less than 2 operands", () => {

    // @ts-ignore
    const expression: OperationExpression = $oper(
      "+",
      $get("a"),
    );

    expect(() => compileExp(expression, {})).toThrow();

  });

  test("should cache operation expression", () => {

    const expression1: OperationExpression = $oper(
      "+",
      $get("a"),
      $literal(1),
    );
    const expression2: OperationExpression = $oper(
      "+",
      $get("a"),
      $literal(1),
    );

    const cache = {};

    expect(
      compileExp(expression1, cache) === compileExp(expression2, cache),
    ).toBe(true);

  });

});
