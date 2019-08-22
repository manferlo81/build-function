import { compileExpression, OperationExpression } from "../../src";
import { $literal, $oper } from "../helpers/expressions";
import { rand } from "../helpers/number";

describe("less than operation expression", () => {

  test("should compile less than operation expression with 2 operands", () => {

    const a = rand(0, 2);
    const b = rand(0, 2);

    const expression: OperationExpression = $oper(
      "<",
      $literal(a),
      $literal(b),
    );
    const resolve = compileExpression(expression);

    expect(resolve(null as any)).toBe(a < b);

  });

  test("should compile less than operation expression with multiple operands", () => {

    const a = rand(0, 2);
    const b = rand(0, 2);
    const c = 1;

    const expression: OperationExpression = $oper(
      "<",
      $literal(a),
      $literal(b),
      $literal(c),
    );
    const resolve = compileExpression(expression);

    // @ts-ignore
    expect(resolve(null as any)).toBe(a < b < c);

  });

});
