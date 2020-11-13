import { compileExp, UnaryOperationExpression } from '../../src';
import { $get, $unary } from '../helpers/expressions';

describe('unknown transform expression', () => {

  test('should throw on invalid operation', () => {

    const expression: UnaryOperationExpression = $unary(
      '#' as never,
      $get('a'),
    );

    expect(() => compileExp(expression, {})).toThrow();

  });

});
