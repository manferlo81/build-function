import { compileExp, Expression } from '../../src';
import { $get, $literal, $unary } from '../helpers/expressions';

describe('transform expression', () => {

  const compile = (exp: Expression, cache = {}) => compileExp(exp, cache);

  test('should throw on invalid transform expression', () => {
    expect(() => compile({ type: 'trans' } as never)).toThrow();
    expect(() => compile({ type: 'trans', oper: '!' } as never)).toThrow();
    expect(() => compile({ type: 'trans', exp: $literal(0) } as never)).toThrow();
  });

  test('should cache transform expression', () => {

    const exp1 = $unary('!', $get('a'));
    const exp2 = $unary('!', $get('a'));

    const cache = {};

    expect(exp1).toEqual(exp2);
    expect(exp1).not.toBe(exp2);
    expect(compile(exp1, cache)).toBe(compile(exp2, cache));

  });

});
