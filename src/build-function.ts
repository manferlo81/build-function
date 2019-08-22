import { compileFunction } from "./compile";
import { createScope } from "./scope";
import { BuildFunctionOptions, Scope } from "./types";

export function build<F extends (...args: any[]) => any>(
  options: BuildFunctionOptions,
  scope?: Scope,
): F {
  return compileFunction(options, true)(scope || createScope(null)) as F;
}
