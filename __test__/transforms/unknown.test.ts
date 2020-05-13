import { compileExp, UnaryOperationExpression } from '../../src';
import { $get, $trans } from '../helpers/expressions';

describe('unknown transform expression', () => {

  test('should throw on invalid operation', () => {

    const expression: UnaryOperationExpression = $trans(
      '#' as never,
      $get('a'),
    );

    expect(() => compileExp(expression, {})).toThrow();

  });

});
