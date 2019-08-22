import { compileExpression, OperationExpression } from "../../src";
import { $get, $oper } from "../helpers/expressions";

describe("unknown operation expression", () => {

  test("should compile unknown operation expression", () => {

    const expression: OperationExpression = $oper(
      // @ts-ignore
      "?",
      $get("a"),
      $get("b"),
    );

    expect(() => compileExpression(expression)).toThrow();

  });

});
