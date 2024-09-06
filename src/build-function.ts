import { compileFunc } from './compile/compile';
import { createEnv } from './env';
import type { BuildFunctionOptions, Environment, UnknownFunction } from './types';

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function build<F extends UnknownFunction>(
  options: BuildFunctionOptions,
  env?: Environment,
): F {
  return compileFunc<F>(
    options,
    {},
    options.name,
  )(
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    env || createEnv(),
  );
}
