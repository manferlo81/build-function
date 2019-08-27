import { compileExp, createScope, SetExpression } from "../../src";
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

      expect(() => compileExp(expression as any, {})).toThrow();

    });

  });

  test("should compile set expression with string id", () => {

    const id = "value";
    const value = rand(1, 200);
    const expression: SetExpression = $set(
      id,
      $literal(value),
    );
    const setValue = compileExp(expression, {});
    const getValue = compileExp(
      $get(id),
      {},
    );

    const initial = 100;
    const scope = createScope(null, { [id]: initial });

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
    const resolve = compileExp(expression, {});

    const scope = createScope(null);

    expect(() => resolve(scope)).toThrow();

  });

});
