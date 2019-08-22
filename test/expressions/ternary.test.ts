import { compileExpression, createScope, TernaryExpression } from "../../src";
import { $get, $literal, $set, $ternary, $trans } from "../helpers/expressions";

describe("ternary expression", () => {

  test("should compile ternary expression", () => {

    const expression: TernaryExpression = $ternary(
      $get("cond"),
      $literal("yes"),
      $literal("no"),
    );
    const resolve = compileExpression(expression);

    const negate = compileExpression(
      $set(
        "cond",
        $trans(
          "!",
          $get("cond"),
        ),
      ),
    );

    const scope = createScope(null, {
      cond: false,
    });

    const shouldBeNo = resolve(scope);

    expect(shouldBeNo).toBe("no");

    negate(scope);
    const shouldBeYes = resolve(scope);

    expect(shouldBeYes).toBe("yes");

  });

});
