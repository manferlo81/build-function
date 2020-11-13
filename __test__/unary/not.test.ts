import { compileExp, UnaryOperationExpression } from '../../src';
import { $literal, $unary } from '../helpers/expressions';
import { rand } from '../helpers/number';

describe('not transform expression', () => {

  test('should compile not transform expression', () => {

    const value = rand(0, 1, true);

    const expression: UnaryOperationExpression = $unary(
      '!',
      $literal(value),
    );
    const resolve = compileExp(expression, {});

    expect(resolve(null as never)).toBe(!value);

  });

});
