import type {
  BinaryOperationExpression,
  BinaryOperator,
  BlockStep,
  Expression,
  FunctionCallExpression,
  GetExpression,
  IfStatement,
  LiteralExpression,
  ReturnStatement,
  SetExpression,
  SpreadableExpression,
  TernaryOperationExpression,
  UnaryOperationExpression,
  UnaryOperator,
} from '../../src';

export const $literal = (value: unknown): LiteralExpression => ({
  type: 'literal',
  value,
});

export const $get = (id: string): GetExpression => ({
  type: 'get',
  id,
});

export const $set = (id: string, value: Expression): SetExpression => ({
  type: 'set',
  id,
  value,
});

export const $call = (func: Expression, ...args: SpreadableExpression[]): FunctionCallExpression => {

  const exp: FunctionCallExpression = {
    type: 'call',
    func,
  };

  if (args.length) {
    exp.args = args.length > 1 ? args : args[0];
  }

  return exp;

};

export const $ternary = (condition: Expression, then: Expression, otherwise: Expression): TernaryOperationExpression => ({
  type: 'ternary',
  condition,
  then,
  otherwise,
});

export const $binary = (
  oper: BinaryOperator,
  ...exp: [Expression, Expression, ...Expression[]]
): BinaryOperationExpression => ({
  type: 'oper',
  oper,
  exp,
});

export const $unary = (oper: UnaryOperator, exp: Expression): UnaryOperationExpression => ({
  type: 'trans',
  oper,
  exp,
});

export const $if = (
  condition: Expression,
  then: BlockStep | BlockStep[],
  otherwise?: BlockStep | BlockStep[],
): IfStatement => {

  const step: IfStatement = {
    type: 'if',
    condition,
    then,
  };

  if (otherwise) {
    step.otherwise = otherwise;
  }

  return step;

};

export const $return = (value: Expression): ReturnStatement => ({
  type: 'return',
  value,
});
