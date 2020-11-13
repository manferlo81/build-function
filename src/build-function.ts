import { compileFunc } from './compile/compile';
import { createEnv } from './env';
import type { BuildFunctionOptions, Environment, UnknownFunction } from './types';

export function build<F extends UnknownFunction>(
  options: BuildFunctionOptions,
  env?: Environment,
): F {
  return compileFunc<F>(
    options,
    {},
    options.name,
  )(
    env || createEnv(null),
  );
}
