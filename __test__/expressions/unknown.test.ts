import { compileExp } from '../../src';

describe('unknown expression', () => {

  test('should throw on unknown expression', () => {
    expect(() => compileExp(undefined as never, {})).toThrow();
    expect(() => compileExp(null as never, {})).toThrow();
  });

  test('should throw on unknown expression type', () => {
    expect(() => compileExp({ type: 'unknown' } as never, {})).toThrow();
  });

});
