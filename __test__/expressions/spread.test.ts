import { SpreadableExpression } from '../../src';
import { compileSpread } from '../../src/compile/compile';
import { $literal } from '../helpers/expressions';

describe('spread expression', () => {

  const compile = (exp: SpreadableExpression | SpreadableExpression[], cache = {}) => compileSpread(exp, cache);

  test('should compile spread expression', () => {

    const array = [1, 2, 3];
    const expressions: SpreadableExpression[] = [
      $literal(0),
      {
        type: 'spread',
        exp: $literal(array),
      },
    ];

    const resolve = compile(expressions);

    expect(resolve(null as never, [])).toEqual([0, ...array]);

  });

  test('should return null on empty array', () => {
    expect(compile([])).toBeNull();
  });

  test('should cache single spread expression', () => {

    const exp1: SpreadableExpression = {
      type: 'spread',
      exp: $literal([1, 2, 3]),
    };
    const exp2: SpreadableExpression = {
      type: 'spread',
      exp: $literal([1, 2, 3]),
    };

    const cache = {};

    expect(exp1).toEqual(exp2);
    expect(exp1).not.toBe(exp2);
    expect(compile(exp1, cache)).toBe(compile(exp2, cache));

  });

  test('should cache single & multi spread expression', () => {

    const exp1: SpreadableExpression = {
      type: 'spread',
      exp: $literal([1, 2, 3]),
    };
    const exp2: SpreadableExpression[] = [
      {
        type: 'spread',
        exp: $literal([1, 2, 3]),
      },
    ];

    const cache = {};

    expect(compile(exp1, cache)).toBe(compile(exp2, cache));

  });

  test('should cache multiple spread expression', () => {

    const exp1: SpreadableExpression[] = [
      $literal(0),
      {
        type: 'spread',
        exp: $literal([1, 2, 3]),
      },
    ];
    const exp2: SpreadableExpression[] = [
      $literal(0),
      {
        type: 'spread',
        exp: $literal([1, 2, 3]),
      },
    ];

    const cache = {};

    expect(compile(exp1, cache)).toBe(compile(exp2, cache));

  });

});
