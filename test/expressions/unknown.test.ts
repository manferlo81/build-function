import { compileExpression } from "../../src";

describe("unknown expression", () => {

  test("should throw on unknown expression", () => {

    const expression: any = {
      type: "unknown",
    };

    expect(() => compileExpression(expression)).toThrow();

  });

});
