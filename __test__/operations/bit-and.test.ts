import { compileExp, OperationExpression } from "../../src";
import { $literal, $oper } from "../helpers/expressions";
import { rand } from "../helpers/number";

describe("bitwise and operation expression", () => {

  test("should compile bitwise and operation expression with 2 operands", () => {

    const a = rand(1, 20, true);
    const b = rand(1, 20, true);

    const expression: OperationExpression = $oper(
      "&",
      $literal(a),
      $literal(b),
    );
    const resolve = compileExp(expression, {});

    // tslint:disable-next-line: no-bitwise
    expect(resolve(null as any)).toBe(a & b);

  });

  test("should compile bitwise and operation expression with multiple operands", () => {

    const a = rand(1, 20, true);
    const b = rand(1, 20, true);
    const c = rand(1, 20, true);
    const d = rand(1, 20, true);

    const expression: OperationExpression = $oper(
      "&",
      $literal(a),
      $literal(b),
      $literal(c),
      $literal(d),
    );
    const resolve = compileExp(expression, {});

    // tslint:disable-next-line: no-bitwise
    expect(resolve(null as any)).toBe(a & b & c & d);

  });

});
