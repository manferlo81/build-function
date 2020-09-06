import { SingleOrMulti, Typed } from './helper-types';
import { DeprecatedDeclareStatement } from './legacy-types';

export interface FunctionBase {
  params?: SingleOrMulti<FunctionParameter>;
  body?: SingleOrMulti<FunctionStep>;
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

export type ExpresionType =
  | 'literal'
  | 'get'
  | 'set'
  | 'trans'
  | 'oper'
  | 'ternary'
  | 'func'
  | 'call';

type TypedExpresion<T extends ExpresionType> = Typed<T>;

export interface LiteralExpression extends TypedExpresion<'literal'> {
  value: any;
}

export interface GetExpression extends TypedExpresion<'get'> {
  id: string;
}

export interface SetExpression extends TypedExpresion<'set'> {
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

export interface UnaryOperationExpression extends TypedExpresion<'trans'> {
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

export interface BinaryOperationExpression extends TypedExpresion<'oper'> {
  oper: BinaryOperator;
  exp: BinaryOperationOperandExpressions;
}

export interface TernaryOperationExpression extends TypedExpresion<'ternary'> {
  condition: Expression;
  then: Expression;
  otherwise: Expression;
}

export interface FunctionExpression extends TypedExpresion<'func'>, FunctionBase { }

export interface FunctionCallExpression extends TypedExpresion<'call'> {
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
  then?: SingleOrMulti<FunctionStep>;
  otherwise?: SingleOrMulti<FunctionStep>;
}

export interface ForStatement extends TypedStatement<'for'> {
  target: Expression;
  value?: string;
  index?: string;
  body?: SingleOrMulti<FunctionStep>;
}

export type BreakStatement = TypedStatement<'break'>;

export interface TryStatement extends TypedStatement<'try'> {
  body?: SingleOrMulti<FunctionStep>;
  error?: string;
  catch?: SingleOrMulti<FunctionStep>;
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

export type FunctionStep =
  | Expression
  | Statement;

export interface StepReturn {
  type: 'return';
  value: Expression;
}

export interface StepThrow {
  type: 'throw';
  msg: string;
}

export type StepNonLoopResult =
  | StepReturn
  | StepThrow
  | void;

export type StepLoopResult =
  | 'break'
  | StepNonLoopResult;

export type EnvLib = Record<string, any>;

export interface Environment extends EnvLib {
  parent: Environment | null;
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
