import { SingleOrMulti } from "./helper-types";

// EXTENDABLE

interface WithType<T extends string> {
  type: T;
}

interface WithId<I> {
  id: I;
}

interface WithValue<V> {
  value: V;
}

interface WithConditions<C, T> {
  condition: C;
  then: T;
}

interface WithOtherwise<O> {
  otherwise: O;
}

interface WithOperation<O> {
  oper: O;
}

interface WithExpressions<E> {
  exp: E;
}

// COMMON

export type MultiTermExpressions = [Expression, Expression, ...Expression[]];

export interface DeclareWithValue extends
  WithId<string>,
  Partial<WithValue<Expression>> {
}

// FUNCTION OPTIONS

export interface BuildFunctionOptions {
  name?: string;
  params?: SingleOrMulti<FunctionParameter>;
  body: SingleOrMulti<FunctionStep>;
}

// PARAMETERS

export interface ParameterDescriptor extends
  WithType<"param" | "rest">,
  WithId<string> {
}

export type FunctionParameter = string | ParameterDescriptor;

// EXPRESSIONS

export interface LiteralExpression extends
  WithType<"literal">,
  WithValue<any> {
}

export interface GetExpression extends
  WithType<"get">,
  WithId<string | Expression> {
}

export interface SetExpression extends
  WithType<"set">,
  WithId<string | Expression>,
  WithValue<any> {
}

export interface FunctionCallExpression extends
  WithType<"call"> {

  func: Expression;
  args?: SingleOrMulti<SpreadableExpression>;
}

export interface TernaryExpression extends
  WithType<"ternary">,
  WithConditions<Expression, Expression>,
  WithOtherwise<Expression> {
}

export type BooleanOperator =
  | "=="
  | "==="
  | "!="
  | "!=="
  | ">"
  | ">="
  | "<"
  | "<=";

export type LogicOperator =
  | "&&"
  | "||";

export type BitwiseOperator =
  | "&"
  | "|"
  | "^"
  | ">>"
  | "<<";

export type RegularArithmeticOperator =
  | "+"
  | "-"
  | "*"
  | "/"
  | "%";

export type SpecialArithmeticOperator =
  | "**";

export type TransformOperator =
  | "!"
  | "!!"
  | "typeof"
  | "~";

export type SpecialOperator =
  | LogicOperator
  | SpecialArithmeticOperator;

export type RegularOperator =
  | RegularArithmeticOperator
  | BitwiseOperator
  | BooleanOperator;

export type MultiTermOperator =
  | SpecialOperator
  | RegularOperator;

export interface OperationExpression extends
  WithType<"oper">,
  WithOperation<MultiTermOperator>,
  WithExpressions<MultiTermExpressions> {
}

export interface TransformExpression extends
  WithType<"trans">,
  WithOperation<TransformOperator>,
  WithExpressions<Expression> {
}

export interface FunctionExpression extends
  WithType<"func">,
  BuildFunctionOptions {
}

export type Expression =
  | LiteralExpression
  | GetExpression
  | SetExpression
  | FunctionCallExpression
  | TernaryExpression
  | OperationExpression
  | TransformExpression
  | FunctionExpression;

export type ExpresionType = Expression["type"];

export interface SpreadExpression extends
  WithType<"spread">,
  WithExpressions<Expression> {
}

// ARGUMENTS

export type SpreadableExpression = Expression | SpreadExpression;

// STATEMENTS

export interface DeclareStatement extends
  WithType<"declare"> {

  set: SingleOrMulti<string | DeclareWithValue>;
}

export interface IfStatement extends
  WithType<"if">,
  WithConditions<Expression, SingleOrMulti<FunctionStep>>,
  Partial<WithOtherwise<SingleOrMulti<FunctionStep>>> {
}

export interface ForStatement extends
  WithType<"for"> {

  target: Expression;
  value: string;
  index: string;
  body: SingleOrMulti<FunctionStep>;
}

export interface BreakStatement extends
  WithType<"break"> {
}

export interface ReturnStatement extends
  WithType<"return">,
  WithValue<Expression> {
}

export interface ThrowStatement extends
  WithType<"throw"> {

  msg: string | Expression;
}

export type Statement =
  | DeclareStatement
  | IfStatement
  | ForStatement
  | BreakStatement
  | ReturnStatement
  | ThrowStatement;

// STEPS

export type FunctionStep =
  | Statement
  | Expression;

export interface StepReturn<V = any> extends
  WithType<"return">,
  WithValue<V> {
}

export interface StepThrow extends
  WithType<"throw"> {

  error: Error;
}

export type StepNonLoopResult<V = any> =
  | StepReturn<V>
  | StepThrow
  | void;

export type StepLoopResult<V = any> =
  | "break"
  | StepNonLoopResult<V>;

// SCOPE

export type ScopeLib = Record<string, any>;

export interface Scope extends ScopeLib {
  parent: Scope | null;
}

// GENERAL

export type ScopeBasedPopulator<R> = (scope: Scope, target: R) => R;
export type ScopeBasedResolver<V extends any = any> = (scope: Scope) => V;
export type ArgsLibPopulator = (input: any[], lib: ScopeLib) => ScopeLib;
export type InputArgsParser = (input: any[]) => ScopeLib;

export type StepCompiler<S extends FunctionStep, V> =
  (step: S, allowBreak?: boolean) => ScopeBasedResolver<StepLoopResult<V>>;
