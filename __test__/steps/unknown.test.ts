import { compileStep } from '../../src';

describe('unknown step', () => {

  test('should throw on unknown step', () => {

    const invalid = [
      undefined,
      null,
    ];

    invalid.forEach((value) => {
      expect(() => compileStep(value as never, {})).toThrow();
    });

  });

  test('should throw on unknown step type', () => {

    const step = {
      type: 'unknown',
    };

    expect(() => compileStep(step as never, {})).toThrow();

  });

});
