import { compileExp, OperationExpression } from "../../src";
import { $literal, $oper } from "../helpers/expressions";
import { rand } from "../helpers/number";

describe("greater than operation expression", () => {

  test("should compile greater than operation expression with 2 operands", () => {

    const a = rand(0, 2);
    const b = rand(0, 2);

    const expression: OperationExpression = $oper(
      ">",
      $literal(a),
      $literal(b),
    );
    const resolve = compileExp(expression, {});

    expect(resolve(null as any)).toBe(a > b);

  });

  test("should compile greater than operation expression with multiple operands", () => {

    const a = rand(0, 2);
    const b = rand(0, 2);
    const c = 0;

    const expression: OperationExpression = $oper(
      ">",
      $literal(a),
      $literal(b),
      $literal(c),
    );
    const resolve = compileExp(expression, {});

    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    expect(resolve(null as any)).toBe(a > b > c);

  });

});