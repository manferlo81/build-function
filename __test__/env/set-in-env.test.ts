import { createEnv, setInEnv, findInEnv } from '../../src';

describe('setInEnv method', () => {

  test('Should set value in', () => {

    const env = createEnv(null);
    const key = 'key';
    const value = 'value';

    setInEnv(env, key, value);

    const maybeFound = findInEnv(env, key, true);
    expect(maybeFound).toEqual({
      env,
      id: expect.any(String) as unknown,
    });

    const found = maybeFound as { env: Record<string, unknown>, id: string };
    expect(found.env[found.id]).toBe(value);

  });

});
