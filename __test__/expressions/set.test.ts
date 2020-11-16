import { addToEnv, compileExp, createEnv, Expression, SetExpression } from '../../src';
import { $get, $literal, $set } from '../helpers/expressions';
import { rand } from '../helpers/number';

describe('set expression', () => {

  const compile = <V = unknown>(exp: Expression, cache = {}) => compileExp<V>(exp, cache);

  test('should throw on invalid set expression', () => {
    expect(() => compile({ type: 'set' } as never)).toThrow();
    expect(() => compile({ type: 'set', id: 'id' } as never)).toThrow();
    expect(() => compile({ type: 'set', value: $literal(0) } as never)).toThrow();
    expect(() => compile({ type: 'set', id: 10, value: $literal(0) } as never)).toThrow();
  });

  test('should compile set expression with string id', () => {

    const id = 'value';
    const value = rand(1, 200);
    const expression: SetExpression = $set(
      id,
      $literal(value),
    );
    const setValue = compile<number>(expression);
    const getValue = compile($get(id));

    const initial = 100;
    const scope = createEnv(null, { [id]: initial });

    expect(getValue(scope)).toBe(initial);

    const valueSet = setValue(scope);

    expect(valueSet).toBe(value);
    expect(getValue(scope)).toBe(value);

  });

  test('should throw if not found', () => {
    const resolve = compile($set('value', $literal(true)));
    const scope = createEnv();
    expect(() => resolve(scope)).toThrow();
  });

  test('should throw if readonly', () => {

    const resolve = compile($set('value', $literal(true)));

    const env = createEnv();
    addToEnv(env, 'value', 10, true);

    expect(() => resolve(env)).toThrow();

  });

  test('should cache set expression', () => {

    const exp1 = $set('value', $literal(1));
    const exp2 = $set('value', $literal(1));

    const cache = {};

    expect(exp1).toEqual(exp2);
    expect(exp1).not.toBe(exp2);
    expect(compile(exp1, cache)).toBe(compile(exp2, cache));

  });

});
