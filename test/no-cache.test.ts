import { compileExp, compileStep, FunctionCallExpression, GetExpression } from "../src";
import { $call, $get } from "./helpers/expressions";

jest.mock("object-hash", () => {
  return null;
});

describe("compile without cache", () => {

  test("should compile expression without cache if no object-hash", () => {

    const exp1: GetExpression = $get("value");
    const exp2: GetExpression = $get("value");

    const cache = {};

    const same = compileExp(exp1, cache) === compileExp(exp2, cache);

    expect(same).toBe(false);

  });

  test("should compile step without cache if no object-hash", () => {

    const step1: FunctionCallExpression = $call(
      $get("func"),
      $get("a"),
      $get("b"),
    );
    const step2: FunctionCallExpression = $call(
      $get("func"),
      $get("a"),
      $get("b"),
    );

    const cache = {};

    const same = compileStep(step1, cache) === compileStep(step2, cache);

    expect(same).toBe(false);

  });

});
