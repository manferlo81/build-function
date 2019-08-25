import { compileExpression, createEnv, TransformExpression } from "../../src";
import { $get, $trans } from "../helpers/expressions";

describe("bitwise not transform expression", () => {

  test("should compile bitwise not transform expression", () => {

    const expression: TransformExpression = $trans(
      "~",
      $get("value"),
    );
    const resolve = compileExpression(expression);

    const value = 100;

    const env = createEnv(null, {
      value,
    });

    // tslint:disable-next-line: no-bitwise
    expect(resolve(env)).toBe(~value);

  });

});
