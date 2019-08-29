import { compileExp, createEnv } from "../src";
import { $get } from "./helpers/expressions";
import { rand } from "./helpers/number";

describe("create scope", () => {

  test("should add lib to scope", () => {

    const resolveA = compileExp(
      $get("a"),
      {},
    );
    const resolveB = compileExp(
      $get("b"),
      {},
    );

    const a = rand(0, 10);
    const b = rand(0, 10);
    const scope = createEnv(null, { a, b });

    expect(resolveA(scope)).toBe(a);
    expect(resolveB(scope)).toBe(b);

  });

  test("should set parent environment", () => {

    const resolveA = compileExp(
      $get("a"),
      {},
    );
    const resolveB = compileExp(
      $get("b"),
      {},
    );

    const a = rand(0, 10);
    const b = rand(0, 10);
    const parent = createEnv(null, { a });
    const scope = createEnv(parent, { b });

    expect(scope.parent).toBe(parent);

    expect(resolveA(scope)).toBe(a);
    expect(resolveB(scope)).toBe(b);

  });

  test("should ignore lib prototype properties", () => {

    const resolveA = compileExp(
      $get("a"),
      {},
    );
    const resolveB = compileExp(
      $get("b"),
      {},
    );

    const b = rand(0, 10);
    const lib = Object.assign(
      Object.create({ a: null }),
      { b },
    );

    const scope = createEnv(null, lib);

    expect(() => resolveA(scope)).toThrow();
    expect(resolveB(scope)).toBe(b);

  });

});
