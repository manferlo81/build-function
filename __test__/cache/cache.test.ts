import { CompileCache, compileExp, compileStep, TernaryOperationExpression } from '../../src';
import { $get, $literal } from '../helpers/expressions';

describe('compile with cache', () => {

  test('should cache expression', () => {

    const exp1: TernaryOperationExpression = {
      type: 'ternary',
      condition: $get('cond'),
      then: $literal('yes'),
      otherwise: $literal('no'),
    };
    const exp2: TernaryOperationExpression = {
      type: 'ternary',
      condition: $get('cond'),
      then: $literal('yes'),
      otherwise: $literal('no'),
    };

    const cache: CompileCache = {};
    const same = compileExp(exp1, cache) === compileExp(exp2, cache);

    expect(same).toBe(true);
    expect(cache.exp && Object.keys(cache.exp).length).toBe(4);

  });

  test('should cache expression as step', () => {

    const exp1: TernaryOperationExpression = {
      type: 'ternary',
      condition: $get('cond'),
      then: $literal('yes'),
      otherwise: $literal('no'),
    };
    const exp2: TernaryOperationExpression = {
      type: 'ternary',
      condition: $get('cond'),
      then: $literal('yes'),
      otherwise: $literal('no'),
    };

    const cache: CompileCache = {};
    const same = compileStep(exp1, cache) === compileStep(exp2, cache);

    expect(same).toBe(true);
    expect(cache.exp && Object.keys(cache.exp).length).toBe(4);
    expect(cache.step && Object.keys(cache.step).length).toBe(1);

  });

});
