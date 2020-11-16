import { compileExp, createEnv, Expression, TernaryOperationExpression } from '../../src';
import { $get, $literal, $set, $ternary, $unary } from '../helpers/expressions';

describe('ternary expression', () => {

  const compile = <V = unknown>(exp: Expression, cache = {}) => compileExp<V>(exp, cache);

  test('should throw on invalid ternary expression', () => {
    expect(() => compile({ type: 'ternary', condition: $literal(0) } as never)).toThrow();
    expect(() => compile({ type: 'ternary', then: $literal(0) } as never)).toThrow();
    expect(() => compile({ type: 'ternary', otherwise: $literal(0) } as never)).toThrow();
    expect(() => compile({ type: 'ternary', condition: $literal(0), then: $literal(0) } as never)).toThrow();
    expect(() => compile({ type: 'ternary', condition: $literal(0), otherwise: $literal(0) } as never)).toThrow();
  });

  test('should compile ternary expression', () => {

    const expression: TernaryOperationExpression = $ternary(
      $get('cond'),
      $literal('yes'),
      $literal('no'),
    );
    const resolve = compile<string>(expression);

    const negate = compile(
      $set(
        'cond',
        $unary(
          '!',
          $get('cond'),
        ),
      ),
    );

    const scope = createEnv(null, {
      cond: false,
    });

    expect(resolve(scope)).toBe('no');
    negate(scope);
    expect(resolve(scope)).toBe('yes');

  });

  test('should cache ternary expression', () => {

    const exp1: TernaryOperationExpression = $ternary(
      $get('cond'),
      $literal('yes'),
      $literal('no'),
    );
    const exp2: TernaryOperationExpression = $ternary(
      $get('cond'),
      $literal('yes'),
      $literal('no'),
    );

    const cache = {};

    expect(exp1).toEqual(exp2);
    expect(exp1).not.toBe(exp2);
    expect(compile(exp1, cache)).toBe(compile(exp2, cache));
  });

});
