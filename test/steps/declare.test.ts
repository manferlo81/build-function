import { compileExp, compileStep, createEnv, DeprecatedDeclareStatement } from "../../src";
import { $get, $literal } from "../helpers/expressions";

describe("declare statement step", () => {

  test("should throw on invalid declare statement step", () => {

    const base = { type: "declare" };
    const invalid = [
      base,
    ];

    invalid.forEach((step) => {

      expect(() => compileStep(step as any)).toThrow();

    });

  });

  test("should compile single declare statement step with single value", () => {

    const step: DeprecatedDeclareStatement = {
      type: "declare",
      set: { id: "value", value: $literal(true) },
    };
    const resolve = compileStep(step);

    const getValue = compileExp(
      $get("value"),
    );

    const env = createEnv(null);

    expect(() => getValue(env)).toThrow();

    const result = resolve(env);

    expect(result).toBeUndefined();
    expect(getValue(env)).toBe(true);

  });

  test("should compile multiple declare statement step with multiple values", () => {

    const step: DeprecatedDeclareStatement = {
      type: "declare",
      set: [
        { id: "value1", value: $literal(true) },
        { id: "value2", value: $literal(true) },
      ],
    };
    const resolve = compileStep(step);

    const getValue1 = compileExp(
      $get("value1"),
    );
    const getValue2 = compileExp(
      $get("value2"),
    );

    const env = createEnv(null);

    expect(() => getValue1(env)).toThrow();
    expect(() => getValue2(env)).toThrow();

    const result = resolve(env);

    expect(result).toBeUndefined();
    expect(getValue1(env)).toBe(true);
    expect(getValue2(env)).toBe(true);

  });

  test("should compile declare statement step without value", () => {

    const step: DeprecatedDeclareStatement = {
      type: "declare",
      set: [
        "value1",
        "value2",
      ],
    };
    const resolve = compileStep(step);

    const getValue1 = compileExp(
      $get("value1"),
    );
    const getValue2 = compileExp(
      $get("value2"),
    );

    const env = createEnv(null);

    const result = resolve(env);

    expect(result).toBeUndefined();
    expect(getValue1(env)).toBeUndefined();
    expect(getValue2(env)).toBeUndefined();

  });

});
