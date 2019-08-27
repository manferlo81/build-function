import { compileExp, createScope, TernaryExpression } from "../../src";
import { $get, $literal, $set, $ternary, $trans } from "../helpers/expressions";

describe("ternary expression", () => {

  test("should throw on invalid ternary expression", () => {

    const base = { type: "ternary" };
    const invalid = [
      base,
      { ...base, condition: $literal(0) },
      { ...base, then: $literal(0) },
      { ...base, otherwise: $literal(0) },
      { ...base, condition: $literal(0), then: $literal(0) },
      { ...base, condition: $literal(0), otherwise: $literal(0) },
    ];

    invalid.forEach((expression) => {

      expect(() => compileExp(expression as any, {})).toThrow();

    });

  });

  test("should compile ternary expression", () => {

    const expression: TernaryExpression = $ternary(
      $get("cond"),
      $literal("yes"),
      $literal("no"),
    );
    const resolve = compileExp(expression, {});

    const negate = compileExp(
      $set(
        "cond",
        $trans(
          "!",
          $get("cond"),
        ),
      ),
      {},
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
