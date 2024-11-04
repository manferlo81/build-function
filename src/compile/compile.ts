import { addToEnv, createEnv, findInEnv } from '../env';
import { error, errorExpReq, errorInvalid, errorInvalidType, errorNotInEnv, errorStmnReq } from '../errors';
import { hash } from '../hash';
import { hasOwn, returning } from '../helpers';
import type { DeprecatedDeclareStatement } from '../legacy-types';
import { isArray, isObjOrNull } from '../type-check';
import type {
  ArgsLibPopulator,
  BinaryOperationExpression,
  BlockStep,
  BreakStatement,
  CompileCache,
  DeclareWithValue,
  EnvBasedPopulator,
  EnvBasedResolver,
  EnvLib,
  Expression,
  ForStatement,
  FunctionBase,
  FunctionCallExpression,
  FunctionExpression,
  FunctionParameter,
  FunctionParameterDescriptor,
  GetExpression,
  IfStatement,
  LetStatement,
  LiteralExpression,
  LoopBlockResult,
  NonLoopBlockResult,
  RegularArithmeticOperator,
  ReturnStatement,
  SetExpression,
  SingleOrMulti,
  SpecialBinaryOperator,
  SpreadableExpression,
  StatementType,
  TernaryOperationExpression,
  ThrowStatement,
  TryStatement,
  UnaryOperationExpression,
  UnknownFunction,
  VariableDeclaration,
} from '../types';
import { operTable, specialOperTable, transTable } from './oper-table';
import { paramTable } from './param-table';

type ExpressionCompiler<E extends Expression> =
  (expression: E, cache: CompileCache, safe?: boolean) => EnvBasedResolver<any>;

interface ExpressionLookupTable {
  literal: ExpressionCompiler<LiteralExpression>;
  get: ExpressionCompiler<GetExpression>;
  set: ExpressionCompiler<SetExpression>;
  trans: ExpressionCompiler<UnaryOperationExpression>;
  oper: ExpressionCompiler<BinaryOperationExpression>;
  ternary: ExpressionCompiler<TernaryOperationExpression>;
  func: ExpressionCompiler<FunctionExpression>;
  call: ExpressionCompiler<FunctionCallExpression>;
}

const expTable: ExpressionLookupTable = {

  literal(exp) {

    if (!hasOwn.call(exp, 'value')) {
      throw errorExpReq('value', 'literal');
    }

    const { value } = exp;

    const valueType = typeof value;

    if (valueType === 'string' || valueType === 'number' || valueType === 'boolean') {
      return returning(value);
    }

    const serialized = JSON.stringify(value);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return () => JSON.parse(serialized);

  },

  get(exp, _cache, safe) {

    if (!hasOwn.call(exp, 'id')) {
      throw errorExpReq('id', 'get');
    }

    const { id } = exp;

    if (typeof id !== 'string') {
      throw error('A "get" expression "id" must be a string');
    }

    return (env) => {

      const found = findInEnv(env, id);

      if (!found) {
        if (!safe) {
          throw errorNotInEnv(id);
        }
        return;
      }

      return found.env.values[found.id].value;

    };

  },

  set(exp, cache) {

    if (!hasOwn.call(exp, 'id')) {
      throw errorExpReq('id', 'set');
    }

    if (!hasOwn.call(exp, 'value')) {
      throw errorExpReq('value', 'set');
    }

    const { id } = exp;

    if (typeof id !== 'string') {
      throw error('A "set" expression "id" must be a string');
    }

    const resolveValue = compileExp<unknown>(exp.value, cache);

    return (env) => {

      const found = findInEnv(env, id);

      if (!found) {
        throw errorNotInEnv(id);
      }

      if (found.env.values[found.id].readonly) {
        throw error(`"${id}" is readonly`);
      }

      return found.env.values[found.id].value = resolveValue(env);

    };

  },

  ternary(exp, cache) {

    if (!hasOwn.call(exp, 'condition')) {
      throw errorExpReq('condition', 'ternary');
    }

    if (!hasOwn.call(exp, 'then')) {
      throw errorExpReq('then', 'ternary');
    }

    if (!hasOwn.call(exp, 'otherwise')) {
      throw errorExpReq('otherwise', 'ternary');
    }

    const resolveCondition = compileExp(exp.condition, cache);
    const resolveThen = compileExp(exp.then, cache);
    const resolveOtherwise = compileExp(exp.otherwise, cache);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (env) => resolveCondition(env)
      ? resolveThen(env)
      : resolveOtherwise(env);

  },

  oper(exp, cache) {

    if (!hasOwn.call(exp, 'oper')) {
      throw errorExpReq('oper', 'oper');
    }

    if (!hasOwn.call(exp, 'exp')) {
      throw errorExpReq('exp', 'oper');
    }

    const { exp: operExps, oper } = exp;

    if (operExps.length < 2) {
      throw error('not enough operands');
    }

    const resolvers = compileExp<unknown>(operExps, cache);

    const reduceResolvers = specialOperTable[oper as SpecialBinaryOperator];

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (reduceResolvers) {
      return reduceResolvers(resolvers);
    }

    const reduce = operTable[oper as RegularArithmeticOperator];

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!reduce) {
      throw errorInvalidType(oper, 'operation');
    }

    const resolveFirst = resolvers.shift() as EnvBasedResolver;
    const { length: len } = resolvers;

    return (env) => {

      let result = resolveFirst(env);

      for (let i = 0; i < len; i++) {
        result = reduce(
          result,
          resolvers[i](env),
        ) as unknown;
      }

      return result;

    };

  },

  trans(exp, cache) {

    if (!hasOwn.call(exp, 'oper')) {
      throw errorExpReq('oper', 'trans');
    }

    if (!hasOwn.call(exp, 'exp')) {
      throw errorExpReq('exp', 'trans');
    }

    if (exp.oper === 'typeof') {

      const resolveSafe = compileExp<unknown>(exp.exp, cache, true);

      return (env) => {
        const value = resolveSafe(env);
        return typeof value;
      };

    }

    const transform = transTable[exp.oper];

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!transform) {
      throw errorInvalidType(exp.oper, 'transform operation');
    }

    const resolve = compileExp(exp.exp, cache);

    return (env) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return transform(
        resolve(env),
      );
    };

  },

  func(exp, cache) {

    return compileFunc(
      exp,
      cache,
    );

  },

  call(exp, cache) {

    if (!hasOwn.call(exp, 'func')) {
      throw errorExpReq('func', 'call');
    }

    const { args } = exp;

    const resolveFunc = compileExp<UnknownFunction>(exp.func, cache);
    const resolveArgs = args && compileSpread(args, cache);

    return (env) => {

      const func = resolveFunc(env);

      if (!resolveArgs) {
        return func();
      }

      // eslint-disable-next-line prefer-spread
      return func.apply(
        null,
        resolveArgs(env, []),
      );

    };

  },

};

type StepCompiler<S extends BlockStep> =
  (step: S, cache: CompileCache, breakable?: boolean) => EnvBasedResolver<LoopBlockResult>;

interface StatementLookupTable {
  declare: StepCompiler<DeprecatedDeclareStatement>;
  let: StepCompiler<LetStatement>;
  if: StepCompiler<IfStatement>;
  for: StepCompiler<ForStatement>;
  break: StepCompiler<BreakStatement>;
  try: StepCompiler<TryStatement>;
  throw: StepCompiler<ThrowStatement>;
  return: StepCompiler<ReturnStatement>;
}

const stepTable: StatementLookupTable = {

  declare(step, cache) {

    if (!hasOwn.call(step, 'set')) {
      throw errorStmnReq('set', 'declare');
    }

    const resolve = compileDecl(step.set, cache);

    if (!resolve) {
      return returning();
    }

    return (env) => {
      resolve(env);
    };

  },

  let(step, cache) {

    if (!hasOwn.call(step, 'declare')) {
      throw errorStmnReq('declare', 'let');
    }

    const resolve = compileDecl(step.declare, cache);

    if (!resolve) {
      return returning();
    }

    return (env) => {
      resolve(env);
    };

  },

  if(step, cache, breakable) {

    if (!hasOwn.call(step, 'condition')) {
      throw errorStmnReq('condition', 'if');
    }

    const { then, otherwise } = step;

    const resolveCondition = compileExp(step.condition, cache);
    const resolveThen = then && compileStep(then, cache, breakable);
    const resolveOtherwise = otherwise && compileStep(otherwise, cache, breakable);

    if (!resolveThen && !resolveOtherwise) {
      return returning();
    }

    return (env) => {

      const resolveSteps = resolveCondition(env) ? resolveThen : resolveOtherwise;

      if (resolveSteps) {
        return resolveSteps(
          createEnv(env),
        );
      }

    };

  },

  for(step, cache) {

    if (!hasOwn.call(step, 'target')) {
      throw errorStmnReq('target', 'for');
    }

    const { body } = step;

    const resolveBody = body && compileStep(body, cache, true);

    if (!resolveBody) {
      return returning();
    }

    const { index, value } = step;
    const resolveTarget = compileExp<unknown[]>(step.target, cache);

    return (env): NonLoopBlockResult => {

      const array = resolveTarget(env);
      const len = array.length;

      let i = 0;

      while (i < len) {

        const lib: EnvLib = {};

        if (index) {
          lib[index] = i;
        }
        if (value) {
          lib[value] = array[i];
        }

        const result = resolveBody(
          createEnv(env, lib),
        );

        if (result) {
          if (result === 'break') {
            return;
          }
          return result;
        }

        i++;

      }

    };

  },

  break(step, _cache, breakable) {

    if (!breakable) {
      throw error('"break" is not allowed outside loops');
    }

    return returning(
      step.type,
    );

  },

  return(step, cache) {

    if (!hasOwn.call(step, 'value')) {
      throw errorStmnReq('value', 'return');
    }

    const { value, type } = step;
    const resolveValue = compileExp<unknown>(value, cache);

    return (env) => ({
      type,
      value: resolveValue(env),
    });

  },

  try(step, cache) {

    const { body, error: errorId, catch: catchSteps } = step;

    const resolveBody = body && compileStep(body, cache);
    const resolveCatch = resolveBody && catchSteps && compileStep(catchSteps, cache);

    if (!resolveBody) {
      return returning();
    }

    return (env) => {

      try {

        const result = resolveBody(
          createEnv(env),
        );

        if (result && result.type === 'throw') {
          // eslint-disable-next-line @typescript-eslint/only-throw-error
          throw result.msg;
        }

        return result;

      } catch (err: any) {

        if (resolveCatch) {

          const lib: EnvLib = {};

          if (errorId) {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
            lib[errorId] = `${err.message || err}`;
          }

          return resolveCatch(
            createEnv(env, lib),
          );

        }

      }

    };

  },

  throw(step, cache) {

    if (!hasOwn.call(step, 'msg')) {
      throw errorStmnReq('msg', 'throw');
    }

    const { type, msg } = step;

    const resolveMessage = isObjOrNull(msg) && compileExp<string>(msg, cache);

    return (env) => ({
      type,
      msg: resolveMessage ? resolveMessage(env) : (msg as string),
    });

  },

};

// FUNCTION

export function compileFunc<V extends UnknownFunction = UnknownFunction>(
  options: FunctionBase,
  cache: CompileCache,
  name?: string,
): EnvBasedResolver<V> {

  const { params, body } = options;

  const parseArgs = params && compileParam(params, cache);
  const resolveFuncBody = body && compileStep(body, cache);

  return (env): V => {

    if (!resolveFuncBody) {
      return returning() as V;
    }

    const func: UnknownFunction = (...args: unknown[]): any => {

      let lib: EnvLib = {};

      if (parseArgs) {
        lib = parseArgs(args, lib);
      }

      lib.arguments = args;

      const result = resolveFuncBody(
        createEnv(
          outerScope,
          lib,
        ),
      );

      if (result) {

        if (result.type === 'throw') {
          // eslint-disable-next-line @typescript-eslint/only-throw-error
          throw result.msg;
        }

        return result.value;

      }

    };

    let outerScope = env;

    if (name) {

      const lib: EnvLib = {};
      lib[name] = func;

      outerScope = createEnv(outerScope, lib);

    }

    return func as V;

  };

}

// PARAMS

export function compileParam(
  params: FunctionParameter | FunctionParameter[],
  cache: CompileCache,
): ArgsLibPopulator | null {

  function normalize(single: FunctionParameter): FunctionParameterDescriptor {
    return isObjOrNull(single) ? single : { id: single, type: 'param' };
  }

  function compileSingle(single: FunctionParameterDescriptor, index: number): ArgsLibPopulator {

    const { type, id } = single;

    const compileGetter = paramTable[type];

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!compileGetter) {
      throw errorInvalidType(type, 'parameter');
    }

    const getValue = compileGetter(index);

    return (input, lib) => {

      lib[id] = getValue(input) as unknown;
      return lib;
    };

  }

  function compileMulti(): ArgsLibPopulator {

    return (input, lib) => {

      for (let i = 0; i < len; i++) {
        populators[i](input, lib);
      }

      return lib;

    };

  }

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const db = cache.param || (cache.param = {});

  function compileCached(single: FunctionParameterDescriptor, index: number): ArgsLibPopulator {

    const { id } = single;

    if (typeof id !== 'string') {
      throw errorInvalid(id, 'parameter id');
    }

    if (id === 'arguments') {
      throw error('"arguments" can\'t be used as parameter id');
    }

    if (!hash) {
      return compileSingle(single, index);
    }

    const key = hash(single, single.type, index);
    const cached = db[key];

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (cached) {
      return cached;
    }

    return db[key] = compileSingle(single, index);

  }

  if (!isArray(params)) {
    return compileCached(
      normalize(params),
      0,
    );
  }

  const len = params.length;

  if (!len) {
    return null;
  }

  const norm = params.map<FunctionParameterDescriptor>(normalize);
  const populators = norm.map<ArgsLibPopulator>(compileCached);

  if (len === 1) {
    return populators[0];
  }

  if (!hash) {
    return compileMulti();
  }

  const mkey = hash(norm, norm.length);
  const mcached = db[mkey];

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (mcached) {
    return mcached;
  }

  return db[mkey] = compileMulti();

}

// VARIABLE DECLARATION

export function compileDecl(
  decl: SingleOrMulti<VariableDeclaration>,
  cache: CompileCache,
): EnvBasedResolver<void> | null {

  function normalize(single: VariableDeclaration): DeclareWithValue {

    const obj = isObjOrNull(single) ? { id: single.id, value: single.value } : { id: single };

    if (hasOwn.call(obj, 'value') && typeof obj.value === 'undefined') {
      delete obj.value;
    }

    return obj;

  }

  function compileSingle(single: DeclareWithValue): EnvBasedResolver<void> {

    const { id, value } = single;

    let resolveValue: EnvBasedResolver | undefined;
    if (value) {
      resolveValue = compileExp(value, cache);
    }

    return (env) => {

      if (
        findInEnv(
          env,
          id,
          true,
        )
      ) {
        throw error(`"${id}" has already been declared in this environment`);
      }

      addToEnv(
        env,
        id,
        resolveValue?.(env),
      );

    };

  }

  function compileMulti(): EnvBasedResolver<void> {

    return (env) => {
      for (let i = 0; i < len; i++) {
        resolvers[i](env);
      }
    };

  }

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const db = cache.let || (cache.let = {});

  function compileCached(single: DeclareWithValue): EnvBasedResolver<void> {

    if (!hash) {
      return compileSingle(single);
    }

    const key = hash(single, single.id);
    const cached = db[key];

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (cached) {
      return cached;
    }

    return db[key] = compileSingle(single);

  }

  if (!isArray(decl)) {
    return compileCached(
      normalize(
        decl,
      ),
    );
  }

  const len = decl.length;

  if (!len) {
    return null;
  }

  const norm = decl.map(normalize);
  const resolvers = norm.map<EnvBasedResolver<void>>(compileCached);

  if (len === 1) {
    return resolvers[0];
  }

  if (!hash) {
    return compileMulti();
  }

  const mkey = hash(norm, norm.length);
  const mcached = db[mkey];

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (mcached) {
    return mcached;
  }

  return db[mkey] = compileMulti();

}

// SPREADABLE

export function compileSpread(
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

      const resolveArray = compileExp<V[]>(single.exp, cache);

      return (env, resolved) => {
        // eslint-disable-next-line prefer-spread
        resolved.push.apply(
          resolved,
          resolveArray(env),
        );
        return resolved;
      };

    }

    const resolveParam = compileExp<unknown>(single, cache);

    return (env, resolved) => {
      resolved.push(
        resolveParam(env) as V,
      );
      return resolved;
    };

  }

  function compileMulti(): EnvBasedPopulator<V[]> {

    return (env, input) => {

      for (let i = 0; i < len; i++) {
        populators[i](env, input);
      }

      return input;

    };

  }

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const db = cache.spread || (cache.spread = {});

  function compileCached(single: SpreadableExpression): EnvBasedPopulator<V[]> {

    if (!hash) {
      return compileSingle(single);
    }

    const key = hash(single, single.type);
    const cached = db[key];

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (cached) {
      return cached;
    }

    return db[key] = compileSingle(single);

  }

  if (!isArray(exp)) {
    return compileCached(exp);
  }

  const len = exp.length;

  if (!len) {
    return null;
  }

  const populators = exp.map(compileCached);

  if (len === 1) {
    return populators[0];
  }

  if (!hash) {
    return compileMulti();
  }

  const mkey = hash(exp, exp.length);
  const mcached = db[mkey];

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (mcached) {
    return mcached;
  }

  return db[mkey] = compileMulti();

}

// EXPRESSION

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
export function compileExp<V extends any = any>(
  exp: Expression[],
  cache: CompileCache,
  safe?: boolean,
): Array<EnvBasedResolver<V>>;

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
export function compileExp<V extends any = any>(
  exp: Expression,
  cache: CompileCache,
  safe?: boolean,
): EnvBasedResolver<V>;

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
export function compileExp<V extends any = any>(
  exp: SingleOrMulti<Expression>,
  cache: CompileCache,
  safe?: boolean,
): SingleOrMulti<EnvBasedResolver<V>> {

  function compileSingle(single: Expression) {

    const { type } = single;

    const compile = expTable[type] as ExpressionCompiler<Expression> | undefined;

    if (!compile) {
      throw errorInvalidType(type, 'expression');
    }

    return compile(single, cache, safe);

  }

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const db = cache.exp || (cache.exp = {});

  function compileCached(single: Expression) {

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!single || !isObjOrNull(single)) {
      throw errorInvalid(single, 'expression');
    }

    if (!hash) {
      return compileSingle(single);
    }

    const key = hash(single, single.type);
    const cached = db[key];

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (cached) {
      return cached;
    }

    return db[key] = compileSingle(single);

  }

  if (!isArray(exp)) {
    return compileCached(exp);
  }

  return exp.map(compileCached);

}

// STEPS

export function compileStep(
  steps: SingleOrMulti<BlockStep>,
  cache: CompileCache,
  breakable: true,
): EnvBasedResolver<LoopBlockResult>;
export function compileStep(
  steps: SingleOrMulti<BlockStep>,
  cache: CompileCache,
  breakable?: false,
): EnvBasedResolver<NonLoopBlockResult>;
export function compileStep(
  steps: SingleOrMulti<BlockStep>,
  cache: CompileCache,
  breakable?: boolean,
): EnvBasedResolver<LoopBlockResult>;
export function compileStep(
  steps: SingleOrMulti<BlockStep>,
  cache: CompileCache,
  breakable?: boolean,
): EnvBasedResolver<LoopBlockResult> {

  function compileSingle(single: BlockStep): EnvBasedResolver<LoopBlockResult> {

    const compile = stepTable[single.type as StatementType] as StepCompiler<BlockStep> | undefined;

    if (compile) {

      return compile(single, cache, breakable);

    }

    const resolveExp = compileExp(single as Expression, cache);

    return (env) => {
      resolveExp(env);
    };

  }

  function compileMulti(): EnvBasedResolver<LoopBlockResult> {

    return (env): LoopBlockResult => {

      for (let i = 0; i < len; i++) {

        const resolveStep = resolvers[i];
        const result = resolveStep(env);

        if (result) {
          return result;
        }

      }

    };

  }

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const db = cache.step || (cache.step = {});

  function compileCached(single: BlockStep): EnvBasedResolver<LoopBlockResult> {

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!single || !isObjOrNull(single)) {
      throw errorInvalid(single, 'step');
    }

    if (!hash) {
      return compileSingle(single);
    }

    const key = hash(single, single.type);
    const cached = db[key];

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (cached) {
      return cached as EnvBasedResolver<LoopBlockResult>;
    }

    return db[key] = compileSingle(single);

  }

  if (!isArray(steps)) {
    return compileCached(steps);
  }

  const len = steps.length;

  if (!len) {
    return returning();
  }

  const resolvers = steps.map(compileCached);

  if (len === 1) {
    return resolvers[0];
  }

  if (!hash) {
    return compileMulti();
  }

  const mkey = hash(steps, steps.length);
  const mcached = db[mkey];

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (mcached) {
    return mcached as EnvBasedResolver<LoopBlockResult>;
  }

  return db[mkey] = compileMulti();

}
