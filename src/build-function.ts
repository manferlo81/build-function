import { compileFunc } from "./compile";
import { createScope } from "./scope";
import { FunctionOptions, Scope } from "./types";

export function build<F extends (...args: any[]) => any>(
  options: FunctionOptions,
  scope?: Scope,
): F {
  return compileFunc(options, true)(scope || createScope(null)) as F;
}
