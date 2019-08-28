import { compileExp, createScope, FunctionExpression } from "../../src";
import { $get, $if, $literal, $oper, $return, $set } from "../helpers/expressions";
import { rand } from "../helpers/number";

describe("function expression", () => {

  test("should throw on invalid parameter type", () => {

    const expression: FunctionExpression = {
      type: "func",
      params: { id: "param1", type: "invalid" } as any,
    };

    expect(() => compileExp(expression, {})).toThrow();

  });

  test("should throw on invalid parameter id", () => {

    const expression: FunctionExpression = {
      type: "func",
      params: 100 as any,
    };

    expect(() => compileExp(expression, {})).toThrow();

  });

  test("should throw on parameter id named arguments", () => {

    const expression: FunctionExpression = {
      type: "func",
      params: "arguments",
    };

    expect(() => compileExp(expression, {})).toThrow();

  });

  test("should compile function expression", () => {

    const expression: FunctionExpression = {
      type: "func",
      params: [
        "a",
        { type: "param", id: "b" },
      ],
      body: $return(
        $oper(
          "+",
          $get("a"),
          $get("b"),
        ),
      ),
    };
    const resolve = compileExp<(a: number, b: number) => number>(expression, {});

    const scope = createScope(null);
    const func = resolve(scope);

    const a = rand(1, 50);
    const b = rand(1, 50);

    expect(func(a, b)).toBe(a + b);

  });

  test("should compile function expression with no params", () => {

    const expression: FunctionExpression = {
      type: "func",
      body: $return(
        $literal(true),
      ),
    };
    const resolve = compileExp<() => true>(expression, {});

    const scope = createScope(null);
    const func = resolve(scope);

    expect(func()).toBe(true);

  });

  test("should compile function expression with single param", () => {

    const expression: FunctionExpression = {
      type: "func",
      params: "param",
      body: $return(
        $get("param"),
      ),
    };
    const resolve = compileExp<(param: any) => true | undefined>(expression, {});

    const scope = createScope(null);
    const func = resolve(scope);
    const param = {};

    expect(func(param)).toBe(param);

  });

  test("should compile function expression with single rest param", () => {

    const expression: FunctionExpression = {
      type: "func",
      params: { id: "params", type: "rest" },
      body: $return(
        $get("params"),
      ),
    };
    const resolve = compileExp<(param: any) => true | undefined>(expression, {});

    const scope = createScope(null);
    const func: (...args: any[]) => any = resolve(scope);
    const params = [1, 2, 3];

    expect(func(...params)).toEqual(params);

  });

  test("should compile function expression with rest parameters", () => {

    const expression: FunctionExpression = {
      type: "func",
      params: [
        "a",
        { id: "b", type: "param" },
        { id: "others", type: "rest" },
      ],
      body: [
        $return(
          $get("others"),
        ),
      ],
    };
    const resolve = compileExp<(a: number, b: number, ...others: number[]) => number>(expression, {});

    const scope = createScope(null);
    const func = resolve(scope);

    const a = rand(1, 50);
    const b = rand(1, 50);
    const others = new Array(rand(1, 10, true)).fill(0).map(() => rand(1, 50));

    expect(func(a, b, ...others)).toEqual(others);

  });

  test("should compile function expression with multi-step body", () => {

    const expression: FunctionExpression = {
      type: "func",
      params: ["param"],
      body: [
        { type: "declare", set: "result" },
        $if(
          $oper(
            "===",
            $get("param"),
            $literal(true),
          ),
          $set(
            "result",
            $literal(true),
          ),
        ),
        $return(
          $get("result"),
        ),
      ],
    };
    const resolve = compileExp<(param: any) => true | undefined>(expression, {});

    const scope = createScope(null);
    const func = resolve(scope);

    expect(func(true)).toBe(true);
    expect(func(null)).toBeUndefined();

  });

  test("should compile function expression without body", () => {

    const expression: FunctionExpression = {
      type: "func",
    };
    const resolve = compileExp<() => undefined>(expression, {});

    const func = resolve(null as any);

    expect(func()).toBeUndefined();

  });

  test("should return undefined if empty", () => {

    const expression: FunctionExpression = {
      type: "func",
      body: [],
    };
    const resolve = compileExp<() => void>(expression, {});

    const scope = createScope(null);

    const func = resolve(scope);

    expect(func()).toBeUndefined();

  });

  test("should throw if throw step executed", () => {

    const msg = "User error";

    const expression: FunctionExpression = {
      type: "func",
      body: {
        type: "throw",
        msg,
      },
    };
    const resolve = compileExp<() => void>(expression, {});

    const scope = createScope(null);

    const func = resolve(scope);

    expect(() => func()).toThrow(msg);

  });

  test("should declare arguments inside function scope", () => {

    const expression: FunctionExpression = {
      type: "func",
      body: $return(
        $get("arguments"),
      ),
    };
    const resolve = compileExp(expression, {});

    const scope = createScope(null);

    const func = resolve(scope);

    const args = [1, 2, 3];

    expect(func(...args)).toEqual(args);

  });

  test("should cache function expression", () => {

    const expression1: FunctionExpression = {
      type: "func",
      params: ["a", "b"],
      body: $return(
        $literal(null),
      ),
    };
    const expression2: FunctionExpression = {
      type: "func",
      params: ["a", "b"],
      body: $return(
        $literal(null),
      ),
    };

    const cache = {};
    const same = compileExp(expression1, cache) === compileExp(expression2, cache);

    expect(same).toBe(true);

  });

});
