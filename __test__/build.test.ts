import { build } from "../src";
import { $get, $oper, $return } from "./helpers/expressions";
import { rand } from "./helpers/number";

describe("build function", () => {

  test("should build function", () => {

    const func = build({
      params: ["a", "b"],
      body: $return(
        $oper(
          "+",
          $get("a"),
          $get("b"),
        ),
      ),
    });

    const a = rand(1, 50);
    const b = rand(1, 50);

    expect(func(a, b)).toBe(a + b);

  });

  test("should add itself to scope if name provided", () => {

    const func = build({
      name: "func",
      body: $return(
        $get("func"),
      ),
    });

    const result = func();

    expect(result).toBe(func);

  });

});