import { SingleOrMulti } from './helper-types';
import { BinaryOperationExpression, BuildFunctionOptions, FunctionBase, FunctionParameterDescriptor, TernaryOperationExpression, UnaryOperationExpression, VariableDeclaration } from './types';

export type FunctionOptions = FunctionBase;
export type NamedFunctionOptions = BuildFunctionOptions;
export type ParameterDescriptor = FunctionParameterDescriptor;
export type TransformExpression = UnaryOperationExpression;
export type OperationExpression = BinaryOperationExpression;
export type TernaryExpression = TernaryOperationExpression;

export interface DeprecatedDeclareStatement {
  type: 'declare';
  set: SingleOrMulti<VariableDeclaration>;
}
