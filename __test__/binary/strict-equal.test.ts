import { BinaryOperationExpression, compileExp } from '../../src';
import { $binary, $literal } from '../helpers/expressions';
import { rand } from '../helpers/number';

describe('strict equal operation expression', () => {

  test('should compile strict equal operation expression with 2 operands', () => {

    const a = rand(0, 1, true);
    const b = rand(0, 1, true);

    const expression: BinaryOperationExpression = $binary(
      '===',
      $literal(a),
      $literal(b),
    );
    const resolve = compileExp(expression, {});

    expect(resolve(null as never)).toBe(a === b);

  });

  test('should compile strict equal operation expression with multiple operands', () => {

    const a = rand(0, 1, true);
    const b = rand(0, 1, true);
    const c = !rand(0, 1, true);
    const d = !rand(0, 1, true);

    const expression: BinaryOperationExpression = $binary(
      '===',
      $literal(a),
      $literal(b),
      $literal(c),
      $literal(d),
    );
    const resolve = compileExp(expression, {});

    expect(resolve(null as never)).toBe(a === b === c === d);

  });

  test('should use strict equals', () => {

    const expression: BinaryOperationExpression = $binary(
      '===',
      $literal('10'),
      $literal(10),
    );
    const resolve = compileExp(expression, {});

    expect(resolve(null as never)).toBe(false);

  });

});
