import { compileExp, createScope, TransformExpression } from "../../src";
import { $get, $literal, $trans } from "../helpers/expressions";

describe("typeof transform expression", () => {

  test("should compile typeof transform expression", () => {

    const expression: TransformExpression = $trans(
      "typeof",
      $literal(10),
    );
    const resolve = compileExp(expression);

    expect(resolve(null as any)).toBe("number");

  });

  test("should compile typeof transform expression and don't throw if not in scope", () => {

    const expression: TransformExpression = $trans(
      "typeof",
      $get("notinscope"),
    );
    const resolve = compileExp(expression);

    const scope = createScope(null);

    expect(resolve(scope)).toBe(typeof undefined);

  });

});
