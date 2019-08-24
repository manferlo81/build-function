import { errorNotInScope } from "./errors";
import { hasOwn } from "./helpers";
import { Scope, ScopeLib } from "./types";

export interface ScopeValue<V> {
  scope: Scope;
  id: string;
  value: V;
}

export function transformId(id: string): string {
  return `$_${id}`;
}

export function createScope(parent: Scope | null, lib?: ScopeLib | null): Scope {
  const scope: Scope = {
    parent,
  };
  if (lib) {
    for (const id in lib) {
      if (hasOwn.call(lib, id)) {
        setInScope(scope, id, lib[id]);
      }
    }
  }
  return scope;
}

export function findInScope<V = any>(scope: Scope, id: string): ScopeValue<V> | null | undefined | void {
  let current: Scope | null = scope;
  const tid = transformId(id);
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

export function findInScopeOrThrow<V = any>(scope: Scope, id: string): ScopeValue<V> {
  const result = findInScope<V>(scope, id);
  if (!result) {
    throw errorNotInScope(id);
  }
  return result;
}

export function setInScope<V>(scope: Scope, id: string, value: V): ScopeValue<V> {
  const tid = transformId(id);
  return {
    scope,
    id: tid,
    value: scope[tid] = value,
  };
}
