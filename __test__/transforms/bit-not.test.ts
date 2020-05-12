import { compileExp, createEnv, TransformExpression } from '../../src';
import { $get, $trans } from '../helpers/expressions';

describe('bitwise not transform expression', () => {

  test('should compile bitwise not transform expression', () => {

    const expression: TransformExpression = $trans(
      '~',
      $get('value'),
    );
    const resolve = compileExp(expression, {});

    const value = 100;

    const scope = createEnv(null, {
      value,
    });

    // tslint:disable-next-line: no-bitwise
    expect(resolve(scope)).toBe(~value);

  });

});
