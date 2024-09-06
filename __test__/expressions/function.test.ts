import { compileExp, createEnv, Expression, FunctionExpression } from '../../src';
import { $binary, $get, $if, $literal, $return, $set } from '../helpers/expressions';
import { rand } from '../helpers/number';

describe('function expression', () => {

  const compile = <V = unknown>(exp: Expression, cache = {}) => compileExp<V>(exp, cache);

  test('should throw on invalid parameter type', () => {
    const exp = { type: 'func', params: { id: 'param1', type: 'invalid' } };
    expect(() => compile(exp as never)).toThrow();
  });

  test('should throw on invalid parameter id', () => {
    expect(() => compile({ type: 'func', params: 100 as never })).toThrow();
  });

  test('should throw on parameter id named arguments', () => {
    expect(() => compile({ type: 'func', params: 'arguments' })).toThrow();
  });

  test('should compile function expression', () => {

    const exp: FunctionExpression = {
      type: 'func',
      params: [
        'a',
        { type: 'param', id: 'b' },
      ],
      body: $return(
        $binary(
          '+',
          $get('a'),
          $get('b'),
        ),
      ),
    };

    const resolve = compile<(a: number, b: number) => number>(exp);

    const scope = createEnv();
    const func = resolve(scope);

    const a = rand(1, 50);
    const b = rand(1, 50);

    expect(func(a, b)).toBe(a + b);

  });

  test('should compile function expression with no params', () => {

    const exp: FunctionExpression = {
      type: 'func',
      body: $return(
        $literal(true),
      ),
    };
    const resolve = compile<() => true>(exp);

    const scope = createEnv();
    const func = resolve(scope);

    expect(func()).toBe(true);

  });

  test('should compile function expression with single param', () => {

    const exp: FunctionExpression = {
      type: 'func',
      params: 'param',
      body: $return(
        $get('param'),
      ),
    };
    const resolve = compile<(param: any) => true | undefined>(exp);

    const scope = createEnv();
    const func = resolve(scope);
    const param = {};

    expect(func(param)).toBe(param);

  });

  test('should compile function expression with single rest param', () => {

    const exp: FunctionExpression = {
      type: 'func',
      params: { id: 'params', type: 'rest' },
      body: $return(
        $get('params'),
      ),
    };
    const resolve = compile<(param: any) => true | undefined>(exp);

    const scope = createEnv();
    const func: (...args: any[]) => any = resolve(scope);
    const params = [1, 2, 3];

    expect(func(...params)).toEqual(params);

  });

  test('should compile function expression with rest parameters', () => {

    const exp: FunctionExpression = {
      type: 'func',
      params: [
        'a',
        { id: 'b', type: 'param' },
        { id: 'others', type: 'rest' },
      ],
      body: [
        $return(
          $get('others'),
        ),
      ],
    };
    const resolve = compile<(a: number, b: number, ...others: number[]) => number>(exp);

    const scope = createEnv();
    const func = resolve(scope);

    const a = rand(1, 50);
    const b = rand(1, 50);
    const others = new Array(rand(1, 10, true)).fill(0).map(() => rand(1, 50));

    expect(func(a, b, ...others)).toEqual(others);

  });

  test('should compile function expression with multi-step body', () => {

    const exp: FunctionExpression = {
      type: 'func',
      params: ['param'],
      body: [
        { type: 'declare', set: 'result' },
        $if(
          $binary(
            '===',
            $get('param'),
            $literal(true),
          ),
          $set(
            'result',
            $literal(true),
          ),
        ),
        $return(
          $get('result'),
        ),
      ],
    };
    const resolve = compile<(param: any) => true | undefined>(exp);

    const scope = createEnv();
    const func = resolve(scope);

    expect(func(true)).toBe(true);
    expect(func(null)).toBeUndefined();

  });

  test('should compile function expression without body', () => {

    const exp: FunctionExpression = {
      type: 'func',
    };
    const resolve = compile<() => undefined>(exp);

    const func = resolve(null as never);

    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    expect(func()).toBeUndefined();

  });

  test('should return undefined if empty', () => {

    const exp: FunctionExpression = {
      type: 'func',
      body: [],
    };
    const resolve = compile<() => void>(exp);

    const scope = createEnv();

    const func = resolve(scope);

    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    expect(func()).toBeUndefined();

  });

  test('should throw if throw step executed', () => {

    const msg = 'User error';

    const exp: FunctionExpression = {
      type: 'func',
      body: {
        type: 'throw',
        msg,
      },
    };
    const resolve = compile<() => void>(exp);

    const scope = createEnv();

    const func = resolve(scope);

    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    expect(() => func()).toThrow(msg);

  });

  test('should declare arguments inside function scope', () => {

    const expression: FunctionExpression = {
      type: 'func',
      body: $return(
        $get('arguments'),
      ),
    };
    const resolve = compile<(...args: number[]) => any>(expression);

    const scope = createEnv();

    const func = resolve(scope);

    const args = [1, 2, 3];

    expect(func(...args)).toEqual(args);

  });

  test('should cache function expression', () => {

    const exp1: FunctionExpression = {
      type: 'func',
      params: ['a', 'b'],
      body: $return(
        $literal(null),
      ),
    };
    const exp2: FunctionExpression = {
      type: 'func',
      params: ['a', 'b'],
      body: $return(
        $literal(null),
      ),
    };

    const cache = {};

    expect(exp1).toEqual(exp2);
    expect(exp1).not.toBe(exp2);
    expect(compileExp(exp1, cache)).toBe(compileExp(exp2, cache));

  });

});
