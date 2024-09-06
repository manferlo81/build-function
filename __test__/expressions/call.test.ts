import { compileExp, createEnv, FunctionCallExpression } from '../../src';
import { $call, $get, $literal } from '../helpers/expressions';

describe('call expression', () => {

  const compile = <V = unknown>(exp: FunctionCallExpression, cache = {}) => compileExp<V>(exp, cache);

  test('should throw on invalid call expression', () => {
    expect(() => compile({ type: 'call' } as never)).toThrow();
  });

  test('should compile function call expression', () => {

    const exp: FunctionCallExpression = $call(
      $get('func'),
    );
    const resolve = compile<string>(exp);

    const returnValue = 'ok';
    const func = jest.fn(() => returnValue);

    const scope = createEnv(null, {
      func,
    });

    const result = resolve(scope);

    expect(func).toHaveBeenCalledTimes(1);
    expect(result).toBe(returnValue);

  });

  test('should call function with single spreadable argument', () => {

    const a = 1;
    const b = 2;
    const c = 3;

    const expression: FunctionCallExpression = $call(
      $get('func'),
      {
        type: 'spread',
        exp: $literal([a, b, c]),
      },
    );
    const resolve = compile<number>(expression);

    const func = jest.fn((x: number, y: number, z: number) => x + y + z);

    const scope = createEnv(null, {
      func,
    });

    const result = resolve(scope);

    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenCalledWith(a, b, c);
    expect(result).toBe(a + b + c);

  });

  test('should call function with no arguments', () => {

    const expression: FunctionCallExpression = $call(
      $get('func'),
    );
    const resolve = compile<boolean>(expression);

    const func = jest.fn(() => {
      return true;
    });

    const scope = createEnv(null, {
      func,
    });

    const result = resolve(scope);

    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenCalledWith();
    expect(result).toBe(true);

  });

  test('should cache function call expression', () => {

    const exp1 = $call(
      $get('func'),
      $literal(1),
      $literal(2),
    );
    const exp2 = $call(
      $get('func'),
      $literal(1),
      $literal(2),
    );

    const cache = {};

    expect(exp1).toEqual(exp2);
    expect(exp1).not.toBe(exp2);
    expect(compile(exp1, cache)).toBe(compile(exp2, cache));

  });

});
