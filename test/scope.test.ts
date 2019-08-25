import { compileExpression, createEnv, LexicalEnvironment } from "../src";
import { $get } from "./helpers/expressions";
import { rand } from "./helpers/number";

describe("create scope", () => {

  test("should add lib to scope", () => {

    const a = rand(0, 10);
    const b = rand(0, 10);

    const env = createEnv(null, { a, b });

    const get = (id: string, getScope: LexicalEnvironment) => compileExpression(
      $get(id),
    )(getScope);

    expect(get("a", env)).toBe(a);
    expect(get("b", env)).toBe(b);

  });

  test("should set parent environment", () => {

    const a = rand(0, 10);
    const b = rand(0, 10);

    const parent = createEnv(null, { a });
    const env = createEnv(parent, { b });

    expect(env.parent).toBe(parent);

    const get = (id: string, getScope: LexicalEnvironment) => compileExpression(
      $get(id),
    )(getScope);

    expect(get("a", env)).toBe(a);
    expect(get("b", env)).toBe(b);

  });

  test("should ignore lib prototype properties", () => {

    const b = rand(0, 10);

    const lib = Object.assign(
      Object.create({ a: null }),
      { b },
    );

    const env = createEnv(null, lib);

    const get = (id: string, getScope: LexicalEnvironment) => compileExpression(
      $get(id),
    )(getScope);

    expect(() => get("a", env)).toThrow();
    expect(get("b", env)).toBe(b);

  });

});
