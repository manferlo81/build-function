import { compileStep, createEnv, ReturnStatement } from '../../src';
import { $get } from '../helpers/expressions';

describe('return statement step', () => {

  test('should throw on invalid return statement step', () => {

    const base = { type: 'return' };
    const invalid = [
      base,
    ];

    invalid.forEach((step) => {

      expect(() => compileStep(step as never, {})).toThrow();

    });

  });

  test('should compile return statement step', () => {

    const step: ReturnStatement = {
      type: 'return',
      value: $get('value'),
    };

    const resolve = compileStep(step, {});

    const scope = createEnv(null, {
      value: 'result',
    });

    const result = resolve(scope);

    expect(result).toEqual({ type: 'return', value: 'result' });

  });

  test('should cache return statement step', () => {

    const step1: ReturnStatement = {
      type: 'return',
      value: $get('value'),
    };
    const step2: ReturnStatement = {
      type: 'return',
      value: $get('value'),
    };

    const cache = {};
    const same = compileStep(step1, cache) === compileStep(step2, cache);

    expect(same).toBe(true);

  });

});
