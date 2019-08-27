import {
  CompileCache,
  ExpresionType,
  Expression,
  FunctionStep,
  ScopeBasedResolver,
  Statement,
  StatementType,
  StepLoopResult,
} from "./types";

export type SingleOrMulti<T> = T | T[];
export type AnyFunction = (...args: any[]) => any;

export type ExpressionCompiler<E extends Expression> =
  (expression: E, cache: CompileCache, safe?: boolean) => ScopeBasedResolver<any>;

export type ExpressionLookupTable<E extends Expression = Expression> = {
  [K in ExpresionType]: (
    E extends { type: K }
    ? ExpressionCompiler<E>
    : never
  );
};

export type StepCompiler<S extends FunctionStep> =
  (step: S, cache: CompileCache, breakable?: boolean) => ScopeBasedResolver<StepLoopResult>;

export type StatementLookupTable<S extends Statement = Statement> = {
  [K in StatementType]: (
    S extends { type: K }
    ? StepCompiler<S>
    : never
  );
};
