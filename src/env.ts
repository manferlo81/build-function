import { hasOwn } from './helpers';
import type { EnvFound, Environment, EnvLib } from './types';

const pre = '0$_';

export function addToEnv<V>(env: Environment, id: string, value: V, readonly?: boolean): void {
  env.values[pre + id] = { readonly: !!readonly, value };
}

export function createEnv(parent: Environment | null, lib?: EnvLib | null): Environment {

  const env: Environment = { parent, values: {} };

  if (lib) {
    for (const id in lib) {
      if (hasOwn.call(lib, id)) {
        addToEnv(env, id, lib[id]);
      }
    }
  }

  return env;

}

export function findInEnv(env: Environment, id: string, topOnly?: boolean): EnvFound | void {

  const tid = pre + id;

  let current: Environment | null = env;

  while (current) {

    if (hasOwn.call(current.values, tid)) {
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
