import { error, errorInvalid, errorInvalidType, errorNotInScope, errorRequired, errorRequired2 } from "./errors";
import { functionReturning, hasOwn } from "./helpers";
import { createScope, findInScope, setInScope } from "./scope";
import { isArray, isObj } from "./type-check";

import { AnyFunction, ExpressionLookupTable, SingleOrMulti, StatementLookupTable } from "./helper-types";
import {
  ArgsLibPopulator,
  DeclareWithValue,
  Expression,
  FunctionOptions,
  FunctionParameter,
  FunctionStep,
  InputArgsParser,
  MultiTermExpressions,
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
  StepCompiler,
  StepLoopResult,
  StepNonLoopResult,
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

const specialOperationTable: Record<
  SpecialOperator,
  (expressions: MultiTermExpressions) => ScopeBasedResolver
> = {

  "||": (expressions) => compileLogic(
    expressions,
    (left, right) => (left || right),
    (value) => value,
  ),

  "&&": (expressions) => compileLogic(
    expressions,
    (left, right) => (left && right),
    (value) => !value,
  ),

  "**": (expressions) => {

    const resolvers = expressions.map(compileExp);
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

const operationReducerTable: Record<
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

const transformTable: Record<RegularTransformOperator, (value: any) => any> = {
  "!": (value) => !value,
  "!!": (value) => !!value,
  // tslint:disable-next-line: no-bitwise
  "~": (value) => ~value,
};

const expressionTable: ExpressionLookupTable = {

  literal(expression) {

    if (!hasOwn.call(expression, "value")) {
      throw errorRequired("value", "literal");
    }

    return functionReturning(
      expression.value,
    );

  },

  get(expression, safe) {

    if (!hasOwn.call(expression, "id")) {
      throw errorRequired("id", "get");
    }

    if (typeof expression.id !== "string") {
      throw error('A "get" expression "id" must be a string');
    }

    const { id } = expression;

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

  set(expression) {

    if (!hasOwn.call(expression, "id")) {
      throw errorRequired("id", "set");
    }

    if (!hasOwn.call(expression, "value")) {
      throw errorRequired("value", "set");
    }

    if (typeof expression.id !== "string") {
      throw error('A "set" expression "id" must be a string');
    }

    const { id } = expression;
    const resolveValue = compileExp(expression.value);

    return (scope) => {

      const result = findInScope(scope, id);

      if (!result) {
        throw errorNotInScope(id);
      }

      return result.scope[result.id] = resolveValue(scope);

    };

  },

  call(expression) {

    if (!hasOwn.call(expression, "func")) {
      throw errorRequired("func", "call");
    }

    const { args } = expression;

    const resolveFunc = compileExp<AnyFunction>(expression.func);
    const resolveArgs = args ? compileSpreadable(args) : null;

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

  ternary(expression) {

    if (!hasOwn.call(expression, "condition")) {
      throw errorRequired("condition", "ternary");
    }

    if (!hasOwn.call(expression, "then")) {
      throw errorRequired("then", "ternary");
    }

    if (!hasOwn.call(expression, "otherwise")) {
      throw errorRequired("otherwise", "ternary");
    }

    const resolveCondition = compileExp(expression.condition);
    const resolveThen = compileExp(expression.then);
    const resolveOtherwise = compileExp(expression.otherwise);

    return (scope) => resolveCondition(scope)
      ? resolveThen(scope)
      : resolveOtherwise(scope);

  },

  oper(expression) {

    if (!hasOwn.call(expression, "oper")) {
      throw errorRequired("oper", "oper");
    }

    if (!hasOwn.call(expression, "exp")) {
      throw errorRequired("exp", "oper");
    }

    const { exp, oper } = expression;

    if (exp.length < 2) {
      throw error("not enought operands");
    }

    const createResolver = specialOperationTable[oper as SpecialOperator];

    if (createResolver) {
      return createResolver(exp);
    }

    const reducer = operationReducerTable[oper as RegularArithmeticOperator];

    if (!reducer) {
      throw errorInvalidType(oper, "operation");
    }

    const otherResolvers = exp.map(compileExp);
    const resolveFirst = otherResolvers.shift() as ScopeBasedResolver;

    return (scope) => {
      return otherResolvers.reduce(
        (total, resolve) => reducer(total, resolve(scope)),
        resolveFirst(scope),
      );
    };

  },

  trans(expression) {

    if (!hasOwn.call(expression, "oper")) {
      throw errorRequired("oper", "trans");
    }

    if (!hasOwn.call(expression, "exp")) {
      throw errorRequired("exp", "trans");
    }

    if (expression.oper === "typeof") {

      const resolveSafe = compileExpSafe(expression.exp, true);

      return (scope) => {
        const value = resolveSafe(scope);
        return typeof value;
      };

    }

    const transform = transformTable[expression.oper];

    if (!transform) {
      throw errorInvalidType(expression.oper, "transform operation");
    }

    const resolve = compileExp(expression.exp);

    return (scope) => {
      return transform(
        resolve(scope),
      );
    };

  },

  func(expression) {

    return compileFunc(
      expression,
    ) as any;

  },

};

const stepTable: StatementLookupTable = {

  declare(step) {

    if (!hasOwn.call(step, "set")) {
      throw errorRequired2("set", "declare");
    }

    const resolve = compileVarDeclaration(step.set);

    return (scope) => {
      resolve(scope);
    };

  },

  let(step) {

    if (!hasOwn.call(step, "declare")) {
      throw errorRequired2("declare", "let");
    }

    const resolve = compileVarDeclaration(step.declare);

    return (scope) => {
      resolve(scope);
    };

  },

  if(step, breakable) {

    if (!hasOwn.call(step, "condition")) {
      throw errorRequired2("condition", "if");
    }

    const { then, otherwise } = step;

    const resolveCondition = compileExp(step.condition);
    const resolveThen = then ? compileStep(then, breakable) : null;
    const resolveOtherwise = otherwise ? compileStep(otherwise, breakable) : null;

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

  for(step) {

    if (!hasOwn.call(step, "target")) {
      throw errorRequired2("target", "for");
    }

    const { body } = step;

    const resolveBody = body ? compileStep(body, true) : null;

    if (!resolveBody) {
      return functionReturning();
    }

    const { index, value } = step;
    const resolveTarget = compileExp<any[]>(step.target);

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

  break(step, breakable) {

    if (!breakable) {
      throw error('"break" is not allowed outside loops');
    }

    return functionReturning(
      step.type,
    );

  },

  return(step) {

    if (!hasOwn.call(step, "value")) {
      throw errorRequired2("value", "return");
    }

    const { value, type } = step;
    const resolveValue = compileExp(value);

    return (scope) => ({
      type,
      value: resolveValue(scope),
    });

  },

  throw(step) {

    if (!hasOwn.call(step, "msg")) {
      throw errorRequired2("msg", "throw");
    }

    const { type, msg } = step;

    const resolveMessage = isObj(msg) ? compileExp<string>(msg) : null;

    return (scope) => ({
      type,
      error: error(
        resolveMessage ? resolveMessage(scope) : `${msg}`,
      ),
    });

  },

};

// PARAMS

export function compileParam(params: FunctionParameter | FunctionParameter[]): InputArgsParser {

  function compileSingle(param: FunctionParameter, index: number): ArgsLibPopulator {

    if (!isObj(param)) {
      param = { id: param, type: "param" };
    }

    const { id } = param;

    const compileGetter = paramTable[param.type];

    if (!compileGetter) {
      throw errorInvalidType(param.type, "parameter");
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
  name?: string,
): ScopeBasedResolver<V> {

  const { params, body } = options;

  const parseArgs: InputArgsParser | null = !params
    ? null
    : compileParam(params);
  const resolveFuncBody = body ? compileStep(body) : null;

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

// LOGIC

function compileLogic(
  expressions: MultiTermExpressions,
  compare: (left: any, right: any) => any,
  exit: (value: any) => boolean,
): ScopeBasedResolver {

  const resolvers = expressions.map(compileExp);
  const len = resolvers.length;

  return (scope) => {

    let result;

    for (let i = 0; i < len; i++) {

      const itemResult = resolvers[i](scope);
      result = i ? compare(result, itemResult) : itemResult;

      if (exit(result)) {
        break;
      }

    }

    return result;

  };

}

// EXPRESSION

function compileExpSafe<V extends any = any>(expression: Expression, safe?: boolean) {

  if (!expression || !isObj(expression)) {
    throw errorInvalid(expression, "expression");
  }

  const { type } = expression;

  const compile = expressionTable[type] as (
    (expression: Expression, ignoreError?: boolean) => ScopeBasedResolver<V>
  ) | undefined;

  if (!compile) {
    throw errorInvalidType(type, "expression");
  }

  return compile(expression, safe);

}

export function compileExp<V extends any = any>(expression: Expression): ScopeBasedResolver<V> {
  return compileExpSafe(
    expression,
  );
}

// SPREADABLE

export function compileSpreadable<V = any>(
  expressions: SingleOrMulti<SpreadableExpression>,
): ScopeBasedResolver<V[]> {

  function compileSingle(expression: SpreadableExpression): ScopeBasedPopulator<V[]> {

    if (expression.type === "spread") {
      const resolveArray = compileExp<V[]>(expression.exp);
      return (scope, resolved) => {
        resolved.push.apply(
          resolved,
          resolveArray(scope),
        );
        return resolved;
      };
    }

    const resolveParam = compileExp(expression);
    return (scope, resolved) => {
      resolved.push(
        resolveParam(scope),
      );
      return resolved;
    };

  }

  if (!isArray(expressions)) {
    const populate = compileSingle(expressions);
    return (scope) => populate(scope, []);
  }

  const populators = expressions.map(compileSingle);

  return (scope) => populators.reduce(
    (result, populate) => populate(scope, result),
    [] as V[],
  );

}

// VARIABLE DECLARATION

export function compileVarDeclaration(sets: SingleOrMulti<string | DeclareWithValue>): ScopeBasedResolver<void> {

  function compileSingle(set: string | DeclareWithValue): ScopeBasedResolver<void> {

    if (!isObj(set)) {
      set = {
        id: set,
      };
    }

    const { id, value } = set;

    let resolveValue: ScopeBasedResolver | undefined;
    if (value) {
      resolveValue = compileExp(value);
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

  if (!isArray(sets)) {
    return compileSingle(sets);
  }

  const resolvers = sets.map<ScopeBasedResolver<void>>(compileSingle);

  return (scope) => {
    resolvers.forEach((resolve) => {
      resolve(scope);
    });
  };

}

// STEPS

export function compileStep<V = any>(
  steps: SingleOrMulti<FunctionStep>,
  breakable: true,
): ScopeBasedResolver<StepLoopResult>;
export function compileStep<V = any>(
  steps: SingleOrMulti<FunctionStep>,
  breakable?: false | undefined,
): ScopeBasedResolver<StepNonLoopResult>;
export function compileStep<V = any>(
  steps: SingleOrMulti<FunctionStep>,
  breakable?: boolean | undefined,
): ScopeBasedResolver<StepLoopResult>;
export function compileStep<V = any>(
  steps: SingleOrMulti<FunctionStep>,
  breakable?: boolean | undefined,
): ScopeBasedResolver<StepLoopResult> {

  function compileSingle(step: FunctionStep): ScopeBasedResolver<StepLoopResult> {

    if (!step || !isObj(step)) {
      throw errorInvalid(step, "step");
    }

    const compile = stepTable[step.type as StatementType] as StepCompiler<FunctionStep> | undefined;

    if (compile) {
      return compile(step, breakable);
    }

    const resolve = compileExp(step as Expression);

    return (scope) => {
      resolve(scope);
    };

  }

  if (!isArray(steps)) {
    return compileSingle(steps);
  }

  const resolvers = steps.map(compileSingle);

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
