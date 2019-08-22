import { error, errorInvalid } from "./errors";
import { functionReturning } from "./helpers";
import { createScope, findInScopeOrThrow, setInScope } from "./scope";
import { isArray, isObj } from "./type-check";

import { AnyFunction, ExpressionLookupTable, SingleOrMulti, StatementLookupTable } from "./helper-types";
import {
  ArgsLibPopulator,
  BuildFunctionOptions,
  DeclareWithValue,
  Expression,
  FunctionParameter,
  FunctionStep,
  InputArgsParser,
  MultiTermExpressions,
  RegularArithmeticOperator,
  RegularOperator,
  ScopeBasedPopulator,
  ScopeBasedResolver,
  ScopeLib,
  SpecialOperator,
  SpreadableExpression,
  Statement,
  StepCompiler,
  StepLoopResult,
  StepNonLoopResult,
  StepReturn,
  StepThrow,
  TransformOperator,
} from "./types";

// EXPRESSION LOOKUP TABLE

const specialOperationTable: Record<
  SpecialOperator,
  (expressions: MultiTermExpressions) => ScopeBasedResolver<any>
> = {

  "||": (expressions) => compileLogicOperation(
    expressions,
    (left, right) => (left || right),
    (value) => value,
  ),

  "&&": (expressions) => compileLogicOperation(
    expressions,
    (left, right) => (left && right),
    (value) => !value,
  ),

  "**": (expressions) => {

    const resolvers = expressions.map(compileExpression);
    const resolveLast = resolvers.pop() as ScopeBasedResolver<any>;

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

const transformTable: Record<TransformOperator, (value: any) => any> = {
  "!": (value) => !value,
  "!!": (value) => !!value,
  "typeof": (value) => (typeof value),
  // tslint:disable-next-line: no-bitwise
  "~": (value) => ~value,
};

const expressionTable: ExpressionLookupTable<Expression> = {

  literal(expression) {

    return functionReturning(
      expression.value,
    );

  },

  get(expression) {

    const { id } = expression;

    const resolveId = isObj(id) ? compileExpression<string>(id) : null;

    return (scope) => (
      findInScopeOrThrow<any>(
        scope,
        resolveId ? resolveId(scope) : id as string,
      ).value
    );

  },

  set(expression) {

    const { id } = expression;
    const resolveId = isObj(id) ? compileExpression<string>(id) : null;
    const resolveValue = compileExpression(expression.value);

    return (scope) => {
      const result = findInScopeOrThrow<any>(
        scope,
        resolveId ? resolveId(scope) : id as string,
      );
      return result.scope[result.id] = resolveValue(scope);
    };

  },

  call(expression) {

    const { args } = expression;

    const resolveFunc = compileExpression<AnyFunction>(expression.func);
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

    const resolveCondition = compileExpression(expression.condition);
    const resolveThen = compileExpression(expression.then);
    const resolveOtherwise = compileExpression(expression.otherwise);

    return (scope) => resolveCondition(scope)
      ? resolveThen(scope)
      : resolveOtherwise(scope);

  },

  oper(expression) {

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
      throw errorInvalid(oper, "operation");
    }

    const [resolveFirst, ...otherResolvers] = exp.map(compileExpression);

    return (scope) => {
      return otherResolvers.reduce(
        (total, resolve) => reducer(total, resolve(scope)),
        resolveFirst(scope),
      );
    };

  },

  trans(expression) {

    const transform = transformTable[expression.oper];

    if (!transform) {
      throw errorInvalid(expression.oper, "transform operation");
    }

    const resolve = compileExpression(expression.exp);

    return (scope) => {
      return transform(resolve(scope));
    };

  },

  func(expression) {

    return compileFunction(expression, false) as any;

  },

};

const stepTable: StatementLookupTable<Statement> = {

  declare(step) {

    const resolve = compileVarDeclaration(step.set);

    return (scope) => {
      resolve(scope);
    };

  },

  if(step, allowBreak) {

    const { condition, then, otherwise } = step;
    const resolveCondition = compileExpression(condition);
    const resolveThen = compileStep(then, allowBreak);
    const resolveOtherwise = otherwise ? compileStep(otherwise, allowBreak) : null;

    return (scope) => {
      const conditionResult = resolveCondition(scope);
      const resolveSteps = conditionResult ? resolveThen : resolveOtherwise;
      if (resolveSteps) {
        return resolveSteps(
          createScope(scope),
        );
      }
    };

  },

  for(step) {

    const { index: indexId, value: valueId, target, body } = step;

    const resolveTarget = compileExpression<any[]>(target);
    const resolveBody = compileStep(body, true);

    return (scope): StepReturn<any> | StepThrow | void => {

      const array = resolveTarget(scope);
      const len = array.length;

      let i = 0;
      const bodyScope = createScope(scope);

      while (i < len) {

        setInScope(
          bodyScope,
          indexId,
          i,
        );
        setInScope(
          bodyScope,
          valueId,
          array[i],
        );

        const result = resolveBody(bodyScope);

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

  break(step, allowBreak) {

    if (!allowBreak) {
      throw error('"break" is not allowed outside loops');
    }

    return functionReturning(
      step.type,
    );

  },

  return(step) {

    const { value, type } = step;
    const resolveValue = compileExpression(value);

    return (scope) => ({
      type,
      value: resolveValue(scope),
    });

  },

  throw(step) {

    const { type, msg } = step;

    const resolveMessage = isObj(msg) ? compileExpression<string>(msg) : null;

    return (scope) => ({
      type,
      error: error(
        resolveMessage ? resolveMessage(scope) : msg as string,
      ),
    });

  },

  // literal: ignoreExpressionAsStep,
  // get: ignoreExpressionAsStep,
  // set: compileExpressionAsStep,
  // call: compileExpressionAsStep,
  // ternary: compileExpressionAsStep,
  // oper: compileExpressionAsStep,
  // trans: compileExpressionAsStep,
  // func: ignoreExpressionAsStep,

};

// PARAMS

export function compileParam(params: FunctionParameter | FunctionParameter[]): InputArgsParser {

  function compileSingle(param: FunctionParameter, index: number): ArgsLibPopulator {

    if (!isObj(param)) {
      param = { id: param, type: "param" };
    }

    const { id, type } = param;

    return type === "rest"
      ? (input, lib) => {
        const arg: any[] = [];
        const len = input.length;
        for (let i = index; i < len; i++) {
          arg.push(
            input[i],
          );
        }
        lib[id] = arg;
        return lib;
      }
      : (input, lib) => {
        lib[id] = input[index];
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

export function compileFunction<V extends AnyFunction = AnyFunction>(
  options: BuildFunctionOptions,
  addToScope: boolean,
): ScopeBasedResolver<V> {

  const { name, params, body } = options;

  const parseArgs: InputArgsParser | null = !params
    ? null
    : compileParam(params);
  const resolveFuncBody = compileStep(body);

  return (scope): V => {

    // tslint:disable-next-line: space-before-function-paren only-arrow-functions
    const func: AnyFunction = function (...args: any[]) {
      const funcBodyScope = createScope(
        funcScope,
        {
          arguments: args,
          ...parseArgs && parseArgs(args),
        },
      );
      const result = resolveFuncBody(funcBodyScope);
      if (result) {
        if (result.type === "throw") {
          throw result.error;
        }
        return result.value;
      }
    };

    const funcScope = (addToScope && name) ? createScope(scope, { [name]: func }) : scope;

    return func as V;

  };

}

// LOGIC

function compileLogicOperation(
  expressions: MultiTermExpressions,
  compare: (left: any, right: any) => any,
  exit: (value: any) => boolean,
): ScopeBasedResolver<any> {

  const resolvers = expressions.map(compileExpression);
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

export function compileExpression<V extends any = any>(expression: Expression): ScopeBasedResolver<V> {

  const { type } = expression;

  const compile = expressionTable[type] as (
    (expression: Expression) => ScopeBasedResolver<V>
  ) | undefined;

  if (!compile) {
    throw errorInvalid(type, "expression");
  }

  return compile(expression);

}

// SPREADABLE

export function compileSpreadable<V = any>(
  expressions: SingleOrMulti<SpreadableExpression>,
): ScopeBasedResolver<V[]> {

  function compileSingle(expression: SpreadableExpression): ScopeBasedPopulator<V[]> {

    if (expression.type === "spread") {
      const resolveArray = compileExpression<V[]>(expression.exp);
      return (scope, resolved) => {
        resolved.push.apply(
          resolved,
          resolveArray(scope),
        );
        return resolved;
      };
    }

    const resolveParam = compileExpression(expression);
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
      resolveValue = compileExpression(value);
    }

    return (scope) => {
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
  allowBreak: true,
): ScopeBasedResolver<StepLoopResult<V>>;
export function compileStep<V = any>(
  steps: SingleOrMulti<FunctionStep>,
  allowBreak?: false | undefined,
): ScopeBasedResolver<StepNonLoopResult<V>>;
export function compileStep<V = any>(
  steps: SingleOrMulti<FunctionStep>,
  allowBreak?: boolean | undefined,
): ScopeBasedResolver<StepLoopResult<V>>;
export function compileStep<V = any>(
  steps: SingleOrMulti<FunctionStep>,
  allowBreak?: boolean | undefined,
): ScopeBasedResolver<StepLoopResult<V>> {

  function compileSingle(step: FunctionStep): ScopeBasedResolver<StepLoopResult<any>> {

    const compile = stepTable[step.type as Statement["type"]] as StepCompiler<FunctionStep, any> | undefined;

    if (compile) {
      return compile(step, allowBreak);
    }

    const resolve = compileExpression(step as Expression);

    return (scope) => {
      resolve(scope);
    };

  }

  if (!isArray(steps)) {
    return compileSingle(steps);
  }

  const resolvers = steps.map(compileSingle);

  return (scope): StepLoopResult<V> => {

    for (let i = 0, len = resolvers.length; i < len; i++) {

      const resolveStep = resolvers[i];
      const result = resolveStep(scope);

      if (result) {
        return result;
      }

    }

  };

}
