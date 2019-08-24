import { ExpresionType, Expression, ScopeBasedResolver, Statement, StatementType, StepCompiler } from "./types";

export type SingleOrMulti<T> = T | T[];
export type AnyFunction = (...args: any[]) => any;

export type ExpressionLookupTable<E extends Expression = Expression> = {
  [K in ExpresionType]: (
    E extends { type: K }
    ? <V>(expression: E, ignoreError?: boolean) => ScopeBasedResolver<V>
    : never
  );
};

export type StatementLookupTable<S extends Statement = Statement> = {
  [K in StatementType]: (
    S extends { type: K }
    ? StepCompiler<S>
    : never
  );
};
