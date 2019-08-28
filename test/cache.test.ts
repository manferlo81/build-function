import { CompileCache, compileExp, compileStep, ForStatement, TernaryExpression } from "../src";
import { $call, $get, $literal } from "./helpers/expressions";

describe("compile with cache", () => {

  test("should cache expression", () => {

    const exp1: TernaryExpression = {
      type: "ternary",
      condition: $get("cond"),
      then: $literal("yes"),
      otherwise: $literal("no"),
    };
    const exp2: TernaryExpression = {
      type: "ternary",
      condition: $get("cond"),
      then: $literal("yes"),
      otherwise: $literal("no"),
    };

    const cache: CompileCache = {};
    const same = compileExp(exp1, cache) === compileExp(exp2, cache);

    expect(same).toBe(true);
    expect(cache.exp && Object.keys(cache.exp).length).toBe(4);

  });

  test("should cache expression as step", () => {

    const exp1: TernaryExpression = {
      type: "ternary",
      condition: $get("cond"),
      then: $literal("yes"),
      otherwise: $literal("no"),
    };
    const exp2: TernaryExpression = {
      type: "ternary",
      condition: $get("cond"),
      then: $literal("yes"),
      otherwise: $literal("no"),
    };

    const cache: CompileCache = {};
    const same = compileStep(exp1, cache) === compileStep(exp2, cache);

    expect(same).toBe(true);
    expect(cache.exp && Object.keys(cache.exp).length).toBe(4);
    expect(cache.step && Object.keys(cache.step).length).toBe(1);

  });

  test("should cache statement step", () => {

    const step1: ForStatement = {
      type: "for",
      target: $get("array"),
      value: "value",
      body: $call(
        $get("func"),
        $get("value"),
        $get("array"),
      ),
    };
    const step2: ForStatement = {
      type: "for",
      target: $get("array"),
      value: "value",
      body: $call(
        $get("func"),
        $get("value"),
        $get("array"),
      ),
    };

    const cache: CompileCache = {};
    const same = compileStep(step1, cache) === compileStep(step2, cache);

    expect(same).toBe(true);
    expect(cache.exp && Object.keys(cache.exp).length).toBe(4);
    expect(cache.step && Object.keys(cache.step).length).toBe(2);

  });

});
