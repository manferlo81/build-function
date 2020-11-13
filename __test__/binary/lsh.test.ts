import { BinaryOperationExpression, compileExp } from '../../src';
import { $binary, $literal } from '../helpers/expressions';
import { rand } from '../helpers/number';

describe('shift left operation expression', () => {

  test('should compile shift left operation expression with 2 operands', () => {

    const a = -rand(1, 10, true);
    const b = rand(1, 8, true);

    const expression: BinaryOperationExpression = $binary(
      '<<',
      $literal(a),
      $literal(b),
    );
    const resolve = compileExp(expression, {});

    expect(resolve(null as never)).toBe(a << b);

  });

  test('should compile shift left operation expression with multiple operands', () => {

    const a = -rand(1, 8, true);
    const b = rand(1, 3, true);
    const c = rand(1, 3, true);
    const d = rand(1, 3, true);

    const expression: BinaryOperationExpression = $binary(
      '<<',
      $literal(a),
      $literal(b),
      $literal(c),
      $literal(d),
    );
    const resolve = compileExp(expression, {});

    expect(resolve(null as never)).toBe(a << b << c << d);

  });

});
