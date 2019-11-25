import { compileFunc } from './compile'
import { createEnv } from './env'
import { Environment, NamedFunctionOptions } from './types'

export function build<F extends (...args: any[]) => any>(
  options: NamedFunctionOptions,
  env?: Environment,
): F {
  return compileFunc<F>(
    options,
    {},
    options.name,
  )(
    env || createEnv(null),
  )
}
