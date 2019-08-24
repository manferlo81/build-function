import { compileExpression, compileStep, createScope, DeclareStatement } from "../../src";
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

    const step: DeclareStatement = {
      type: "declare",
      set: { id: "value", value: $literal(true) },
    };
    const resolve = compileStep(step);

    const getValue = compileExpression(
      $get("value"),
    );

    const scope = createScope(null);

    expect(() => getValue(scope)).toThrow();

    const result = resolve(scope);

    expect(result).toBeUndefined();
    expect(getValue(scope)).toBe(true);

  });

  test("should compile multiple declare statement step with multiple values", () => {

    const step: DeclareStatement = {
      type: "declare",
      set: [
        { id: "value1", value: $literal(true) },
        { id: "value2", value: $literal(true) },
      ],
    };
    const resolve = compileStep(step);

    const getValue1 = compileExpression(
      $get("value1"),
    );
    const getValue2 = compileExpression(
      $get("value2"),
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

    const step: DeclareStatement = {
      type: "declare",
      set: [
        "value1",
        "value2",
      ],
    };
    const resolve = compileStep(step);

    const getValue1 = compileExpression(
      $get("value1"),
    );
    const getValue2 = compileExpression(
      $get("value2"),
    );

    const scope = createScope(null);

    const result = resolve(scope);

    expect(result).toBeUndefined();
    expect(getValue1(scope)).toBeUndefined();
    expect(getValue2(scope)).toBeUndefined();

  });

});
