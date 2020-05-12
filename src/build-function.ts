import { compileFunc } from './compile'
import { createEnv } from './env'
import { BuildFunctionOptions, Environment } from './types'

type AnyFunction = (...args: any[]) => any

export function build<F extends AnyFunction>(
  options: BuildFunctionOptions,
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
