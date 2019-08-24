import { compileExpression, createScope, FunctionCallExpression } from "../../src";
import { $call, $get, $literal } from "../helpers/expressions";

describe("call expression", () => {

  test("should throw on invalid call expression", () => {

    const invalid = { type: "call" };

    expect(() => compileExpression(invalid as any)).toThrow();

  });

  test("should compile function call expression", () => {

    const expression: FunctionCallExpression = $call(
      $get("func"),
    );
    const resolve = compileExpression(expression);

    const returnValue = "ok";
    const func = jest.fn(() => returnValue);

    const scope = createScope(null, {
      func,
    });

    const result = resolve(scope);

    expect(func).toHaveBeenCalledTimes(1);
    expect(result).toBe(returnValue);

  });

  test("should call function with single spreadable argument", () => {

    const a = 1;
    const b = 2;
    const c = 3;

    const expression: FunctionCallExpression = $call(
      $get("func"),
      {
        type: "spread",
        exp: $literal([a, b, c]),
      },
    );
    const resolve = compileExpression(expression);

    const func = jest.fn((x, y, z) => (x + y + z));

    const scope = createScope(null, {
      func,
    });

    const result = resolve(scope);

    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenCalledWith(a, b, c);
    expect(result).toBe(a + b + c);

  });

  test("should call function with no arguments", () => {

    const expression: FunctionCallExpression = $call(
      $get("func"),
    );
    const resolve = compileExpression(expression);

    const func = jest.fn((...args: any[]) => {
      return true;
    });

    const scope = createScope(null, {
      func,
    });

    const result = resolve(scope);

    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenCalledWith();
    expect(result).toBe(true);

  });

});
