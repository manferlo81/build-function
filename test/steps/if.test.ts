import { compileExp, compileStep, createScope, IfStatement } from "../../src";
import { $call, $get, $literal, $set } from "../helpers/expressions";

describe("if statement step", () => {

  test("should throw on invalid if statement step", () => {

    const base = { type: "if" };
    const invalid = [
      base,
    ];

    invalid.forEach((step) => {

      expect(() => compileStep(step as any)).toThrow();

    });

  });

  test("should compile if statement step with single step", () => {

    const step: IfStatement = {
      type: "if",
      condition: $get("cond"),
      then: $call(
        $get("then"),
      ),
      otherwise: $call(
        $get("otherwise"),
      ),
    };

    const resolve = compileStep(step);

    const setCond = compileExp(
      $set(
        "cond",
        $literal(true),
      ),
    );

    const then = jest.fn();
    const otherwise = jest.fn();

    const scope = createScope(null, { cond: false, then, otherwise });

    expect(resolve(scope)).toBeUndefined();
    setCond(scope);
    expect(resolve(scope)).toBeUndefined();

    expect(then).toHaveBeenCalledTimes(1);
    expect(otherwise).toHaveBeenCalledTimes(1);

  });

  test("should compile if statement step with multiple steps", () => {

    const step: IfStatement = {
      type: "if",
      condition: $get("cond"),
      then: [
        $call(
          $get("then"),
        ),
      ],
      otherwise: [
        $call(
          $get("otherwise"),
        ),
      ],
    };

    const resolve = compileStep(step);

    const setCond = compileExp(
      $set(
        "cond",
        $literal(true),
      ),
    );

    const then = jest.fn();
    const otherwise = jest.fn();

    const scope = createScope(null, { cond: false, then, otherwise });

    expect(resolve(scope)).toBeUndefined();
    setCond(scope);
    expect(resolve(scope)).toBeUndefined();

    expect(then).toHaveBeenCalledTimes(1);
    expect(otherwise).toHaveBeenCalledTimes(1);

  });

  test("should compile if statement step without steps", () => {

    const step: IfStatement = {
      type: "if",
      condition: $get("cond"),
    };

    const resolve = compileStep(step);

    expect(resolve.length).toBe(0);

  });

});
