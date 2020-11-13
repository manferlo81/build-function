import { BinaryOperationExpression, compileExp } from '../../src';
import { $binary, $get } from '../helpers/expressions';

describe('unknown operation expression', () => {

  test('should throw on unknown operation expression', () => {

    const expression: BinaryOperationExpression = $binary(
      '?' as never,
      $get('a'),
      $get('b'),
    );

    expect(() => compileExp(expression, {})).toThrow();

  });

});
