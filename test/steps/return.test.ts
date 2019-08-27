import { compileStep, createScope, ReturnStatement } from "../../src";
import { $get } from "../helpers/expressions";

describe("return statement step", () => {

  test("should throw on invalid return statement step", () => {

    const base = { type: "return" };
    const invalid = [
      base,
    ];

    invalid.forEach((step) => {

      expect(() => compileStep(step as any, {})).toThrow();

    });

  });

  test("should compile return statement step", () => {

    const step: ReturnStatement = {
      type: "return",
      value: $get("value"),
    };

    const resolve = compileStep(step, {});

    const scope = createScope(null, {
      value: "result",
    });

    const result = resolve(scope);

    expect(result).toEqual({ type: "return", value: "result" });

  });

});
