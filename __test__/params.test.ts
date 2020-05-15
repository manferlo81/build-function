import { compileParam } from '../src/compile/compile';

describe('compile function parameters', () => {

  test('should return null on empty array', () => {

    expect(compileParam([], {})).toBeNull();

  });

});
