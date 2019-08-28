import { compileExp, LiteralExpression } from "../../src";
import { $literal } from "../helpers/expressions";
import { rand } from "../helpers/number";

describe("literal expression", () => {

  test("should throw on invalid literal expression", () => {

    const invalid = { type: "literal" };

    expect(() => compileExp(invalid as any, {})).toThrow();

  });

  test("should compile literal expression", () => {

    const value = rand(1, 20);
    const expression: LiteralExpression = $literal(value);
    const resolve: () => number = compileExp(expression, {}) as any;

    const result = resolve();

    expect(result).toBe(value);

  });

  test("should cache literal expression is value is native", () => {

    const expression1: LiteralExpression = $literal("value");
    const expression2: LiteralExpression = $literal("value");

    const cache = {};

    expect(
      compileExp(expression1, cache) === compileExp(expression2, cache),
    ).toBe(true);

  });

});
