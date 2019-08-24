import { compileExpression, createScope, Scope, SetExpression } from "../../src";
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
    const scope: Scope = createScope(null, { [id]: initial });

    expect(getValue(scope)).toBe(initial);

    const valueSet = setValue(scope);

    expect(valueSet).toBe(value);
    expect(getValue(scope)).toBe(value);

  });

  test("should throw if not found", () => {

    const expression: SetExpression = $set(
      "value",
      $literal(true),
    );
    const resolve = compileExpression(expression);

    const scope: Scope = createScope(null);

    expect(() => resolve(scope)).toThrow();

  });

});
