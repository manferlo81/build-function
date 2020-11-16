import { compileExp, Expression } from '../../src';
import { $literal } from '../helpers/expressions';
import { rand } from '../helpers/number';

describe('literal expression', () => {

  const compile = <V = unknown>(exp: Expression, cache = {}) => compileExp<V>(exp, cache);

  test('should throw on invalid literal expression', () => {
    expect(() => compile({ type: 'literal' } as never)).toThrow();
  });

  test('should compile literal expression', () => {

    const value = rand(1, 20);
    const resolve = compile($literal(value));

    const result = resolve(null as never);

    expect(result).toBe(value);

  });

  test('should cache literal expression is value is native', () => {

    const exp1 = $literal('value');
    const exp2 = $literal('value');

    const cache = {};

    expect(exp1).toEqual(exp2);
    expect(exp1).not.toBe(exp2);
    expect(compile(exp1, cache)).toBe(compile(exp2, cache));

  });

  test('should regenerate literal expression on resolve', () => {

    const obj0 = { value: 10 };
    const expression = $literal(obj0);
    const resolve = compile(expression);

    const obj1 = resolve(null as never);
    const obj2 = resolve(null as never);

    expect(obj1).toEqual(obj0);
    expect(obj1).toEqual(obj2);
    expect(obj1).not.toBe(obj2);

  });

});
