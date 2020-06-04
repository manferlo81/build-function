import { compileExp, createEnv, FunctionCallExpression } from '../../src';
import { $call, $get, $literal } from '../helpers/expressions';

describe('call expression', () => {

  test('should throw on invalid call expression', () => {

    const invalid = { type: 'call' };

    expect(() => compileExp(invalid as never, {})).toThrow();

  });

  test('should compile function call expression', () => {

    const expression: FunctionCallExpression = $call(
      $get('func'),
    );
    const resolve = compileExp<string>(expression, {});

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
    const resolve = compileExp<number>(expression, {});

    const func = jest.fn((x: number, y: number, z: number): number => (x + y + z));

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
    const resolve = compileExp<boolean>(expression, {});

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

    const expression1: FunctionCallExpression = $call(
      $get('func'),
      $literal(1),
      $literal(2),
    );
    const expression2: FunctionCallExpression = $call(
      $get('func'),
      $literal(1),
      $literal(2),
    );

    const cache = {};
    const same = compileExp(expression1, cache) === compileExp(expression2, cache);

    expect(same).toBe(true);

  });

});
