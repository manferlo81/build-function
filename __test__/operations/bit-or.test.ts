import { compileExp, OperationExpression } from '../../src';
import { $literal, $oper } from '../helpers/expressions';
import { rand } from '../helpers/number';

describe('bitwise or operation expression', () => {

  test('should compile bitwise or operation expression with 2 operands', () => {

    const a = rand(0, 10, true);
    const b = rand(0, 10, true);

    const expression: OperationExpression = $oper(
      '|',
      $literal(a),
      $literal(b),
    );
    const resolve = compileExp(expression, {});

    // tslint:disable-next-line: no-bitwise
    expect(resolve(null as any)).toBe(a | b);

  });

  test('should compile bitwise or operation expression with multiple operands', () => {

    const a = rand(0, 10, true);
    const b = rand(0, 10, true);
    const c = rand(0, 10, true);
    const d = rand(0, 10, true);

    const expression: OperationExpression = $oper(
      '|',
      $literal(a),
      $literal(b),
      $literal(c),
      $literal(d),
    );
    const resolve = compileExp(expression, {});

    // tslint:disable-next-line: no-bitwise
    expect(resolve(null as any)).toBe(a | b | c | d);

  });

});
