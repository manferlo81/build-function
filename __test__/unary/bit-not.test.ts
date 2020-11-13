import { compileExp, createEnv, UnaryOperationExpression } from '../../src';
import { $get, $unary } from '../helpers/expressions';

describe('bitwise not transform expression', () => {

  test('should compile bitwise not transform expression', () => {

    const expression: UnaryOperationExpression = $unary(
      '~',
      $get('value'),
    );
    const resolve = compileExp(expression, {});

    const value = 100;

    const scope = createEnv(null, {
      value,
    });

    expect(resolve(scope)).toBe(~value);

  });

});
