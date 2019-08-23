import { compileExpression, createScope, FunctionExpression } from "../../src";
import { $get, $if, $literal, $oper, $return, $set } from "../helpers/expressions";
import { rand } from "../helpers/number";

describe("function expression", () => {

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
    const resolve = compileExpression<(a: number, b: number) => number>(expression);

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
    const resolve = compileExpression<() => true>(expression);

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
    const resolve = compileExpression<(param: any) => true | undefined>(expression);

    const scope = createScope(null);
    const func = resolve(scope);
    const param = {};

    expect(func(param)).toBe(param);

  });

  test("should compile function expression with single rest param", () => {

    const expression: FunctionExpression = {
      type: "func",
      params: { type: "rest", id: "params" },
      body: $return(
        $get("params"),
      ),
    };
    const resolve = compileExpression<(param: any) => true | undefined>(expression);

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
    const resolve = compileExpression<(a: number, b: number, ...others: number[]) => number>(expression);

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
    const resolve = compileExpression<(param: any) => true | undefined>(expression);

    const scope = createScope(null);
    const func = resolve(scope);

    expect(func(true)).toBe(true);
    expect(func(null)).toBeUndefined();

  });

  test("should compile function expression without body", () => {

    const expression: FunctionExpression = {
      type: "func",
    };
    const resolve = compileExpression<() => undefined>(expression);

    const func = resolve(null as any);

    expect(func()).toBeUndefined();

  });

  test("should return undefined if empty", () => {

    const expression: FunctionExpression = {
      type: "func",
      body: [],
    };
    const resolve = compileExpression<() => void>(expression);

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
    const resolve = compileExpression<() => void>(expression);

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
    const resolve = compileExpression(expression);

    const scope = createScope(null);

    const func = resolve(scope);

    const args = [1, 2, 3];

    expect(func(...args)).toEqual(args);

  });

});
