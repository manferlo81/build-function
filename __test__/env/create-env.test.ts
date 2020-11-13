import { createEnv } from '../../src';

describe('createEnv method', () => {

  test('Should create environment', () => {
    const parent = null;
    expect(createEnv(parent)).toEqual({
      parent,
    });
  });

  test('Should create environment with parent', () => {
    const parent = createEnv(null);
    expect(createEnv(parent)).toEqual({
      parent,
    });
  });

});
