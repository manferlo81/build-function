import { createEnv, setInEnv, findInEnv, Environment } from '../../src';

describe('setInEnv method', () => {

  test('Should set value in', () => {

    const env = createEnv();
    const key = 'key';
    const value = 'value';

    setInEnv(env, key, value);

    const maybeFound = findInEnv(env, key, true);
    expect(maybeFound).toEqual({
      env,
      id: expect.any(String) as unknown,
    });

    const found = maybeFound as { env: Environment; id: string };
    expect(found.env.values[found.id].value).toBe(value);

  });

});
