import { compileExp, OperationExpression } from "../../src";
import { $literal, $oper } from "../helpers/expressions";
import { rand } from "../helpers/number";

describe("not equal operation expression", () => {

  test("should compile not equal operation expression with 2 operands", () => {

    const a = rand(0, 1, true);
    const b = rand(0, 1, true);

    const expression: OperationExpression = $oper(
      "!==",
      $literal(a),
      $literal(b),
    );
    const resolve = compileExp(expression);

    // tslint:disable-next-line: triple-equals
    expect(resolve(null as any)).toBe(a !== b);

  });

  test("should compile not equal operation expression with multiple operands", () => {

    const a = rand(0, 1, true);
    const b = rand(0, 1, true);
    const c = !rand(0, 1, true);
    const d = !rand(0, 1, true);

    const expression: OperationExpression = $oper(
      "!==",
      $literal(a),
      $literal(b),
      $literal(c),
      $literal(d),
    );
    const resolve = compileExp(expression);

    // tslint:disable-next-line: triple-equals
    expect(resolve(null as any)).toBe(a !== b !== c !== d);

  });

  test("should use non strict equals", () => {

    const expression: OperationExpression = $oper(
      "!==",
      $literal("10"),
      $literal(10),
    );
    const resolve = compileExp(expression);

    expect(resolve(null as any)).toBe(true);

  });

});
