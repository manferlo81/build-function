import { BinaryOperationExpression, compileExp } from '../../src';
import { $binary, $get, $literal } from '../helpers/expressions';

describe('operation expression', () => {

  test('should throw on invalid operation expression', () => {

    const base = { type: 'oper' };
    const invalid = [
      base,
      { ...base, oper: '+' },
      { ...base, exp: [$literal(0), $literal(0)] },
    ];

    invalid.forEach((expression) => {

      expect(() => compileExp(expression as never, {})).toThrow();

    });

  });

  test('should throw if less than 2 operands', () => {

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const expression: BinaryOperationExpression = $binary(
      '+',
      $get('a'),
    );

    expect(() => compileExp(expression, {})).toThrow();

  });

  test('should cache operation expression', () => {

    const expression1: BinaryOperationExpression = $binary(
      '+',
      $get('a'),
      $literal(1),
    );
    const expression2: BinaryOperationExpression = $binary(
      '+',
      $get('a'),
      $literal(1),
    );

    const cache = {};
    const same = compileExp(expression1, cache) === compileExp(expression2, cache);

    expect(same).toBe(true);

  });

});
