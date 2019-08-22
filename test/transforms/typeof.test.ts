import { compileExpression, TransformExpression } from "../../src";
import { $literal, $trans } from "../helpers/expressions";

describe("typeof transform expression", () => {

  test("should compile typeof transform expression", () => {

    const expression: TransformExpression = $trans(
      "typeof",
      $literal(10),
    );
    const resolve = compileExpression(expression);

    expect(resolve(null as any)).toBe("number");

  });

});
