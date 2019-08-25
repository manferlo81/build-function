import { hasOwn } from "./helpers";
import { EnvLib, EnvValue, LexicalEnvironment } from "./types";

const pre = "$_";

export function createEnv(parent: LexicalEnvironment | null, lib?: EnvLib | null): LexicalEnvironment {

  const scope: LexicalEnvironment = parent ? { parent } : {};

  if (lib) {
    for (const id in lib) {
      if (hasOwn.call(lib, id)) {
        setInEnv(scope, id, lib[id]);
      }
    }
  }

  return scope;

}

export function findInEnv<V = any>(env: LexicalEnvironment, id: string): EnvValue<V> | void {

  const tid = pre + id;

  let current: LexicalEnvironment | undefined = env;

  while (current) {

    if (hasOwn.call(current, tid)) {
      return {
        env: current,
        id: tid,
        value: current[tid],
      };
    }

    current = current.parent;

  }

}

export function setInEnv<V>(env: LexicalEnvironment, id: string, value: V): void {
  env[pre + id] = value;
}
