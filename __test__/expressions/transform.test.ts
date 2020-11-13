import { compileExp, UnaryOperationExpression } from '../../src';
import { $get, $literal, $unary } from '../helpers/expressions';

describe('transform expression', () => {

  test('should throw on invalid transform expression', () => {

    const base = { type: 'trans' };
    const invalid = [
      base,
      { ...base, oper: '!' },
      { ...base, exp: $literal(0) },
    ];

    invalid.forEach((expression) => {

      expect(() => compileExp(expression as never, {})).toThrow();

    });

  });

  test('should cache transform expression', () => {

    const expression1: UnaryOperationExpression = $unary(
      '!',
      $get('a'),
    );
    const expression2: UnaryOperationExpression = $unary(
      '!',
      $get('a'),
    );

    const cache = {};
    const same = compileExp(expression1, cache) === compileExp(expression2, cache);

    expect(same).toBe(true);
  });

});
