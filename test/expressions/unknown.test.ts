import { compileExpression } from "../../src";

describe("unknown expression", () => {

  test("should throw on unknown expression", () => {

    expect(() => compileExpression(undefined as any)).toThrow();
    expect(() => compileExpression(null as any)).toThrow();

  });

  test("should throw on unknown expression type", () => {

    const expression: any = {
      type: "unknown",
    };

    expect(() => compileExpression(expression)).toThrow();

  });

});
