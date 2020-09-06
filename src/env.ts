import { hasOwn } from './helpers';
import { EnvFound, Environment, EnvLib } from './types';

const pre = '0$_';

export function setInEnv<V>(env: Environment, id: string, value: V): void {
  env[pre + id] = value;
}

export function createEnv(parent: Environment | null, lib?: EnvLib | null): Environment {

  const env: Environment = { parent };

  if (lib) {
    for (const id in lib) {
      if (hasOwn.call(lib, id)) {
        setInEnv(env, id, lib[id]);
      }
    }
  }

  return env;

}

export function findInEnv(env: Environment, id: string, topOnly?: boolean): EnvFound | void {

  const tid = pre + id;

  let current: Environment | null = env;

  while (current) {

    if (hasOwn.call(current, tid)) {
      return {
        env: current,
        id: tid,
      };
    }

    if (topOnly) {
      return;
    }

    current = current.parent;

  }

}
