import { BinaryOperationExpression, compileExp } from '../../src';
import { $binary, $literal } from '../helpers/expressions';
import { rand } from '../helpers/number';

describe('subtract operation expression', () => {

  test('should compile subtract operation expression with 2 operands', () => {

    const a = rand(-10, 10);
    const b = rand(-10, 10);

    const expression: BinaryOperationExpression = $binary(
      '-',
      $literal(a),
      $literal(b),
    );
    const resolve = compileExp(expression, {});

    expect(resolve(null as never)).toBe(a - b);

  });

  test('should compile subtract operation expression with multiple operands', () => {

    const a = rand(-10, 10);
    const b = rand(-10, 10);
    const c = rand(-10, 10);
    const d = rand(-10, 10);

    const expression: BinaryOperationExpression = $binary(
      '-',
      $literal(a),
      $literal(b),
      $literal(c),
      $literal(d),
    );
    const resolve = compileExp(expression, {});

    expect(resolve(null as never)).toBe(a - b - c - d);

  });

});
