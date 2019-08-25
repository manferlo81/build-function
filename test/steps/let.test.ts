import { compileExpression, compileStep, createScope, LetStatement } from "../../src";
import { $get, $literal } from "../helpers/expressions";

describe("let statement step", () => {

  test("should throw on invalid let statement step", () => {

    const invalid = { type: "let" };

    expect(() => compileStep(invalid as any)).toThrow();

  });

  test("should compile single let statement step with single value", () => {

    const step: LetStatement = {
      type: "let",
      declare: { id: "value", value: $literal(true) },
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

  test("should compile multiple let statement step with multiple values", () => {

    const step: LetStatement = {
      type: "let",
      declare: [
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

  test("should compile let statement step without value", () => {

    const step: LetStatement = {
      type: "let",
      declare: [
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
