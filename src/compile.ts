/* eslint-disable @typescript-eslint/no-use-before-define */

import { createEnv, findInEnv, setInEnv } from './env'
import { error, errorExpReq, errorInvalid, errorInvalidType, errorNotInEnv, errorStmnReq } from './errors'
import { hash } from './hash'
import { AnyFunction, ExpressionCompiler, ExpressionLookupTable, SingleOrMulti, StatementLookupTable, StepCompiler } from './helper-types'
import { hasOwn, returning } from './helpers'
import { isArray, isObj } from './type-check'
import { ArgsLibPopulator, CompileCache, DeclareWithValue, EnvBasedPopulator, EnvBasedResolver, EnvLib, Expression, FunctionBase, FunctionParameter, FunctionParameterDescriptor, FunctionStep, ParameterType, RegularArithmeticOperator, RegularOperator, RegularTransformOperator, SpecialOperator, SpreadableExpression, StatementType, StepLoopResult, StepNonLoopResult, VariableDeclaration } from './types'


// LOOKUP TABLES

const paramTable: Record<
  ParameterType,
  (index: number) => (input: any[]) => any
> = {

  rest: (index) => {

    return (input) => {

      const arg: any[] = []
      const len = input.length

      for (let i = index; i < len; i++) {
        arg.push(
          input[i],
        )
      }

      return arg

    }

  },

  param: (index) => (input) => input[index],

}

const specialOperTable: Record<
  SpecialOperator,
  (resolvers: EnvBasedResolver[]) => EnvBasedResolver
> = {

  '||': (resolvers) => {

    const len = resolvers.length

    return (env) => {

      let result

      for (let i = 0; i < len; i++) {

        result = resolvers[i](env)

        if (result) {
          break
        }

      }

      return result

    }

  },

  '&&': (resolvers) => {

    const len = resolvers.length

    return (env) => {

      let result

      for (let i = 0; i < len; i++) {

        result = resolvers[i](env)

        if (!result) {
          break
        }

      }

      return result

    }

  },

  '**': (resolvers) => {

    const resolveLast = resolvers.pop() as EnvBasedResolver

    return (env) => {

      let result = resolveLast(env)
      let i = resolvers.length - 1

      while (i >= 0) {
        result = resolvers[i](env) ** result
        i--
      }

      return result

    }

  },

}

const operTable: Record<
  RegularOperator,
  (total: any, value: any) => any
> = {
  '+': (total, value) => (total + value),
  '-': (total, value) => (total - value),
  '*': (total, value) => (total * value),
  '/': (total, value) => (total / value),
  '%': (total, value) => (total % value),
  // tslint:disable-next-line: no-bitwise
  '&': (total, value) => (total & value),
  // tslint:disable-next-line: no-bitwise
  '|': (total, value) => (total | value),
  // tslint:disable-next-line: no-bitwise
  '^': (total, value) => (total ^ value),
  // tslint:disable-next-line: no-bitwise
  '<<': (total, value) => (total << value),
  // tslint:disable-next-line: no-bitwise
  '>>': (total, value) => (total >> value),
  // tslint:disable-next-line: no-bitwise
  '>>>': (total, value) => (total >>> value),
  // tslint:disable-next-line: triple-equals
  '==': (total, value) => (total == value),
  '===': (total, value) => (total === value),
  // tslint:disable-next-line: triple-equals
  '!=': (total, value) => (total != value),
  '!==': (total, value) => (total !== value),
  '>': (total, value) => (total > value),
  '<': (total, value) => (total < value),
  '>=': (total, value) => (total >= value),
  '<=': (total, value) => (total <= value),
}

const transTable: Record<RegularTransformOperator, (value: any) => any> = {
  '!': (value) => !value,
  '!!': (value) => !!value,
  // tslint:disable-next-line: no-bitwise
  '~': (value) => ~value,
}

const expTable: ExpressionLookupTable = {

  literal(exp) {

    if (!hasOwn.call(exp, 'value')) {
      throw errorExpReq('value', 'literal')
    }

    const { value } = exp

    const valueType = typeof value

    if (valueType === 'string' || valueType === 'number' || valueType === 'boolean') {
      return returning(value)
    }

    const serialized = JSON.stringify(value)

    return () => JSON.parse(serialized)

  },

  get(exp, cache, safe) {

    if (!hasOwn.call(exp, 'id')) {
      throw errorExpReq('id', 'get')
    }

    if (typeof exp.id !== 'string') {
      throw error('A "get" expression "id" must be a string')
    }

    const { id } = exp

    return (env) => {

      const result = findInEnv(env, id)

      if (!result) {
        if (!safe) {
          throw errorNotInEnv(id)
        }
        return
      }

      return result.env[result.id]

    }

  },

  set(exp, cache) {

    if (!hasOwn.call(exp, 'id')) {
      throw errorExpReq('id', 'set')
    }

    if (!hasOwn.call(exp, 'value')) {
      throw errorExpReq('value', 'set')
    }

    if (typeof exp.id !== 'string') {
      throw error('A "set" expression "id" must be a string')
    }

    const { id } = exp
    const resolveValue = compileExp(exp.value, cache)

    return (env) => {

      const result = findInEnv(env, id)

      if (!result) {
        throw errorNotInEnv(id)
      }

      return result.env[result.id] = resolveValue(env)

    }

  },

  ternary(exp, cache) {

    if (!hasOwn.call(exp, 'condition')) {
      throw errorExpReq('condition', 'ternary')
    }

    if (!hasOwn.call(exp, 'then')) {
      throw errorExpReq('then', 'ternary')
    }

    if (!hasOwn.call(exp, 'otherwise')) {
      throw errorExpReq('otherwise', 'ternary')
    }

    const resolveCondition = compileExp(exp.condition, cache)
    const resolveThen = compileExp(exp.then, cache)
    const resolveOtherwise = compileExp(exp.otherwise, cache)

    return (env) => resolveCondition(env)
      ? resolveThen(env)
      : resolveOtherwise(env)

  },

  oper(exp, cache) {

    if (!hasOwn.call(exp, 'oper')) {
      throw errorExpReq('oper', 'oper')
    }

    if (!hasOwn.call(exp, 'exp')) {
      throw errorExpReq('exp', 'oper')
    }

    const { exp: operExps, oper } = exp

    if (operExps.length < 2) {
      throw error('not enought operands')
    }

    const resolvers = compileExp(operExps, cache)

    const reduceResolvers = specialOperTable[oper as SpecialOperator]

    if (reduceResolvers) {
      return reduceResolvers(resolvers)
    }

    const reduce = operTable[oper as RegularArithmeticOperator]

    if (!reduce) {
      throw errorInvalidType(oper, 'operation')
    }

    const resolveFirst = resolvers.shift() as EnvBasedResolver
    const len = resolvers.length

    return (env) => {

      let result = resolveFirst(env)

      for (let i = 0; i < len; i++) {
        result = reduce(
          result,
          resolvers[i](env),
        )
      }

      return result

    }

  },

  trans(exp, cache) {

    if (!hasOwn.call(exp, 'oper')) {
      throw errorExpReq('oper', 'trans')
    }

    if (!hasOwn.call(exp, 'exp')) {
      throw errorExpReq('exp', 'trans')
    }

    if (exp.oper === 'typeof') {

      const resolveSafe = compileExp(exp.exp, cache, true)

      return (env) => {
        const value = resolveSafe(env)
        return typeof value
      }

    }

    const transform = transTable[exp.oper]

    if (!transform) {
      throw errorInvalidType(exp.oper, 'transform operation')
    }

    const resolve = compileExp(exp.exp, cache)

    return (env) => {
      return transform(
        resolve(env),
      )
    }

  },

  func(exp, cache) {

    return compileFunc(
      exp,
      cache,
    ) as any

  },

  call(exp, cache) {

    if (!hasOwn.call(exp, 'func')) {
      throw errorExpReq('func', 'call')
    }

    const { args } = exp

    const resolveFunc = compileExp<AnyFunction>(exp.func, cache)
    const resolveArgs = args && compileSpread(args, cache)

    return (env) => {

      const func = resolveFunc(env)

      if (!resolveArgs) {
        return func()
      }

      // eslint-disable-next-line prefer-spread
      return func.apply(
        null,
        resolveArgs(env, []),
      )

    }

  },

}

const stepTable: StatementLookupTable = {

  declare(step, cache) {

    if (!hasOwn.call(step, 'set')) {
      throw errorStmnReq('set', 'declare')
    }

    const resolve = compileDecl(step.set, cache)

    if (!resolve) {
      return returning()
    }

    return (env) => {
      resolve(env)
    }

  },

  let(step, cache) {

    if (!hasOwn.call(step, 'declare')) {
      throw errorStmnReq('declare', 'let')
    }

    const resolve = compileDecl(step.declare, cache)

    if (!resolve) {
      return returning()
    }

    return (env) => {
      resolve(env)
    }

  },

  if(step, cache, breakable) {

    if (!hasOwn.call(step, 'condition')) {
      throw errorStmnReq('condition', 'if')
    }

    const { then, otherwise } = step

    const resolveCondition = compileExp(step.condition, cache)
    const resolveThen = then && compileStep(then, cache, breakable)
    const resolveOtherwise = otherwise && compileStep(otherwise, cache, breakable)

    if (!resolveThen && !resolveOtherwise) {
      return returning()
    }

    return (env) => {

      const resolveSteps = resolveCondition(env) ? resolveThen : resolveOtherwise

      if (resolveSteps) {
        return resolveSteps(
          createEnv(env),
        )
      }

    }

  },

  for(step, cache) {

    if (!hasOwn.call(step, 'target')) {
      throw errorStmnReq('target', 'for')
    }

    const { body } = step

    const resolveBody = body && compileStep(body, cache, true)

    if (!resolveBody) {
      return returning()
    }

    const { index, value } = step
    const resolveTarget = compileExp<any[]>(step.target, cache)

    return (env): StepNonLoopResult => {

      const array = resolveTarget(env)
      const len = array.length

      let i = 0

      while (i < len) {

        const lib: EnvLib = {}

        if (index) {
          lib[index] = i
        }
        if (value) {
          lib[value] = array[i]
        }

        const result = resolveBody(
          createEnv(env, lib),
        )

        if (result) {
          if (result === 'break') {
            return
          }
          return result
        }

        i++

      }

    }

  },

  break(step, cache, breakable) {

    if (!breakable) {
      throw error('"break" is not allowed outside loops')
    }

    return returning(
      step.type,
    )

  },

  return(step, cache) {

    if (!hasOwn.call(step, 'value')) {
      throw errorStmnReq('value', 'return')
    }

    const { value, type } = step
    const resolveValue = compileExp(value, cache)

    return (env) => ({
      type,
      value: resolveValue(env),
    })

  },

  try(step, cache) {

    const { body, error: errorId, catch: catchSteps } = step

    const resolveBody = body && compileStep(body, cache)
    const resolveCatch = resolveBody && catchSteps && compileStep(catchSteps, cache)

    if (!resolveBody) {
      return returning()
    }

    return (env) => {

      try {

        const result = resolveBody(
          createEnv(env),
        )

        if (result && result.type === 'throw') {
          throw result.msg
        }

        return result

      } catch (err) {

        if (resolveCatch) {

          const lib: EnvLib = {}

          if (errorId) {
            lib[errorId] = `${err.message || err}`
          }

          return resolveCatch(
            createEnv(env, lib),
          )

        }

      }

    }

  },

  throw(step, cache) {

    if (!hasOwn.call(step, 'msg')) {
      throw errorStmnReq('msg', 'throw')
    }

    const { type, msg } = step

    const resolveMessage = isObj(msg) && compileExp<string>(msg, cache)

    return (env) => ({
      type,
      msg: resolveMessage ? resolveMessage(env) : `${msg}`,
    })

  },

}

// FUNCTION

export function compileFunc<V extends AnyFunction = AnyFunction>(
  options: FunctionBase,
  cache: CompileCache,
  name?: string,
): EnvBasedResolver<V> {

  const { params, body } = options

  const parseArgs = params && compileParam(params, cache)
  const resolveFuncBody = body && compileStep(body, cache)

  return (env): V => {

    if (!resolveFuncBody) {
      return returning() as V
    }

    const func: AnyFunction = (...args: any[]): any => {

      let lib: EnvLib = {}

      if (parseArgs) {
        lib = parseArgs(args, lib)
      }

      lib.arguments = args

      const result = resolveFuncBody(
        createEnv(
          outerScope,
          lib,
        ),
      )

      if (result) {

        if (result.type === 'throw') {
          throw result.msg
        }

        return result.value

      }

    }

    let outerScope = env

    if (name) {

      const lib: EnvLib = {}
      lib[name] = func

      outerScope = createEnv(outerScope, lib)

    }

    return func as V

  }

}

// PARAMS

export function compileParam(
  params: FunctionParameter | FunctionParameter[],
  cache: CompileCache,
): ArgsLibPopulator | null {

  function normalize(single: FunctionParameter): FunctionParameterDescriptor {
    return isObj(single) ? single : { id: single, type: 'param' }
  }

  function compileSingle(single: FunctionParameterDescriptor, index: number): ArgsLibPopulator {

    const { type, id } = single

    const compileGetter = paramTable[type]

    if (!compileGetter) {
      throw errorInvalidType(type, 'parameter')
    }

    const getValue = compileGetter(index)

    return (input, lib) => {
      lib[id] = getValue(input)
      return lib
    }

  }

  function compileMulti(): ArgsLibPopulator {

    return (input, lib) => {

      for (let i = 0; i < len; i++) {
        populators[i](input, lib)
      }

      return lib

    }

  }

  const db = cache.param || (cache.param = {})

  function compileCached(single: FunctionParameterDescriptor, index: number): ArgsLibPopulator {

    const { id } = single

    if (typeof id !== 'string') {
      throw errorInvalid(id, 'parameter id')
    }

    if (id === 'arguments') {
      throw error('"arguments" can\'t be used as parameter id')
    }

    if (!hash) {
      return compileSingle(single, index)
    }

    const key = hash(single, single.type, index)
    const cached = db[key]

    if (cached) {
      return cached
    }

    return db[key] = compileSingle(single, index)

  }

  if (!isArray(params)) {
    return compileCached(
      normalize(params),
      0,
    )
  }

  const len = params.length

  if (!len) {
    return null
  }

  const norm = params.map<FunctionParameterDescriptor>(normalize)
  const populators = norm.map<ArgsLibPopulator>(compileCached)

  if (len === 1) {
    return populators[0]
  }

  if (!hash) {
    return compileMulti()
  }

  const mkey = hash(norm, norm.length)
  const mcached = db[mkey]

  if (mcached) {
    return mcached
  }

  return db[mkey] = compileMulti()

}

// VARIABLE DECLARATION

export function compileDecl(
  decl: SingleOrMulti<VariableDeclaration>,
  cache: CompileCache,
): EnvBasedResolver<void> | null {

  function normalize(single: VariableDeclaration): DeclareWithValue {

    const obj = isObj(single) ? { id: single.id, value: single.value } : { id: single }

    if (hasOwn.call(obj, 'value') && typeof obj.value === 'undefined') {
      delete obj.value
    }

    return obj

  }

  function compileSingle(single: DeclareWithValue): EnvBasedResolver<void> {

    const { id, value } = single

    let resolveValue: EnvBasedResolver | undefined
    if (value) {
      resolveValue = compileExp(value, cache)
    }

    return (env) => {

      if (
        findInEnv(
          env,
          id,
          true,
        )
      ) {
        throw error(`"${id}" has already been declared in this environment`)
      }

      setInEnv(
        env,
        id,
        resolveValue && resolveValue(env),
      )

    }

  }

  function compileMulti(): EnvBasedResolver<void> {

    return (env) => {
      for (let i = 0; i < len; i++) {
        resolvers[i](env)
      }
    }

  }

  const db = cache.let || (cache.let = {})

  function compileCached(single: DeclareWithValue): EnvBasedResolver<void> {

    if (!hash) {
      return compileSingle(single)
    }

    const key = hash(single, single.id)
    const cached = db[key]

    if (cached) {
      return cached
    }

    return db[key] = compileSingle(single)

  }

  if (!isArray(decl)) {
    return compileCached(
      normalize(
        decl,
      ),
    )
  }

  const len = decl.length

  if (!len) {
    return null
  }

  const norm = decl.map(normalize)
  const resolvers = norm.map<EnvBasedResolver<void>>(compileCached)

  if (len === 1) {
    return resolvers[0]
  }

  if (!hash) {
    return compileMulti()
  }

  const mkey = hash(norm, norm.length)
  const mcached = db[mkey]

  if (mcached) {
    return mcached
  }

  return db[mkey] = compileMulti()

}

// SPREADABLE

export function compileSpread<V = any>(
  exp: [],
  cache: CompileCache,
): null;

export function compileSpread<V = any>(
  exp: SingleOrMulti<SpreadableExpression>,
  cache: CompileCache,
): EnvBasedPopulator<V[]>;

export function compileSpread<V = any>(
  exp: SingleOrMulti<SpreadableExpression>,
  cache: CompileCache,
): EnvBasedPopulator<V[]> | null {

  function compileSingle(single: SpreadableExpression): EnvBasedPopulator<V[]> {

    if (single.type === 'spread') {

      const resolveArray = compileExp<V[]>(single.exp, cache)

      return (env, resolved) => {
        // eslint-disable-next-line prefer-spread
        resolved.push.apply(
          resolved,
          resolveArray(env),
        )
        return resolved
      }

    }

    const resolveParam = compileExp(single, cache)

    return (env, resolved) => {
      resolved.push(
        resolveParam(env),
      )
      return resolved
    }

  }

  function compileMulti(): EnvBasedPopulator<V[]> {

    return (env, input) => {

      for (let i = 0; i < len; i++) {
        populators[i](env, input)
      }

      return input

    }

  }

  const db = cache.spread || (cache.spread = {})

  function compileCached(single: SpreadableExpression): EnvBasedPopulator<V[]> {

    if (!hash) {
      return compileSingle(single)
    }

    const key = hash(single, single.type)
    const cached = db[key]

    if (cached) {
      return cached
    }

    return db[key] = compileSingle(single)

  }

  if (!isArray(exp)) {
    return compileCached(exp)
  }

  const len = exp.length

  if (!len) {
    return null
  }

  const populators = exp.map(compileCached)

  if (len === 1) {
    return populators[0]
  }

  if (!hash) {
    return compileMulti()
  }

  const mkey = hash(exp, exp.length)
  const mcached = db[mkey]

  if (mcached) {
    return mcached
  }

  return db[mkey] = compileMulti()

}

// EXPRESSION

export function compileExp<V extends any = any>(
  exp: Expression[],
  cache: CompileCache,
  safe?: boolean,
): Array<EnvBasedResolver<V>>;

export function compileExp<V extends any = any>(
  exp: Expression,
  cache: CompileCache,
  safe?: boolean,
): EnvBasedResolver<V>;

export function compileExp<V extends any = any>(
  exp: SingleOrMulti<Expression>,
  cache: CompileCache,
  safe?: boolean,
): SingleOrMulti<EnvBasedResolver<V>> {

  function compileSingle(single: Expression) {

    const { type } = single

    const compile = expTable[type] as ExpressionCompiler<Expression> | undefined

    if (!compile) {
      throw errorInvalidType(type, 'expression')
    }

    return compile(single, cache, safe)

  }

  const db = cache.exp || (cache.exp = {})

  function compileCached(single: Expression) {

    if (!single || !isObj(single)) {
      throw errorInvalid(single, 'expression')
    }

    if (!hash) {
      return compileSingle(single)
    }

    const key = hash(single, single.type)
    const cached = db[key]

    if (cached) {
      return cached
    }

    return db[key] = compileSingle(single)

  }

  if (!isArray(exp)) {
    return compileCached(exp)
  }

  return exp.map(compileCached)

}

// STEPS

export function compileStep<V = any>(
  steps: SingleOrMulti<FunctionStep>,
  cache: CompileCache,
  breakable: true,
): EnvBasedResolver<StepLoopResult>;
export function compileStep<V = any>(
  steps: SingleOrMulti<FunctionStep>,
  cache: CompileCache,
  breakable?: false | undefined,
): EnvBasedResolver<StepNonLoopResult>;
export function compileStep<V = any>(
  steps: SingleOrMulti<FunctionStep>,
  cache: CompileCache,
  breakable?: boolean | undefined,
): EnvBasedResolver<StepLoopResult>;
export function compileStep<V = any>(
  steps: SingleOrMulti<FunctionStep>,
  cache: CompileCache,
  breakable?: boolean | undefined,
): EnvBasedResolver<StepLoopResult> {

  function compileSingle(single: FunctionStep): EnvBasedResolver<StepLoopResult> {

    const compile = stepTable[single.type as StatementType] as StepCompiler<FunctionStep> | undefined

    if (compile) {

      return compile(single, cache, breakable)

    }

    const resolveExp = compileExp(single as Expression, cache)

    return (env) => {
      resolveExp(env)
    }

  }

  function compileMulti(): EnvBasedResolver<StepLoopResult> {

    return (env): StepLoopResult => {

      for (let i = 0; i < len; i++) {

        const resolveStep = resolvers[i]
        const result = resolveStep(env)

        if (result) {
          return result
        }

      }

    }

  }

  const db = cache.step || (cache.step = {})

  function compileCached(single: FunctionStep): EnvBasedResolver<StepLoopResult> {

    if (!single || !isObj(single)) {
      throw errorInvalid(single, 'step')
    }

    if (!hash) {
      return compileSingle(single)
    }

    const key = hash(single, single.type)
    const cached = db[key]

    if (cached) {
      return cached
    }

    return db[key] = compileSingle(single)

  }

  if (!isArray(steps)) {
    return compileCached(steps)
  }

  const len = steps.length

  if (!len) {
    return returning()
  }

  const resolvers = steps.map(compileCached)

  if (len === 1) {
    return resolvers[0]
  }

  if (!hash) {
    return compileMulti()
  }

  const mkey = hash(steps, steps.length)
  const mcached = db[mkey]

  if (mcached) {
    return mcached
  }

  return db[mkey] = compileMulti()

}
