import { compileExpression, OperationExpression } from "../../src";
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

      expect(() => compileExpression(expression as any)).toThrow();

    });

  });

  test("should throw if less than 2 operands", () => {

    // @ts-ignore
    const expression: OperationExpression = $oper(
      "+",
      $get("a"),
    );

    expect(() => compileExpression(expression)).toThrow();

  });

});
