import { hasOwn } from './helpers';
import type { EnvFound, Environment, EnvLib } from './types';

const pre = '0$_';

export function addToEnv<V = unknown>(env: Environment<V>, id: string, value: V, readonly?: boolean): void {
  env.values[pre + id] = { readonly: !!readonly, value };
}

export function createEnv<V = unknown>(parent?: Environment | null, lib?: EnvLib<V> | null): Environment<V> {

  const env: Environment<V> = { parent: parent ?? null, values: {} };

  if (lib) {
    for (const id in lib) {
      if (hasOwn.call(lib, id)) {
        // TODO: Lib members should be declared as constants
        addToEnv<V>(env, id, lib[id]);
      }
    }
  }

  return env;

}

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export function findInEnv<V = unknown>(env: Environment, id: string, topOnly?: boolean): EnvFound<V> | void {

  const tid = pre + id;

  let current: Environment | null = env;

  while (current) {

    if (hasOwn.call(current.values, tid)) {
      return {
        env: current as Environment<V>,
        id: tid,
      };
    }

    if (topOnly) {
      return;
    }

    current = current.parent;

  }

}
