import { compileExp, createEnv, TernaryOperationExpression } from '../../src';
import { $get, $literal, $set, $ternary, $unary } from '../helpers/expressions';

describe('ternary expression', () => {

  test('should throw on invalid ternary expression', () => {

    const base = { type: 'ternary' };
    const invalid = [
      base,
      { ...base, condition: $literal(0) },
      { ...base, then: $literal(0) },
      { ...base, otherwise: $literal(0) },
      { ...base, condition: $literal(0), then: $literal(0) },
      { ...base, condition: $literal(0), otherwise: $literal(0) },
    ];

    invalid.forEach((expression) => {

      expect(() => compileExp(expression as never, {})).toThrow();

    });

  });

  test('should compile ternary expression', () => {

    const expression: TernaryOperationExpression = $ternary(
      $get('cond'),
      $literal('yes'),
      $literal('no'),
    );
    const resolve = compileExp<string>(expression, {});

    const negate = compileExp(
      $set(
        'cond',
        $unary(
          '!',
          $get('cond'),
        ),
      ),
      {},
    );

    const scope = createEnv(null, {
      cond: false,
    });

    expect(resolve(scope)).toBe('no');
    negate(scope);
    expect(resolve(scope)).toBe('yes');

  });

  test('should cache ternary expression', () => {

    const expression1: TernaryOperationExpression = $ternary(
      $get('cond'),
      $literal('yes'),
      $literal('no'),
    );
    const expression2: TernaryOperationExpression = $ternary(
      $get('cond'),
      $literal('yes'),
      $literal('no'),
    );

    const cache = {};
    const same = compileExp(expression1, cache) === compileExp(expression2, cache);

    expect(same).toBe(true);
  });

});
