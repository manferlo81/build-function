import { hasOwn } from "./helpers";
import { Scope, ScopeLib, ScopeValue } from "./types";

const pre = "$_";

export function createScope(parent: Scope | null, lib?: ScopeLib | null): Scope {

  const scope: Scope = parent ? { parent } : {};

  if (lib) {
    for (const id in lib) {
      if (hasOwn.call(lib, id)) {
        setInScope(scope, id, lib[id]);
      }
    }
  }

  return scope;

}

export function findInScope<V = any>(scope: Scope, id: string): ScopeValue<V> | void {

  const tid = pre + id;

  let current: Scope | undefined = scope;

  while (current) {

    if (hasOwn.call(current, tid)) {
      return {
        scope: current,
        id: tid,
        value: current[tid],
      };
    }

    current = current.parent;

  }

}

export function setInScope<V>(scope: Scope, id: string, value: V): void {
  scope[pre + id] = value;
}
