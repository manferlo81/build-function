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

    expect(resolve(null as any)).toEqual([0, ...array]);

  });

  test("should compile spread expression with cache", () => {

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

    // FIXME: it should be true
    expect(same).toEqual(false);

  });

});
