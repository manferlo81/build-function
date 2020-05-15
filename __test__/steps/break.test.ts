import {
  BreakStatement,
  CompileCache,
  compileExp,
  compileStep as _compileStep,
  FunctionExpression,
  FunctionStep,
} from '../../src';

describe('break statement step', () => {

  const compileStep = (step: FunctionStep, cache?: CompileCache) => (
    _compileStep(step, cache || {}, true)
  );

  test('should compile break statement step', () => {

    const step: BreakStatement = {
      type: 'break',
    };
    const resolve: () => 'break' = compileStep(step) as never;

    const result = resolve();

    expect(result).toEqual('break');

  });

  test('should throw if "break" outside loop', () => {

    const expression: FunctionExpression = {
      type: 'func',
      body: {
        type: 'break',
      },
    };

    expect(() => compileExp(expression, {})).toThrow();

  });

  test('should cache break statement step', () => {

    const step1: BreakStatement = {
      type: 'break',
    };
    const step2: BreakStatement = {
      type: 'break',
    };

    const cache = {};
    const same = compileStep(step1, cache) === compileStep(step2, cache);

    expect(same).toBe(true);

  });

});
