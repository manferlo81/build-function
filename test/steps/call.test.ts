import { compileStep, createScope, FunctionCallExpression } from "../../src";
import { $call, $get, $literal } from "../helpers/expressions";

describe("call expression step", () => {

  test("should compile call expression step", () => {

    const step: FunctionCallExpression = $call(
      $get("func"),
    );
    const resolve = compileStep(step);

    const func = jest.fn();

    const scope = createScope(null, {
      func,
    });

    const result = resolve(scope);

    expect(result).toBeUndefined();
    expect(func).toHaveBeenCalledTimes(1);

  });

  test("should compile call expression step with args", () => {

    const step: FunctionCallExpression = $call(
      $get("func"),
      $literal(1),
      $literal(true),
    );
    const resolve = compileStep(step);

    const func = jest.fn(() => "ignored");

    const scope = createScope(null, {
      func,
    });

    const result = resolve(scope);

    expect(result).toBeUndefined();
    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenCalledWith(1, true);

  });

});
