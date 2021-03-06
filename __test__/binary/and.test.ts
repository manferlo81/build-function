import { BinaryOperationExpression, compileExp } from '../../src';
import { $binary, $literal } from '../helpers/expressions';
import { rand } from '../helpers/number';

describe('and operation expression', () => {

  test('should compile and operation expression with 2 operands', () => {

    const a = rand(0, 1, true);
    const b = [false, true][rand(0, 1, true)];

    const expression: BinaryOperationExpression = $binary(
      '&&',
      $literal(a),
      $literal(b),
    );
    const resolve = compileExp(expression, {});

    expect(resolve(null as never)).toBe(a && b);

  });

  test('should compile and operation expression with mutiple operands', () => {

    const a = rand(0, 1, true);
    const b = [false, true][rand(0, 1, true)];
    const c = ['', 'string'][rand(0, 1, true)];
    const d = [null, {}][rand(0, 1, true)];

    const expression: BinaryOperationExpression = $binary(
      '&&',
      $literal(a),
      $literal(b),
      $literal(c),
      $literal(d),
    );
    const resolve = compileExp(expression, {});

    expect(resolve(null as never)).toEqual(a && b && c && d);

  });

});
