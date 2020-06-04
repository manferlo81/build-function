import { compileExp, OperationExpression } from '../../src';
import { $get, $oper } from '../helpers/expressions';

describe('unknown operation expression', () => {

  test('should throw on unknown operation expression', () => {

    const expression: OperationExpression = $oper(
      '?' as never,
      $get('a'),
      $get('b'),
    );

    expect(() => compileExp(expression, {})).toThrow();

  });

});
