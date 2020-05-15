import { compileStep, StepThrow, ThrowStatement } from '../../src';
import { $literal } from '../helpers/expressions';

describe('throw error statement step', () => {

  test('should throw on invalid throw error statement step', () => {

    const invalid = { type: 'throw' };

    expect(() => compileStep(invalid as never, {})).toThrow();

  });

  test('should compile throw error statement step using string message', () => {

    const errorMessage = 'error message';

    const step: ThrowStatement = {
      type: 'throw',
      msg: errorMessage,
    };
    const resolve = compileStep(step, {});

    const result = resolve(null as never);

    expect(result).toEqual({
      type: 'throw',
      msg: errorMessage,
    });

  });

  test('should compile throw error statement step using expression message', () => {

    const errorMessage = 'error message';

    const step: ThrowStatement = {
      type: 'throw',
      msg: $literal(errorMessage),
    };
    const resolve = compileStep(step, {});

    const result = resolve(null as never) as StepThrow;

    expect(result).toEqual({
      type: 'throw',
      msg: errorMessage,
    });

  });

  test('should cache throw statement step', () => {

    const step1: ThrowStatement = {
      type: 'throw',
      msg: 'value',
    };
    const step2: ThrowStatement = {
      type: 'throw',
      msg: 'value',
    };

    const cache = {};
    const same = compileStep(step1, cache) === compileStep(step2, cache);

    expect(same).toBe(true);

  });

});
