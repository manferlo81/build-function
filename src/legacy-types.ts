import { SingleOrMulti, Typed } from './helper-types';
import { BinaryOperationExpression, BinaryOperationOperandExpressions, BinaryOperator, BuildFunctionOptions, FunctionBase, FunctionParameterDescriptor, RegularBinaryOperator, RegularUnaryOperator, SpecialBinaryOperator, SpecialUnaryOperator, TernaryOperationExpression, UnaryOperationExpression, UnaryOperator, VariableDeclaration } from './types';

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

export interface DeprecatedDeclareStatement extends Typed<'declare'> {
  set: SingleOrMulti<VariableDeclaration>;
}
