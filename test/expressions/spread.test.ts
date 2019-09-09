import { SpreadableExpression } from "../../src";
import { compileSpread } from "../../src/compile";
import { $literal } from "../helpers/expressions";

describe("spread expression", () => {

  test("should compile spread expression", () => {

    const array = [1, 2, 3];
    const expressions: SpreadableExpression[] = [
      $literal(0),
      {
        type: "spread",
        exp: $literal(array),
      },
    ];

    const resolve = compileSpread(expressions, {});

    expect(resolve(null as any, [])).toEqual([0, ...array]);

  });

  test("should cache single spread expression", () => {

    const exp1: SpreadableExpression = {
      type: "spread",
      exp: $literal([1, 2, 3]),
    };
    const exp2: SpreadableExpression = {
      type: "spread",
      exp: $literal([1, 2, 3]),
    };

    const cache = {};
    const same = compileSpread(exp1, cache) === compileSpread(exp2, cache);

    expect(same).toEqual(true);

  });

  test("should cache single & multi spread expression", () => {

    const exp1: SpreadableExpression = {
      type: "spread",
      exp: $literal([1, 2, 3]),
    };
    const exp2: SpreadableExpression[] = [
      {
        type: "spread",
        exp: $literal([1, 2, 3]),
      },
    ];

    const cache = {};
    const same = compileSpread(exp1, cache) === compileSpread(exp2, cache);

    expect(same).toEqual(true);

  });

  test("should cache multiple spread expression", () => {

    const exp1: SpreadableExpression[] = [
      $literal(0),
      {
        type: "spread",
        exp: $literal([1, 2, 3]),
      },
    ];
    const exp2: SpreadableExpression[] = [
      $literal(0),
      {
        type: "spread",
        exp: $literal([1, 2, 3]),
      },
    ];

    const cache = {};
    const same = compileSpread(exp1, cache) === compileSpread(exp2, cache);

    expect(same).toEqual(true);

  });

});
