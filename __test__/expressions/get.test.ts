import { compileExp, createEnv, Expression, GetExpression } from '../../src';
import { $get } from '../helpers/expressions';
import { rand } from '../helpers/number';

describe('get expression', () => {

  const compile = <V = unknown>(exp: Expression, cache = {}) => compileExp<V>(exp, cache);

  test('should throw on invalid get expression', () => {
    expect(() => compile({ type: 'get' } as never)).toThrow();
    expect(() => compile({ type: 'get', id: 10 } as never)).toThrow();
  });

  test('should compile get expression with string id', () => {

    const getId = 'value';
    const expression: GetExpression = $get(getId);
    const resolve = compile<number>(expression);

    const value = rand(1, 100);
    const scope = createEnv(null, {
      [getId]: value,
    });

    const result = resolve(scope);
    expect(result).toBe(value);

  });

  test('should throw if not found', () => {

    const expression: GetExpression = $get('value');
    const resolve = compile(expression);

    const scope = createEnv();

    expect(() => resolve(scope)).toThrow();

  });

  test('should cache get expression', () => {

    const exp1: GetExpression = $get('value');
    const exp2: GetExpression = $get('value');

    const cache = {};

    expect(exp1).toEqual(exp2);
    expect(exp1).not.toBe(exp2);
    expect(compile(exp1, cache)).toBe(compile(exp2, cache));

  });

});
