import { compileExp, createEnv, UnaryOperationExpression } from '../../src';
import { $get, $literal, $unary } from '../helpers/expressions';

describe('typeof transform expression', () => {

  test('should compile typeof transform expression', () => {

    const expression: UnaryOperationExpression = $unary(
      'typeof',
      $literal(10),
    );
    const resolve = compileExp(expression, {});

    expect(resolve(null as never)).toBe('number');

  });

  test('should compile typeof transform expression and don\'t throw if not in scope', () => {

    const expression: UnaryOperationExpression = $unary(
      'typeof',
      $get('notinscope'),
    );
    const resolve = compileExp(expression, {});

    const scope = createEnv(null);

    expect(resolve(scope)).toBe(typeof undefined);

  });

});
