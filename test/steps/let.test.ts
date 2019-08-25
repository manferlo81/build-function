import { compileExp, compileStep, createEnv, LetStatement } from "../../src";
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

    const getValue = compileExp(
      $get("value"),
    );

    const env = createEnv(null);

    expect(() => getValue(env)).toThrow();

    const result = resolve(env);

    expect(result).toBeUndefined();
    expect(getValue(env)).toBe(true);

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

  test("should compile let statement step without value", () => {

    const step: LetStatement = {
      type: "let",
      declare: [
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

  test("should throw if already been declared", () => {

    const step: LetStatement = {
      type: "let",
      declare: "value1",
    };
    const resolve = compileStep(step);

    const env = createEnv(null);

    resolve(env);
    expect(() => resolve(env)).toThrow();

  });

});
