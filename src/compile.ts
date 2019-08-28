import { error, errorInvalid, errorInvalidType, errorNotInScope, errorRequired, errorRequired2 } from "./errors";
import { hash } from "./hash";
import { functionReturning, hasOwn } from "./helpers";
import { createScope, findInScope, setInScope } from "./scope";
import { isArray, isObj } from "./type-check";

import {
  AnyFunction,
  ExpressionCompiler,
  ExpressionLookupTable,
  SingleOrMulti,
  StatementLookupTable,
  StepCompiler,
} from "./helper-types";
import {
  ArgsLibPopulator,
  CompileCache,
  Expression,
  FunctionOptions,
  FunctionParameter,
  FunctionStep,
  InputArgsParser,
  ParameterType,
  RegularArithmeticOperator,
  RegularOperator,
  RegularTransformOperator,
  ScopeBasedPopulator,
  ScopeBasedResolver,
  ScopeLib,
  SpecialOperator,
  SpreadableExpression,
  StatementType,
  StepLoopResult,
  StepNonLoopResult,
  VariableDeclaration,
} from "./types";

// LOOKUP TABLES

const paramTable: Record<
  ParameterType,
  (index: number) => (input: any[]) => any
> = {

  rest: (index) => {

    return (input) => {

      const arg: any[] = [];
      const len = input.length;

      for (let i = index; i < len; i++) {
        arg.push(
          input[i],
        );
      }

      return arg;

    };

  },

  param: (index) => (input) => input[index],

};

const specialOperTable: Record<
  SpecialOperator,
  (resolvers: ScopeBasedResolver[]) => ScopeBasedResolver
> = {

  "||": (resolvers) => {

    const len = resolvers.length;

    return (scope) => {

      let result;

      for (let i = 0; i < len; i++) {

        result = resolvers[i](scope);

        if (result) {
          break;
        }

      }

      return result;

    };

  },

  "&&": (resolvers) => {

    const len = resolvers.length;

    return (scope) => {

      let result;

      for (let i = 0; i < len; i++) {

        result = resolvers[i](scope);

        if (!result) {
          break;
        }

      }

      return result;

    };

  },

  "**": (resolvers) => {

    const resolveLast = resolvers.pop() as ScopeBasedResolver;

    return (scope) => {

      let result = resolveLast(scope);
      let i = resolvers.length - 1;

      while (i >= 0) {
        result = resolvers[i](scope) ** result;
        i--;
      }

      return result;

    };

  },

};

const operTable: Record<
  RegularOperator,
  (total: any, value: any) => any
> = {
  "+": (total, value) => (total + value),
  "-": (total, value) => (total - value),
  "*": (total, value) => (total * value),
  "/": (total, value) => (total / value),
  "%": (total, value) => (total % value),
  // tslint:disable-next-line: no-bitwise
  "&": (total, value) => (total & value),
  // tslint:disable-next-line: no-bitwise
  "|": (total, value) => (total | value),
  // tslint:disable-next-line: no-bitwise
  "^": (total, value) => (total ^ value),
  // tslint:disable-next-line: no-bitwise
  "<<": (total, value) => (total << value),
  // tslint:disable-next-line: no-bitwise
  ">>": (total, value) => (total >> value),
  // tslint:disable-next-line: no-bitwise
  ">>>": (total, value) => (total >>> value),
  // tslint:disable-next-line: triple-equals
  "==": (total, value) => (total == value),
  "===": (total, value) => (total === value),
  // tslint:disable-next-line: triple-equals
  "!=": (total, value) => (total != value),
  "!==": (total, value) => (total !== value),
  ">": (total, value) => (total > value),
  "<": (total, value) => (total < value),
  ">=": (total, value) => (total >= value),
  "<=": (total, value) => (total <= value),
};

const transTable: Record<RegularTransformOperator, (value: any) => any> = {
  "!": (value) => !value,
  "!!": (value) => !!value,
  // tslint:disable-next-line: no-bitwise
  "~": (value) => ~value,
};

const expTable: ExpressionLookupTable = {

  literal(exp) {

    if (!hasOwn.call(exp, "value")) {
      throw errorRequired("value", "literal");
    }

    const { value } = exp;

    const valueType = typeof value;

    if (valueType === "string" || valueType === "number" || valueType === "boolean") {
      return functionReturning(value);
    }

    const serialized = JSON.stringify(value);

    return () => JSON.parse(serialized);

  },

  get(exp, cache, safe) {

    if (!hasOwn.call(exp, "id")) {
      throw errorRequired("id", "get");
    }

    if (typeof exp.id !== "string") {
      throw error('A "get" expression "id" must be a string');
    }

    const { id } = exp;

    return (scope) => {

      const result = findInScope(scope, id);

      if (!result) {
        if (!safe) {
          throw errorNotInScope(id);
        }
        return;
      }

      return result.scope[result.id];

    };

  },

  set(exp, cache) {

    if (!hasOwn.call(exp, "id")) {
      throw errorRequired("id", "set");
    }

    if (!hasOwn.call(exp, "value")) {
      throw errorRequired("value", "set");
    }

    if (typeof exp.id !== "string") {
      throw error('A "set" expression "id" must be a string');
    }

    const { id } = exp;
    const resolveValue = compileExp(exp.value, cache);

    return (scope) => {

      const result = findInScope(scope, id);

      if (!result) {
        throw errorNotInScope(id);
      }

      return result.scope[result.id] = resolveValue(scope);

    };

  },

  call(exp, cache) {

    if (!hasOwn.call(exp, "func")) {
      throw errorRequired("func", "call");
    }

    const { args } = exp;

    const resolveFunc = compileExp<AnyFunction>(exp.func, cache);
    const resolveArgs = args ? compileSpread(args, cache) : null;

    return (scope) => {

      const func = resolveFunc(scope);

      if (!resolveArgs) {
        return func();
      }

      return func(
        ...resolveArgs(scope),
      );

    };

  },

  ternary(exp, cache) {

    if (!hasOwn.call(exp, "condition")) {
      throw errorRequired("condition", "ternary");
    }

    if (!hasOwn.call(exp, "then")) {
      throw errorRequired("then", "ternary");
    }

    if (!hasOwn.call(exp, "otherwise")) {
      throw errorRequired("otherwise", "ternary");
    }

    const resolveCondition = compileExp(exp.condition, cache);
    const resolveThen = compileExp(exp.then, cache);
    const resolveOtherwise = compileExp(exp.otherwise, cache);

    return (scope) => resolveCondition(scope)
      ? resolveThen(scope)
      : resolveOtherwise(scope);

  },

  oper(exp, cache) {

    if (!hasOwn.call(exp, "oper")) {
      throw errorRequired("oper", "oper");
    }

    if (!hasOwn.call(exp, "exp")) {
      throw errorRequired("exp", "oper");
    }

    const { exp: operExps, oper } = exp;

    if (operExps.length < 2) {
      throw error("not enought operands");
    }

    const resolvers = compileExp(operExps, cache);

    const reduceResolvers = specialOperTable[oper as SpecialOperator];

    if (reduceResolvers) {
      return reduceResolvers(resolvers);
    }

    const reduce = operTable[oper as RegularArithmeticOperator];

    if (!reduce) {
      throw errorInvalidType(oper, "operation");
    }

    const resolveFirst = resolvers.shift() as ScopeBasedResolver;

    return (scope) => {
      return resolvers.reduce(
        (total, resolve) => reduce(total, resolve(scope)),
        resolveFirst(scope),
      );
    };

  },

  trans(exp, cache) {

    if (!hasOwn.call(exp, "oper")) {
      throw errorRequired("oper", "trans");
    }

    if (!hasOwn.call(exp, "exp")) {
      throw errorRequired("exp", "trans");
    }

    if (exp.oper === "typeof") {

      const resolveSafe = compileExp(exp.exp, cache, true);

      return (scope) => {
        const value = resolveSafe(scope);
        return typeof value;
      };

    }

    const transform = transTable[exp.oper];

    if (!transform) {
      throw errorInvalidType(exp.oper, "transform operation");
    }

    const resolve = compileExp(exp.exp, cache);

    return (scope) => {
      return transform(
        resolve(scope),
      );
    };

  },

  func(exp, cache) {

    return compileFunc(
      exp,
      cache,
    ) as any;

  },

};

const stepTable: StatementLookupTable = {

  declare(step, cache) {

    if (!hasOwn.call(step, "set")) {
      throw errorRequired2("set", "declare");
    }

    const resolve = compileDecl(step.set, cache);

    return (scope) => {
      resolve(scope);
    };

  },

  let(step, cache) {

    if (!hasOwn.call(step, "declare")) {
      throw errorRequired2("declare", "let");
    }

    const resolve = compileDecl(step.declare, cache);

    return (scope) => {
      resolve(scope);
    };

  },

  if(step, cache, breakable) {

    if (!hasOwn.call(step, "condition")) {
      throw errorRequired2("condition", "if");
    }

    const { then, otherwise } = step;

    const resolveCondition = compileExp(step.condition, cache);
    const resolveThen = then ? compileStep(then, cache, breakable) : null;
    const resolveOtherwise = otherwise ? compileStep(otherwise, cache, breakable) : null;

    if (!resolveThen && !resolveOtherwise) {
      return functionReturning();
    }

    return (scope) => {

      const resolveSteps = resolveCondition(scope) ? resolveThen : resolveOtherwise;

      if (resolveSteps) {
        return resolveSteps(
          createScope(scope),
        );
      }

    };

  },

  for(step, cache) {

    if (!hasOwn.call(step, "target")) {
      throw errorRequired2("target", "for");
    }

    const { body } = step;

    const resolveBody = body ? compileStep(body, cache, true) : null;

    if (!resolveBody) {
      return functionReturning();
    }

    const { index, value } = step;
    const resolveTarget = compileExp<any[]>(step.target, cache);

    return (scope): StepNonLoopResult => {

      const array = resolveTarget(scope);
      const len = array.length;

      let i = 0;

      while (i < len) {

        const lib: ScopeLib = {};

        if (index) {
          lib[index] = i;
        }
        if (value) {
          lib[value] = array[i];
        }

        const result = resolveBody(
          createScope(scope, lib),
        );

        if (result) {
          if (result === "break") {
            return;
          }
          return result;
        }

        i++;

      }

    };

  },

  break(step, cache, breakable) {

    if (!breakable) {
      throw error('"break" is not allowed outside loops');
    }

    return functionReturning(
      step.type,
    );

  },

  return(step, cache) {

    if (!hasOwn.call(step, "value")) {
      throw errorRequired2("value", "return");
    }

    const { value, type } = step;
    const resolveValue = compileExp(value, cache);

    return (scope) => ({
      type,
      value: resolveValue(scope),
    });

  },

  throw(step, cache) {

    if (!hasOwn.call(step, "msg")) {
      throw errorRequired2("msg", "throw");
    }

    const { type, msg } = step;

    const resolveMessage = isObj(msg) ? compileExp<string>(msg, cache) : null;

    return (scope) => ({
      type,
      error: error(
        resolveMessage ? resolveMessage(scope) : `${msg}`,
      ),
    });

  },

};

// PARAMS

function compileParam(params: FunctionParameter | FunctionParameter[], cache: CompileCache): InputArgsParser {

  function compileSingle(single: FunctionParameter, index: number): ArgsLibPopulator {

    if (!isObj(single)) {
      single = { id: single, type: "param" };
    }

    const { id } = single;

    if (typeof id !== "string") {
      throw errorInvalid(id, "parameter id");
    }

    if (id === "arguments") {
      throw error("\"arguments\" can't be used as parameter id");
    }

    const compileGetter = paramTable[single.type];

    if (!compileGetter) {
      throw errorInvalidType(single.type, "parameter");
    }

    const getValue = compileGetter(index);

    return (input, lib) => {
      lib[id] = getValue(input);
      return lib;
    };

  }

  if (!isArray(params)) {
    const populate = compileSingle(params, 0);
    return (input) => populate(input, {});
  }

  const populators = params.map<ArgsLibPopulator>(compileSingle);

  return (input) => populators.reduce<ScopeLib>(
    (result, populate) => populate(input, result),
    {},
  );

}

// FUNCTION

export function compileFunc<V extends AnyFunction = AnyFunction>(
  options: FunctionOptions,
  cache: CompileCache,
  name?: string,
): ScopeBasedResolver<V> {

  const { params, body } = options;

  const parseArgs: InputArgsParser | null = !params
    ? null
    : compileParam(params, cache);
  const resolveFuncBody = body ? compileStep(body, cache) : null;

  return (scope): V => {

    if (!resolveFuncBody) {
      return functionReturning() as V;
    }

    const func: AnyFunction = (...args: any[]): any => {

      let lib: ScopeLib = {};

      if (parseArgs) {
        lib = parseArgs(args);
      }

      lib.arguments = args;

      const result = resolveFuncBody(
        createScope(
          outerScope,
          lib,
        ),
      );

      if (result) {

        if (result.type === "throw") {
          throw result.error;
        }

        return result.value;

      }

    };

    let outerScope = scope;

    if (name) {

      const lib: ScopeLib = {};
      lib[name] = func;

      outerScope = createScope(outerScope, lib);

    }

    return func as V;

  };

}

// EXPRESSION

export function compileExp<V extends any = any>(
  exp: Expression[],
  cache: CompileCache,
  safe?: boolean,
): Array<ScopeBasedResolver<V>>;

export function compileExp<V extends any = any>(
  exp: Expression,
  cache: CompileCache,
  safe?: boolean,
): ScopeBasedResolver<V>;

export function compileExp<V extends any = any>(
  exp: SingleOrMulti<Expression>,
  cache: CompileCache,
  safe?: boolean,
): SingleOrMulti<ScopeBasedResolver<V>> {

  function compileSingle(single: Expression) {

    const { type } = single;

    const compile = expTable[type] as ExpressionCompiler<Expression> | undefined;

    if (!compile) {
      throw errorInvalidType(type, "expression");
    }

    return compile(single, cache, safe);

  }

  function compileCached(single: Expression) {

    if (!single || !isObj(single)) {
      throw errorInvalid(single, "expression");
    }

    if (!hash) {
      return compileSingle(single);
    }

    const db = cache.exp || (cache.exp = {});
    const key = hash(single);

    const resolve = db[key];

    if (resolve) {
      return resolve;
    }

    return db[key] = compileSingle(single);

  }

  if (!isArray(exp)) {
    return compileCached(exp);
  }

  return exp.map(compileCached);

}

// SPREADABLE

function compileSpread<V = any>(
  exp: SingleOrMulti<SpreadableExpression>,
  cache: CompileCache,
): ScopeBasedResolver<V[]> {

  function compileSingle(single: SpreadableExpression): ScopeBasedPopulator<V[]> {

    if (single.type === "spread") {
      const resolveArray = compileExp<V[]>(single.exp, cache);
      return (scope, resolved) => {
        resolved.push.apply(
          resolved,
          resolveArray(scope),
        );
        return resolved;
      };
    }

    const resolveParam = compileExp(single, cache);
    return (scope, resolved) => {
      resolved.push(
        resolveParam(scope),
      );
      return resolved;
    };

  }

  if (!isArray(exp)) {
    const populate = compileSingle(exp);
    return (scope) => populate(scope, []);
  }

  const populators = exp.map(compileSingle);

  return (scope) => populators.reduce(
    (result, populate) => populate(scope, result),
    [] as V[],
  );

}

// VARIABLE DECLARATION

function compileDecl(
  declare: SingleOrMulti<VariableDeclaration>,
  cache: CompileCache,
): ScopeBasedResolver<void> {

  function compileSingle(set: VariableDeclaration): ScopeBasedResolver<void> {

    if (!isObj(set)) {
      set = {
        id: set,
      };
    }

    const { id, value } = set;

    let resolveValue: ScopeBasedResolver | undefined;
    if (value) {
      resolveValue = compileExp(value, cache);
    }

    return (scope) => {

      if (
        findInScope(
          scope,
          id,
          true,
        )
      ) {
        throw error(`"${id}" has already been declared in this scope`);
      }

      setInScope(
        scope,
        id,
        resolveValue && resolveValue(scope),
      );
    };

  }

  if (!isArray(declare)) {
    return compileSingle(declare);
  }

  const resolvers = declare.map<ScopeBasedResolver<void>>(compileSingle);

  return (scope) => {
    resolvers.forEach((resolve) => {
      resolve(scope);
    });
  };

}

// STEPS

export function compileStep<V = any>(
  steps: SingleOrMulti<FunctionStep>,
  cache: CompileCache,
  breakable: true,
): ScopeBasedResolver<StepLoopResult>;
export function compileStep<V = any>(
  steps: SingleOrMulti<FunctionStep>,
  cache: CompileCache,
  breakable?: false | undefined,
): ScopeBasedResolver<StepNonLoopResult>;
export function compileStep<V = any>(
  steps: SingleOrMulti<FunctionStep>,
  cache: CompileCache,
  breakable?: boolean | undefined,
): ScopeBasedResolver<StepLoopResult>;
export function compileStep<V = any>(
  steps: SingleOrMulti<FunctionStep>,
  cache: CompileCache,
  breakable?: boolean | undefined,
): ScopeBasedResolver<StepLoopResult> {

  function compileSingle(single: FunctionStep): ScopeBasedResolver<StepLoopResult> {

    const compile = stepTable[single.type as StatementType] as StepCompiler<FunctionStep> | undefined;

    if (compile) {

      return compile(single, cache, breakable);

    }

    const resolveExp = compileExp(single as Expression, cache);

    return (scope) => {
      resolveExp(scope);
    };

  }

  function compileCached(single: FunctionStep): ScopeBasedResolver<StepLoopResult> {

    if (!single || !isObj(single)) {
      throw errorInvalid(single, "step");
    }

    if (!hash) {
      return compileSingle(single);
    }

    const db = cache.step || (cache.step = {});
    const key = hash(single);

    const resolve = db[key];

    if (resolve) {
      return resolve;
    }

    return db[key] = compileSingle(single);

  }

  if (!isArray(steps)) {
    return compileCached(steps);
  }

  const resolvers = steps.map(compileCached);

  return (scope): StepLoopResult => {

    for (let i = 0, len = resolvers.length; i < len; i++) {

      const resolveStep = resolvers[i];
      const result = resolveStep(scope);

      if (result) {
        return result;
      }

    }

  };

}
