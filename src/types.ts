import { SingleOrMulti } from "./helper-types";

// EXTENDABLE

interface WithType<T extends string> {
  type: T;
}

interface WithId {
  id: string;
}

interface WithValue<V> {
  value: V;
}

interface WithConditions {
  condition: Expression;
}

interface WithThen<T> {
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
  WithId,
  Partial<WithValue<Expression>> {
}

export type VariableDeclaration = string | DeclareWithValue;

// FUNCTION OPTIONS

export interface FunctionOptions {
  params?: SingleOrMulti<FunctionParameter>;
  body?: SingleOrMulti<FunctionStep>;
}

export interface NamedFunctionOptions extends FunctionOptions {
  name?: string;
}

// PARAMETERS

export type ParameterType = "param" | "rest";

export interface ParameterDescriptor extends
  WithId,
  WithType<ParameterType> {
}

export type FunctionParameter = string | ParameterDescriptor;

// EXPRESSIONS

export interface LiteralExpression extends
  WithType<"literal">,
  WithValue<any> {
}

export interface GetExpression extends
  WithType<"get">,
  WithId {
}

export interface SetExpression extends
  WithType<"set">,
  WithId,
  WithValue<Expression> {
}

export interface FunctionCallExpression extends
  WithType<"call"> {

  func: Expression;
  args?: SingleOrMulti<SpreadableExpression>;
}

export interface TernaryExpression extends
  WithType<"ternary">,
  WithConditions,
  WithThen<Expression>,
  WithOtherwise<Expression> {
}

export type SpecialLogicOperator =
  | "&&"
  | "||";

export type RegularLogicOperator =
  | "=="
  | "==="
  | "!="
  | "!=="
  | ">"
  | ">="
  | "<"
  | "<=";

export type BitwiseOperator =
  | "&"
  | "|"
  | "^"
  | "<<"
  | ">>"
  | ">>>";

export type RegularArithmeticOperator =
  | "+"
  | "-"
  | "*"
  | "/"
  | "%";

export type SpecialArithmeticOperator =
  | "**";

export type SpecialOperator =
  | SpecialLogicOperator
  | SpecialArithmeticOperator;

export type RegularOperator =
  | RegularLogicOperator
  | RegularArithmeticOperator
  | BitwiseOperator;

export type MultiTermOperator =
  | SpecialOperator
  | RegularOperator;

export interface OperationExpression extends
  WithType<"oper">,
  WithOperation<MultiTermOperator>,
  WithExpressions<MultiTermExpressions> {
}

export type SpecialTransformOperator =
  | "typeof";

export type RegularTransformOperator =
  | "!"
  | "!!"
  | "~";

export type TransformOperator =
  | SpecialTransformOperator
  | RegularTransformOperator;

export interface TransformExpression extends
  WithType<"trans">,
  WithOperation<TransformOperator>,
  WithExpressions<Expression> {
}

export interface FunctionExpression extends
  WithType<"func">,
  FunctionOptions {
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

export interface DeprecatedDeclareStatement extends
  WithType<"declare"> {

  set: SingleOrMulti<VariableDeclaration>;
}

export interface LetStatement extends
  WithType<"let"> {

  declare: SingleOrMulti<VariableDeclaration>;
}

export interface IfStatement extends
  WithType<"if">,
  WithConditions,
  Partial<WithThen<SingleOrMulti<FunctionStep>>>,
  Partial<WithOtherwise<SingleOrMulti<FunctionStep>>> {
}

export interface ForStatement extends
  WithType<"for"> {

  target: Expression;
  value?: string;
  index?: string;
  body?: SingleOrMulti<FunctionStep>;
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
  | DeprecatedDeclareStatement
  | LetStatement
  | IfStatement
  | ForStatement
  | BreakStatement
  | ReturnStatement
  | ThrowStatement;

export type StatementType = Statement["type"];

// STEPS

export type FunctionStep =
  | Statement
  | Expression;

export interface StepReturn extends
  WithType<"return">,
  WithValue<Expression> {
}

export interface StepThrow extends
  WithType<"throw"> {

  error: Error;
}

export type StepNonLoopResult =
  | StepReturn
  | StepThrow
  | void;

export type StepLoopResult =
  | "break"
  | StepNonLoopResult;

// SCOPE

export type EnvLib = Record<string, any>;

export interface Environment extends EnvLib {
  parent: Environment | null;
}

export interface EnvFound<V> {
  env: Environment;
  id: string;
}

// GENERAL

export type EnvBasedPopulator<R> = (env: Environment, target: R) => R;
export type EnvBasedResolver<V extends any = any> = (env: Environment) => V;
export type ArgsLibPopulator = (input: any[], lib: EnvLib) => EnvLib;
export type InputArgsParser = (input: any[]) => EnvLib;

export interface CompileCache {
  param?: Record<string, ArgsLibPopulator>;
  let?: Record<string, EnvBasedResolver<void>>;
  spread?: Record<string, EnvBasedPopulator<any[]>>;
  exp?: Record<string, EnvBasedResolver>;
  step?: Record<string, EnvBasedResolver>;
}
