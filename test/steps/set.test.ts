import { compileExpression, compileStep, createEnv, SetExpression } from "../../src";
import { $get, $literal, $set } from "../helpers/expressions";

describe("set expression step", () => {

  test("should compile set expression step", () => {

    const step: SetExpression = $set(
      "value",
      $literal(true),
    );
    const resolve = compileStep(step);

    const getValue = compileExpression(
      $get("value"),
    );

    const env = createEnv(null, {
      value: false,
    });

    expect(getValue(env)).toBe(false);

    const result = resolve(env);

    expect(result).toBeUndefined();
    expect(getValue(env)).toBe(true);

  });

});
