import { compileExpression, OperationExpression } from "../../src";
import { $get, $oper } from "../helpers/expressions";

describe("operation expression", () => {

  test("should throw if less than 2 operands", () => {

    // @ts-ignore
    const expression: OperationExpression = $oper(
      "+",
      $get("a"),
    );

    expect(() => compileExpression(expression)).toThrow();

  });

});
