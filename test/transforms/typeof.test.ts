import { compileExpression, createEnv, TransformExpression } from "../../src";
import { $get, $literal, $trans } from "../helpers/expressions";

describe("typeof transform expression", () => {

  test("should compile typeof transform expression", () => {

    const expression: TransformExpression = $trans(
      "typeof",
      $literal(10),
    );
    const resolve = compileExpression(expression);

    expect(resolve(null as any)).toBe("number");

  });

  test("should compile typeof transform expression and don't throw if not in scope", () => {

    const expression: TransformExpression = $trans(
      "typeof",
      $get("notinscope"),
    );
    const resolve = compileExpression(expression);

    const env = createEnv(null);

    expect(resolve(env)).toBe(typeof undefined);

  });

});
