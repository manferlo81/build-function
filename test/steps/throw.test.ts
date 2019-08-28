import { compileStep, StepThrow, ThrowStatement } from "../../src";
import { $literal, $oper } from "../helpers/expressions";

describe("throw error statement step", () => {

  test("should throw on invalid throw error statement step", () => {

    const base = { type: "throw" };
    const invalid = [
      base,
    ];

    invalid.forEach((step) => {

      expect(() => compileStep(step as any, {})).toThrow();

    });

  });

  test("should compile throw error statement step using string message", () => {

    const step: ThrowStatement = {
      type: "throw",
      msg: "Error",
    };
    const resolve = compileStep(step, {});

    const result = resolve(null as any);

    expect(result).toEqual({
      type: "throw",
      error: expect.any(Error),
    });

  });

  test("should compile throw error statement step using expression message", () => {

    const step: ThrowStatement = {
      type: "throw",
      msg: $oper(
        "+",
        $literal(5),
        $literal(" is not valid"),
      ),
    };
    const resolve = compileStep(step, {});

    const result = resolve(null as any) as StepThrow;

    expect(result).toEqual({
      type: "throw",
      error: expect.any(Error),
    });

    expect(result.error.message).toBe("5 is not valid");

  });

  test("should cache throw statement step", () => {

    const step1: ThrowStatement = {
      type: "throw",
      msg: "value",
    };
    const step2: ThrowStatement = {
      type: "throw",
      msg: "value",
    };

    const cache = {};
    const same = compileStep(step1, cache) === compileStep(step2, cache);

    expect(same).toBe(true);

  });

});
