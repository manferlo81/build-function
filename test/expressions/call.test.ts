import { compileExp, createEnv, FunctionCallExpression } from "../../src";
import { $call, $get, $literal } from "../helpers/expressions";

describe("call expression", () => {

  test("should throw on invalid call expression", () => {

    const invalid = { type: "call" };

    expect(() => compileExp(invalid as any)).toThrow();

  });

  test("should compile function call expression", () => {

    const expression: FunctionCallExpression = $call(
      $get("func"),
    );
    const resolve = compileExp(expression);

    const returnValue = "ok";
    const func = jest.fn(() => returnValue);

    const env = createEnv(null, {
      func,
    });

    const result = resolve(env);

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
    const resolve = compileExp(expression);

    const func = jest.fn((x, y, z) => (x + y + z));

    const env = createEnv(null, {
      func,
    });

    const result = resolve(env);

    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenCalledWith(a, b, c);
    expect(result).toBe(a + b + c);

  });

  test("should call function with no arguments", () => {

    const expression: FunctionCallExpression = $call(
      $get("func"),
    );
    const resolve = compileExp(expression);

    const func = jest.fn((...args: any[]) => {
      return true;
    });

    const env = createEnv(null, {
      func,
    });

    const result = resolve(env);

    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenCalledWith();
    expect(result).toBe(true);

  });

});
