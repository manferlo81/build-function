import { DeprecatedDeclareStatement } from './legacy-types';

export type SingleOrMulti<T> = T | T[];
export type UnknownFunction = (this: unknown, ...args: unknown[]) => unknown;

export interface Typed<T extends string> {
  type: T;
}

export interface FunctionBase {
  params?: SingleOrMulti<FunctionParameter>;
  body?: SingleOrMulti<BlockStep>;
}

export interface BuildFunctionOptions extends FunctionBase {
  name?: string;
}

export type ParameterType =
  | 'param'
  | 'rest';

export interface FunctionParameterDescriptor extends Typed<ParameterType> {
  id: string;
}

export type FunctionParameter = string | FunctionParameterDescriptor;

export type ExpressionType =
  | 'literal'
  | 'get'
  | 'set'
  | 'trans'
  | 'oper'
  | 'ternary'
  | 'func'
  | 'call';

type TypedExpression<T extends ExpressionType> = Typed<T>;

export interface LiteralExpression extends TypedExpression<'literal'> {
  value: unknown;
}

export interface GetExpression extends TypedExpression<'get'> {
  id: string;
}

export interface SetExpression extends TypedExpression<'set'> {
  id: string;
  value: Expression;
}

export type RegularUnaryOperator =
  | '!'
  | '!!'
  | '~';

export type SpecialUnaryOperator =
  | 'typeof';

export type UnaryOperator =
  | SpecialUnaryOperator
  | RegularUnaryOperator;

export interface UnaryOperationExpression extends TypedExpression<'trans'> {
  oper: UnaryOperator;
  exp: Expression;
}

export type RegularLogicOperator =
  | '=='
  | '==='
  | '!='
  | '!=='
  | '>'
  | '>='
  | '<'
  | '<=';

export type SpecialLogicOperator =
  | '&&'
  | '||'
  | '??';

export type RegularArithmeticOperator =
  | '+'
  | '-'
  | '*'
  | '/'
  | '%';

export type SpecialArithmeticOperator =
  | '**';

export type BitwiseOperator =
  | '&'
  | '|'
  | '^'
  | '<<'
  | '>>'
  | '>>>';

export type SpecialBinaryOperator =
  | SpecialLogicOperator
  | SpecialArithmeticOperator;

export type RegularBinaryOperator =
  | RegularLogicOperator
  | RegularArithmeticOperator
  | BitwiseOperator;

export type BinaryOperator =
  | SpecialBinaryOperator
  | RegularBinaryOperator;

export type BinaryOperationOperandExpressions = [Expression, Expression, ...Expression[]];

export interface BinaryOperationExpression extends TypedExpression<'oper'> {
  oper: BinaryOperator;
  exp: BinaryOperationOperandExpressions;
}

export interface TernaryOperationExpression extends TypedExpression<'ternary'> {
  condition: Expression;
  then: Expression;
  otherwise: Expression;
}

export interface FunctionExpression extends TypedExpression<'func'>, FunctionBase { }

export interface FunctionCallExpression extends TypedExpression<'call'> {
  func: Expression;
  args?: SingleOrMulti<SpreadableExpression>;
}

export type Expression =
  | LiteralExpression
  | GetExpression
  | SetExpression
  | UnaryOperationExpression
  | BinaryOperationExpression
  | TernaryOperationExpression
  | FunctionExpression
  | FunctionCallExpression;

export interface SpreadExpression extends Typed<'spread'> {
  exp: Expression;
}

export type SpreadableExpression = Expression | SpreadExpression;

type DeprecatedStatementType = 'declare';

export type StatementType =
  | DeprecatedStatementType
  | 'let'
  | 'if'
  | 'for'
  | 'break'
  | 'try'
  | 'throw'
  | 'return';

type TypedStatement<T extends StatementType> = Typed<T>;

export interface DeclareWithValue {
  id: string;
  value?: Expression;
}

export type VariableDeclaration = string | DeclareWithValue;

export interface LetStatement extends TypedStatement<'let'> {
  declare: SingleOrMulti<VariableDeclaration>;
}

export interface IfStatement extends TypedStatement<'if'> {
  condition: Expression;
  then?: SingleOrMulti<BlockStep>;
  otherwise?: SingleOrMulti<BlockStep>;
}

export interface ForStatement extends TypedStatement<'for'> {
  target: Expression;
  value?: string;
  index?: string;
  body?: SingleOrMulti<BlockStep>;
}

export type BreakStatement = TypedStatement<'break'>;

export interface TryStatement extends TypedStatement<'try'> {
  body?: SingleOrMulti<BlockStep>;
  error?: string;
  catch?: SingleOrMulti<BlockStep>;
}

export interface ThrowStatement extends TypedStatement<'throw'> {
  msg: string | Expression;
}

export interface ReturnStatement extends TypedStatement<'return'> {
  value: Expression;
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

export type BlockStep =
  | Expression
  | Statement;

export interface ReturnBlockResult {
  type: 'return';
  value: Expression;
}

export interface ThrowBlockResult {
  type: 'throw';
  msg: string;
}

export type NonLoopBlockResult =
  | ReturnBlockResult
  | ThrowBlockResult
  | void;

export type LookBreakResult = 'break';

export type LoopBlockResult =
  | LookBreakResult
  | NonLoopBlockResult;

export type EnvLib = Record<string, any>;

export interface EnvValue {
  readonly: boolean;
  value: unknown;
}

export interface Environment {
  parent: Environment | null;
  values: Record<string, EnvValue>;
}

export interface EnvFound {
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
