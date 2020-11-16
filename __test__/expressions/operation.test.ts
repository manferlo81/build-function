import { compileExp, Expression } from '../../src';
import { $binary, $get, $literal } from '../helpers/expressions';

describe('operation expression', () => {

  const compile = (exp: Expression, cache = {}) => compileExp(exp, cache);

  test('should throw on invalid operation expression', () => {
    expect(() => compile({ type: 'oper' } as never)).toThrow();
    expect(() => compile({ type: 'oper', oper: '+' } as never)).toThrow();
    expect(() => compile({ type: 'oper', exp: [$literal(0), $literal(0)] } as never)).toThrow();
  });

  test('should throw if less than 2 operands', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(() => compile($binary('+', $get('a')))).toThrow();
  });

  test('should cache operation expression', () => {

    const exp1 = $binary('+', $get('a'), $literal(1));
    const exp2 = $binary('+', $get('a'), $literal(1));

    const cache = {};

    expect(exp1).toEqual(exp2);
    expect(exp1).not.toBe(exp2);
    expect(compileExp(exp1, cache)).toBe(compileExp(exp2, cache));

  });

});
