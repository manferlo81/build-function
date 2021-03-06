import { BinaryOperationExpression, compileExp } from '../../src';
import { $binary, $literal } from '../helpers/expressions';
import { rand } from '../helpers/number';

describe('power operation expression', () => {

  test('should compile power operation expression with 2 operands', () => {

    const base = rand(1, 10);
    const exp = rand(1, 4);

    const expression: BinaryOperationExpression = $binary(
      '**',
      $literal(base),
      $literal(exp),
    );
    const resolve = compileExp(expression, {});

    expect(resolve(null as never)).toBe(base ** exp);

  });

  test('should compile power operation expression with multiple operands', () => {

    const base = rand(1, 3);
    const exp1 = rand(1, 3);
    const exp2 = rand(1, 3);
    const exp3 = rand(1, 3);

    const expression: BinaryOperationExpression = $binary(
      '**',
      $literal(base),
      $literal(exp1),
      $literal(exp2),
      $literal(exp3),
    );
    const resolve = compileExp(expression, {});

    expect(resolve(null as never)).toBe(base ** exp1 ** exp2 ** exp3);

  });

});
