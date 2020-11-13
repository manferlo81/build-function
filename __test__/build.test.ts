import { build } from '../src';
import { $binary, $get, $return } from './helpers/expressions';
import { rand } from './helpers/number';

describe('build function', () => {

  test('should build function', () => {

    const func = build({
      params: ['a', 'b'],
      body: $return(
        $binary(
          '+',
          $get('a'),
          $get('b'),
        ),
      ),
    });

    const a = rand(1, 50);
    const b = rand(1, 50);

    expect(func(a, b)).toBe(a + b);

  });

  test('should add itself to scope if name provided', () => {

    const func = build<() => () => unknown>({
      name: 'func',
      body: $return(
        $get('func'),
      ),
    });

    const result = func();

    expect(result).toBe(func);

  });

});
