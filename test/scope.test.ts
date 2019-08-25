import { compileExp, createScope, Scope } from "../src";
import { $get } from "./helpers/expressions";
import { rand } from "./helpers/number";

describe("create scope", () => {

  test("should add lib to scope", () => {

    const a = rand(0, 10);
    const b = rand(0, 10);

    const scope = createScope(null, { a, b });

    const get = (id: string, getScope: Scope) => compileExp(
      $get(id),
    )(getScope);

    expect(get("a", scope)).toBe(a);
    expect(get("b", scope)).toBe(b);

  });

  test("should set parent environment", () => {

    const a = rand(0, 10);
    const b = rand(0, 10);

    const parent = createScope(null, { a });
    const scope = createScope(parent, { b });

    expect(scope.parent).toBe(parent);

    const get = (id: string, getScope: Scope) => compileExp(
      $get(id),
    )(getScope);

    expect(get("a", scope)).toBe(a);
    expect(get("b", scope)).toBe(b);

  });

  test("should ignore lib prototype properties", () => {

    const b = rand(0, 10);

    const lib = Object.assign(
      Object.create({ a: null }),
      { b },
    );

    const scope = createScope(null, lib);

    const get = (id: string, getScope: Scope) => compileExp(
      $get(id),
    )(getScope);

    expect(() => get("a", scope)).toThrow();
    expect(get("b", scope)).toBe(b);

  });

});
