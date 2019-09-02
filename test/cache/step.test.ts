import { CompileCache, compileStep, ForStatement, Statement } from "../../src";
import { $call, $get, $literal, $return } from "../helpers/expressions";

describe("compile step with cache", () => {

  test("should cache single function step", () => {

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

  test("should cache single function step from array", () => {

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
    const step2: [ForStatement] = [
      {
        type: "for",
        target: $get("array"),
        value: "value",
        body: $call(
          $get("func"),
          $get("value"),
          $get("array"),
        ),
      },
    ];

    const cache: CompileCache = {};
    const same = compileStep(step1, cache) === compileStep(step2, cache);

    expect(same).toBe(true);

  });

  test("should cache multiple function steps", () => {

    const step1: Statement[] = [
      {
        type: "for",
        target: $get("array"),
        value: "value",
        body: $call(
          $get("func"),
          $get("value"),
          $get("array"),
        ),
      },
      $return(
        $literal(null),
      ),
    ];
    const step2: Statement[] = [
      {
        type: "for",
        target: $get("array"),
        value: "value",
        body: $call(
          $get("func"),
          $get("value"),
          $get("array"),
        ),
      },
      $return(
        $literal(null),
      ),
    ];

    const cache: CompileCache = {};
    const same = compileStep(step1, cache) === compileStep(step2, cache);

    expect(same).toBe(true);

  });

});
