import { compileExpression, OperationExpression } from "../../src";
import { $get, $trans } from "../helpers/expressions";

describe("unknown transform expression", () => {

  test("should throw if less than 2 operands", () => {

    const expression: OperationExpression = $trans(
      // @ts-ignore
      "?",
      $get("a"),
    );

    expect(() => compileExpression(expression)).toThrow();

  });

});
