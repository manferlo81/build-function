import type {
  BinaryOperationExpression,
  BinaryOperationOperandExpressions,
  BinaryOperator,
  BlockStep,
  BuildFunctionOptions,
  FunctionBase,
  FunctionParameterDescriptor,
  LoopBlockResult,
  NonLoopBlockResult,
  RegularBinaryOperator,
  RegularUnaryOperator,
  ReturnBlockResult,
  SingleOrMulti,
  SpecialBinaryOperator,
  SpecialUnaryOperator,
  TernaryOperationExpression,
  ThrowBlockResult,
  Typed,
  UnaryOperationExpression,
  UnaryOperator,
  VariableDeclaration,
} from './types';

export type FunctionOptions = FunctionBase;
export type NamedFunctionOptions = BuildFunctionOptions;
export type ParameterDescriptor = FunctionParameterDescriptor;
export type TransformExpression = UnaryOperationExpression;
export type OperationExpression = BinaryOperationExpression;
export type TernaryExpression = TernaryOperationExpression;
export type MultiTermExpressions = BinaryOperationOperandExpressions;

export type RegularTransformOperator = RegularUnaryOperator;
export type SpecialTransformOperator = SpecialUnaryOperator;
export type TransformOperator = UnaryOperator;
export type MultiTermOperator = BinaryOperator;
export type SpecialOperator = SpecialBinaryOperator;
export type RegularOperator = RegularBinaryOperator;

export type StepNonLoopResult = NonLoopBlockResult;
export type StepThrow = ThrowBlockResult;
export type StepLoopResult = LoopBlockResult;
export type StepReturn = ReturnBlockResult;
export type FunctionStep = BlockStep;

export interface DeprecatedDeclareStatement extends Typed<'declare'> {
  set: SingleOrMulti<VariableDeclaration>;
}
