import { compileExpression, createScope, GetExpression, Scope } from "../../src";
import { $get } from "../helpers/expressions";
import { rand } from "../helpers/number";

describe("get expression", () => {

  test("should throw on invalid get expression", () => {

    const base = { type: "get" };
    const invalid = [
      base,
      { ...base, id: 10 },
    ];

    invalid.forEach((expression) => {

      expect(() => compileExpression(expression as any)).toThrow();

    });

  });

  test("should compile get expression with string id", () => {

    const getId = "value";
    const expression: GetExpression = $get(getId);
    const resolve = compileExpression(expression);

    const value = rand(1, 100);
    const scope: Scope = createScope(null, {
      [getId]: value,
    });

    const result = resolve(scope);
    expect(result).toBe(value);

  });

  test("should throw if not found", () => {

    const expression: GetExpression = $get("value");
    const resolve = compileExpression(expression);

    const scope: Scope = createScope(null);

    expect(() => resolve(scope)).toThrow();

  });

});
