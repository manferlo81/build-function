import { BinaryOperationExpression, compileExp, LiteralExpression } from '../../src';
import { $binary, $literal } from '../helpers/expressions';

describe('nullish coalescing operation expression', () => {

  test('should compile nullish coalescing operation expression with 2 operands', () => {

    const value = [
      { a: null, b: 10, expected: 10 },
      { a: null, b: false, expected: false },
      { a: null, b: 0, expected: 0 },
      { a: 0, b: 10, expected: 0 },
      { a: false, b: 10, expected: false },
    ];

    value.forEach(({ a, b, expected }) => {

      const expression: BinaryOperationExpression = $binary(
        '??',
        $literal(a),
        $literal(b),
      );
      const resolve = compileExp(expression, {});

      expect(resolve(null as never)).toBe(expected);

    });

  });

  test('should compile nullish coalescing operation expression with mutiple operands', () => {

    const values = [
      { exp: [null, 10, 0], expected: 10 },
      { exp: [null, 0, 2], expected: 0 },
      { exp: [0, null, 2], expected: 0 },
    ];

    values.forEach(({ exp, expected }) => {

      const expression: BinaryOperationExpression = $binary(
        '??',
        ...exp.map((value) => $literal(value)) as [LiteralExpression, LiteralExpression, ...LiteralExpression[]],
      );
      const resolve = compileExp(expression, {});

      expect(resolve(null as never)).toEqual(expected);

    });

  });

});
