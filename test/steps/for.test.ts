import { compileStep, createScope, ForStatement } from "../../src";
import { $call, $get, $if, $literal, $oper, $return } from "../helpers/expressions";

describe("for statement step", () => {

  test("should throw on invalid for statement step", () => {

    const base = { type: "for" };
    const invalid = [
      base,
    ];

    invalid.forEach((step) => {

      expect(() => compileStep(step as any)).toThrow();

    });

  });

  test("should compile for statement step with single step body", () => {

    const array = [1, 2, 3];
    const len = array.length;
    const step: ForStatement = {
      type: "for",
      target: $literal(array),
      index: "i",
      value: "num",
      body: $call(
        $get("func"),
        $get("num"),
        $get("i"),
      ),
    };

    const resolve = compileStep(step);

    const func = jest.fn();
    const scope = createScope(null, { func });

    expect(resolve(scope)).toBeUndefined();

    expect(func).toHaveBeenCalledTimes(len);
    for (let i = 0; i < len; i++) {
      expect(func).toHaveBeenNthCalledWith(i + 1, array[i], i);
    }

  });

  test("should compile for statement step with multiple steps body", () => {

    const array = [1, 2, 3];
    const len = array.length;
    const step: ForStatement = {
      type: "for",
      target: $literal(array),
      index: "i",
      value: "num",
      body: [
        $call(
          $get("func"),
          $get("num"),
          $get("i"),
        ),
      ],
    };

    const resolve = compileStep(step);

    const func = jest.fn();
    const scope = createScope(null, { func });

    expect(resolve(scope)).toBeUndefined();

    expect(func).toHaveBeenCalledTimes(len);
    for (let i = 0; i < len; i++) {
      expect(func).toHaveBeenNthCalledWith(i + 1, array[i], i);
    }

  });

  test("should compile for statement step with no body", () => {

    const array = [1, 2, 3];
    const step: ForStatement = {
      type: "for",
      target: $literal(array),
    };
    const resolve = compileStep(step);

    expect(resolve.length).toBe(0);

  });

  test("should compile for statement step and interrupt on break", () => {

    const array = [1, 2, 3, 4, 5, 6, 8];
    const interrupt2 = 4;
    const interruptIndex = array.indexOf(interrupt2);
    const step: ForStatement = {
      type: "for",
      target: $literal(array),
      index: "i",
      value: "num",
      body: [
        $if(
          $oper(
            "===",
            $get("num"),
            $literal(interrupt2),
          ),
          {
            type: "break",
          },
        ),
        $call(
          $get("func"),
          $get("num"),
          $get("i"),
        ),
      ],
    };

    const resolve = compileStep(step);

    const func = jest.fn();
    const scope = createScope(null, { func });

    expect(resolve(scope)).toBeUndefined();

    expect(func).toHaveBeenCalledTimes(interruptIndex);
    for (let i = 0; i < interruptIndex; i++) {
      expect(func).toHaveBeenNthCalledWith(i + 1, array[i], i);
    }

  });

  test("should compile for statement step and interrupt on return", () => {

    const array = [1, 2, 3, 4, 5, 6, 8];
    const interrupt2 = 4;
    const interruptIndex = array.indexOf(interrupt2);
    const step: ForStatement = {
      type: "for",
      target: $literal(array),
      index: "i",
      value: "num",
      body: [
        $if(
          $oper(
            "===",
            $get("num"),
            $literal(interrupt2),
          ),
          $return(
            $literal("result"),
          ),
        ),
        $call(
          $get("func"),
          $get("num"),
          $get("i"),
        ),
      ],
    };

    const resolve = compileStep(step);

    const func = jest.fn();
    const scope = createScope(null, { func });

    expect(resolve(scope)).toEqual({
      type: "return",
      value: "result",
    });

    expect(func).toHaveBeenCalledTimes(interruptIndex);
    for (let i = 0; i < interruptIndex; i++) {
      expect(func).toHaveBeenNthCalledWith(i + 1, array[i], i);
    }

  });

  test("should compile for statement step without index and value id", () => {

    const array = [1, 2, 3];
    const step: ForStatement = {
      type: "for",
      target: $literal(array),
      body: [],
    };

    const resolve = compileStep(step);

    const scope = createScope(null);

    expect(() => resolve(scope)).not.toThrow();

  });

});
