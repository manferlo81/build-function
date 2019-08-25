import { compileExp, OperationExpression } from "../../src";
import { $literal, $oper } from "../helpers/expressions";
import { rand } from "../helpers/number";

describe("add operation expression", () => {

  test("should compile add operation expression with 2 operands", () => {

    const a = rand(-10, 10);
    const b = rand(-10, 10);

    const expression: OperationExpression = $oper(
      "+",
      $literal(a),
      $literal(b),
    );
    const resolve = compileExp(expression);

    expect(resolve(null as any)).toBe(a + b);

  });

  test("should compile add operation expression with multiple operands", () => {

    const a = rand(-10, 10);
    const b = rand(-10, 10);
    const c = rand(-10, 10);
    const d = rand(-10, 10);

    const expression: OperationExpression = $oper(
      "+",
      $literal(a),
      $literal(b),
      $literal(c),
      $literal(d),
    );
    const resolve = compileExp(expression);

    expect(resolve(null as any)).toBe(a + b + c + d);

  });

});
