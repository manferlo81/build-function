import { compileExp } from '../../src';

describe('unknown expression', () => {

  test('should throw on unknown expression', () => {

    expect(() => compileExp(undefined as any, {})).toThrow();
    expect(() => compileExp(null as any, {})).toThrow();

  });

  test('should throw on unknown expression type', () => {

    const expression: any = {
      type: 'unknown',
    };

    expect(() => compileExp(expression, {})).toThrow();

  });

});
