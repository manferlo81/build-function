import { compileExpression, LiteralExpression } from "../../src";
import { $literal } from "../helpers/expressions";
import { rand } from "../helpers/number";

describe("literal expression", () => {

  test("should throw on invalid literal expression", () => {

    const invalid = { type: "literal" };

    expect(() => compileExpression(invalid as any)).toThrow();

  });

  test("should compile literal expression", () => {

    const value = rand(1, 20);
    const expression: LiteralExpression = $literal(value);
    const resolve: () => number = compileExpression(expression) as any;

    const result = resolve();

    expect(result).toBe(value);

  });

});
