import { compileExpression, createEnv, SetExpression } from "../../src";
import { $get, $literal, $set } from "../helpers/expressions";
import { rand } from "../helpers/number";

describe("set expression", () => {

  test("should throw on invalid set expression", () => {

    const base = { type: "set" };
    const invalid = [
      base,
      { ...base, id: "id" },
      { ...base, value: $literal(0) },
      { ...base, id: 10, value: $literal(0) },
    ];

    invalid.forEach((expression) => {

      expect(() => compileExpression(expression as any)).toThrow();

    });

  });

  test("should compile set expression with string id", () => {

    const id = "value";
    const value = rand(1, 200);
    const expression: SetExpression = $set(
      id,
      $literal(value),
    );
    const setValue = compileExpression(expression);
    const getValue = compileExpression(
      $get(id),
    );

    const initial = 100;
    const env = createEnv(null, { [id]: initial });

    expect(getValue(env)).toBe(initial);

    const valueSet = setValue(env);

    expect(valueSet).toBe(value);
    expect(getValue(env)).toBe(value);

  });

  test("should throw if not found", () => {

    const expression: SetExpression = $set(
      "value",
      $literal(true),
    );
    const resolve = compileExpression(expression);

    const env = createEnv(null);

    expect(() => resolve(env)).toThrow();

  });

});
