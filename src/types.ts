import { SingleOrMulti } from "./helper-types";

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

export interface ParameterDescriptor {
  id: string;
  type: ParameterType;
}

export type FunctionParameter = string | ParameterDescriptor;

// EXPRESSIONS

export interface LiteralExpression {
  type: "literal";
  value: any;
}

export interface GetExpression {
  type: "get";
  id: string;
}

export interface SetExpression {
  type: "set";
  id: string;
  value: Expression;
}

export interface FunctionCallExpression {
  type: "call";
  func: Expression;
  args?: SingleOrMulti<SpreadableExpression>;
}

export interface TernaryExpression {
  type: "ternary";
  condition: Expression;
  then: Expression;
  otherwise: Expression;
}

export type RegularLogicOperator =
  | "=="
  | "==="
  | "!="
  | "!=="
  | ">"
  | ">="
  | "<"
  | "<=";

export type SpecialLogicOperator =
  | "&&"
  | "||";

export type RegularArithmeticOperator =
  | "+"
  | "-"
  | "*"
  | "/"
  | "%";

export type SpecialArithmeticOperator =
  | "**";

export type BitwiseOperator =
  | "&"
  | "|"
  | "^"
  | "<<"
  | ">>"
  | ">>>";

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

export type MultiTermExpressions = [Expression, Expression, ...Expression[]];

export interface OperationExpression {
  type: "oper";
  oper: MultiTermOperator;
  exp: MultiTermExpressions;
}

export type RegularTransformOperator =
  | "!"
  | "!!"
  | "~";

export type SpecialTransformOperator =
  | "typeof";

export type TransformOperator =
  | SpecialTransformOperator
  | RegularTransformOperator;

export interface TransformExpression {
  type: "trans";
  oper: TransformOperator;
  exp: Expression;
}

export interface FunctionExpression extends FunctionOptions {
  type: "func";
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

export interface SpreadExpression {
  type: "spread";
  exp: Expression;
}

// ARGUMENTS

export type SpreadableExpression = Expression | SpreadExpression;

// STATEMENTS

export interface DeclareWithValue {
  id: string;
  value?: Expression;
}

export type VariableDeclaration = string | DeclareWithValue;

export interface DeprecatedDeclareStatement {
  type: "declare";
  set: SingleOrMulti<VariableDeclaration>;
}

export interface LetStatement {
  type: "let";
  declare: SingleOrMulti<VariableDeclaration>;
}

export interface IfStatement {
  type: "if";
  condition: Expression;
  then?: SingleOrMulti<FunctionStep>;
  otherwise?: SingleOrMulti<FunctionStep>;
}

export interface ForStatement {
  type: "for";
  target: Expression;
  value?: string;
  index?: string;
  body?: SingleOrMulti<FunctionStep>;
}

export interface BreakStatement {
  type: "break";
}

export interface ReturnStatement {
  type: "return";
  value: Expression;
}

export interface TryStatement {
  type: "try";
  body?: SingleOrMulti<FunctionStep>;
  error?: string;
  catch?: SingleOrMulti<FunctionStep>;
}

export interface ThrowStatement {
  type: "throw";
  msg: string | Expression;
}

export type Statement =
  | DeprecatedDeclareStatement
  | LetStatement
  | IfStatement
  | ForStatement
  | BreakStatement
  | ReturnStatement
  | TryStatement
  | ThrowStatement;

export type StatementType = Statement["type"];

// STEPS

export type FunctionStep =
  | Statement
  | Expression;

export interface StepReturn {
  type: "return";
  value: Expression;
}

export interface StepThrow {
  type: "throw";
  msg: string;
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

export interface CompileCache {
  param?: Record<string, ArgsLibPopulator>;
  let?: Record<string, EnvBasedResolver<void>>;
  spread?: Record<string, EnvBasedPopulator<any[]>>;
  exp?: Record<string, EnvBasedResolver>;
  step?: Record<string, EnvBasedResolver>;
}
