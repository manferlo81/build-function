import { compileExp, compileStep, createEnv, SetExpression } from "../../src";
import { $get, $literal, $set } from "../helpers/expressions";

describe("set expression step", () => {

  test("should compile set expression step", () => {

    const step: SetExpression = $set(
      "value",
      $literal(true),
    );
    const resolve = compileStep(step, {});

    const getValue = compileExp(
      $get("value"),
      {},
    );

    const scope = createEnv(null, {
      value: false,
    });

    expect(getValue(scope)).toBe(false);

    const result = resolve(scope);

    expect(result).toBeUndefined();
    expect(getValue(scope)).toBe(true);

  });

});
