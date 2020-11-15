import {
  BlockStep,
  BreakStatement,
  CompileCache,
  compileExp,
  compileStep,
  FunctionExpression,
} from '../../src';

describe('break statement step', () => {

  const compile = (step: BlockStep, cache?: CompileCache) => (
    compileStep(step, cache || {}, true)
  );

  test('should compile break statement step', () => {

    const step: BreakStatement = {
      type: 'break',
    };
    const resolve: () => 'break' = compile(step) as never;

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
    const same = compile(step1, cache) === compile(step2, cache);

    expect(same).toBe(true);

  });

});
