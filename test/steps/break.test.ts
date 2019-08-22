import { BreakStatement, compileExpression, compileStep, FunctionExpression } from "../../src";

describe("break statement step", () => {

  test("should compile break statement step", () => {

    const step: BreakStatement = {
      type: "break",
    };
    const resolve: () => "break" = compileStep(step, true) as any;

    const result = resolve();

    expect(result).toEqual("break");

  });

  test('should throw if "break" outside loop', () => {

    const expression: FunctionExpression = {
      type: "func",
      body: {
        type: "break",
      },
    };

    expect(() => compileExpression(expression)).toThrow();

  });

});
