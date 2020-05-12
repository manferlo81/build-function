import { compileExp, OperationExpression } from '../../src';
import { $literal, $oper } from '../helpers/expressions';
import { rand } from '../helpers/number';

describe('divide operation expression', () => {

  test('should compile divide operation expression with 2 operands', () => {

    const a = rand(1, 10);
    const b = rand(1, 10);

    const expression: OperationExpression = $oper(
      '/',
      $literal(a),
      $literal(b),
    );
    const resolve = compileExp(expression, {});

    expect(resolve(null as any)).toBe(a / b);

  });

  test('should compile divide operation expression with multiple operands', () => {

    const a = rand(1, 10);
    const b = rand(1, 10);
    const c = rand(1, 10);
    const d = rand(1, 10);

    const expression: OperationExpression = $oper(
      '/',
      $literal(a),
      $literal(b),
      $literal(c),
      $literal(d),
    );
    const resolve = compileExp(expression, {});

    expect(resolve(null as any)).toBe(a / b / c / d);

  });

});
