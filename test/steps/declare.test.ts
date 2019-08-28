import { compileExp, compileStep, createScope, DeprecatedDeclareStatement } from "../../src";
import { $get, $literal } from "../helpers/expressions";

describe("declare statement step", () => {

  test("should throw on invalid declare statement step", () => {

    const base = { type: "declare" };
    const invalid = [
      base,
    ];

    invalid.forEach((step) => {

      expect(() => compileStep(step as any, {})).toThrow();

    });

  });

  test("should compile single declare statement step with single value", () => {

    const step: DeprecatedDeclareStatement = {
      type: "declare",
      set: { id: "value", value: $literal(true) },
    };
    const resolve = compileStep(step, {});

    const getValue = compileExp(
      $get("value"),
      {},
    );

    const scope = createScope(null);

    expect(() => getValue(scope)).toThrow();

    const result = resolve(scope);

    expect(result).toBeUndefined();
    expect(getValue(scope)).toBe(true);

  });

  test("should compile multiple declare statement step with multiple values", () => {

    const step: DeprecatedDeclareStatement = {
      type: "declare",
      set: [
        { id: "value1", value: $literal(true) },
        { id: "value2", value: $literal(true) },
      ],
    };
    const resolve = compileStep(step, {});

    const getValue1 = compileExp(
      $get("value1"),
      {},
    );
    const getValue2 = compileExp(
      $get("value2"),
      {},
    );

    const scope = createScope(null);

    expect(() => getValue1(scope)).toThrow();
    expect(() => getValue2(scope)).toThrow();

    const result = resolve(scope);

    expect(result).toBeUndefined();
    expect(getValue1(scope)).toBe(true);
    expect(getValue2(scope)).toBe(true);

  });

  test("should compile declare statement step without value", () => {

    const step: DeprecatedDeclareStatement = {
      type: "declare",
      set: [
        "value1",
        "value2",
      ],
    };
    const resolve = compileStep(step, {});

    const getValue1 = compileExp(
      $get("value1"),
      {},
    );
    const getValue2 = compileExp(
      $get("value2"),
      {},
    );

    const scope = createScope(null);

    const result = resolve(scope);

    expect(result).toBeUndefined();
    expect(getValue1(scope)).toBeUndefined();
    expect(getValue2(scope)).toBeUndefined();

  });

  test("should cache declare statement step", () => {

    const step1: DeprecatedDeclareStatement = {
      type: "declare",
      set: [
        "value1",
        "value2",
      ],
    };
    const step2: DeprecatedDeclareStatement = {
      type: "declare",
      set: [
        "value1",
        "value2",
      ],
    };

    const cache = {};
    const same = compileStep(step1, cache) === compileStep(step2, cache);

    expect(same).toBe(true);

  });

});
