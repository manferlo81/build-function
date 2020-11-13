import { BinaryOperationExpression, compileExp } from '../../src';
import { $binary, $literal } from '../helpers/expressions';
import { rand } from '../helpers/number';

describe('greater than operation expression', () => {

  test('should compile greater than operation expression with 2 operands', () => {

    const a = rand(0, 2);
    const b = rand(0, 2);

    const expression: BinaryOperationExpression = $binary(
      '>',
      $literal(a),
      $literal(b),
    );
    const resolve = compileExp(expression, {});

    expect(resolve(null as never)).toBe(a > b);

  });

  test('should compile greater than operation expression with multiple operands', () => {

    const a = rand(0, 2);
    const b = rand(0, 2);
    const c = 0;

    const expression: BinaryOperationExpression = $binary(
      '>',
      $literal(a),
      $literal(b),
      $literal(c),
    );
    const resolve = compileExp(expression, {});

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(resolve(null as never)).toBe(a > b > c);

  });

});
