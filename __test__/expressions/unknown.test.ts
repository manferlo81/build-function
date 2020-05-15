import { compileExp } from '../../src';

describe('unknown expression', () => {

  test('should throw on unknown expression', () => {

    const invalid = [undefined, null];

    invalid.forEach((value) => {
      expect(() => compileExp(value as never, {})).toThrow();
    });

  });

  test('should throw on unknown expression type', () => {

    const expression: any = {
      type: 'unknown',
    };

    expect(() => compileExp(expression, {})).toThrow();

  });

});
