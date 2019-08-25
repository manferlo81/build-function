import { compileFunction } from "./compile";
import { createEnv } from "./env";
import { BuildFunctionOptions, LexicalEnvironment } from "./types";

export function build<F extends (...args: any[]) => any>(
  options: BuildFunctionOptions,
  scope?: LexicalEnvironment,
): F {
  return compileFunction(options, true)(scope || createEnv(null)) as F;
}
