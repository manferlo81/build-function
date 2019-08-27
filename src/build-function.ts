import { compileFunc } from "./compile";
import { createScope } from "./scope";
import { NamedFunctionOptions, Scope } from "./types";

export function build<F extends (...args: any[]) => any>(
  options: NamedFunctionOptions,
  scope?: Scope,
): F {
  return compileFunc<F>(
    options,
    {},
    options.name,
  )(
    scope || createScope(null),
  );
}
