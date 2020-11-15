import { compileExp, compileStep, createEnv, LetStatement } from '../../src';
import { $get, $literal } from '../helpers/expressions';

describe('let statement step', () => {

  test('should throw on invalid let statement step', () => {

    const invalid = { type: 'let' };

    expect(() => compileStep(invalid as never, {})).toThrow();

  });

  test('should compile single let statement step with single value', () => {

    const step: LetStatement = {
      type: 'let',
      declare: { id: 'value', value: $literal(true) },
    };
    const resolve = compileStep(step, {});

    const getValue = compileExp(
      $get('value'),
      {},
    );

    const scope = createEnv();

    expect(() => getValue(scope)).toThrow();

    const result = resolve(scope);

    expect(result).toBeUndefined();
    expect(getValue(scope)).toBe(true);

  });

  test('should compile multiple let statement step with multiple values', () => {

    const step: LetStatement = {
      type: 'let',
      declare: [
        { id: 'value1', value: $literal(true) },
        { id: 'value2', value: $literal(true) },
      ],
    };
    const resolve = compileStep(step, {});

    const getValue1 = compileExp(
      $get('value1'),
      {},
    );
    const getValue2 = compileExp(
      $get('value2'),
      {},
    );

    const scope = createEnv();

    expect(() => getValue1(scope)).toThrow();
    expect(() => getValue2(scope)).toThrow();

    const result = resolve(scope);

    expect(result).toBeUndefined();
    expect(getValue1(scope)).toBe(true);
    expect(getValue2(scope)).toBe(true);

  });

  test('should compile let statement step without value', () => {

    const step: LetStatement = {
      type: 'let',
      declare: [
        'value1',
        'value2',
      ],
    };
    const resolve = compileStep(step, {});

    const getValue1 = compileExp(
      $get('value1'),
      {},
    );
    const getValue2 = compileExp(
      $get('value2'),
      {},
    );

    const scope = createEnv();

    const result = resolve(scope);

    expect(result).toBeUndefined();
    expect(getValue1(scope)).toBeUndefined();
    expect(getValue2(scope)).toBeUndefined();

  });

  test('should compile let statement step with empty array', () => {

    const step: LetStatement = {
      type: 'let',
      declare: [],
    };
    const resolve = compileStep(step, {});

    const scope = createEnv();
    const result = resolve(scope);

    expect(result).toBeUndefined();

  });

  test('should throw if already been declared', () => {

    const step: LetStatement = {
      type: 'let',
      declare: 'value1',
    };
    const resolve = compileStep(step, {});

    const scope = createEnv();

    resolve(scope);
    expect(() => resolve(scope)).toThrow();

  });

  test('should cache let statement step', () => {

    const step1: LetStatement = {
      type: 'let',
      declare: [
        'value1',
        'value2',
      ],
    };
    const step2: LetStatement = {
      type: 'let',
      declare: [
        'value1',
        'value2',
      ],
    };

    const cache = {};
    const same = compileStep(step1, cache) === compileStep(step2, cache);

    expect(same).toBe(true);

  });

});
