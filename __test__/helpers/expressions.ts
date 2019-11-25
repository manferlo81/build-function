import {
  Expression,
  FunctionCallExpression,
  FunctionStep,
  GetExpression,
  IfStatement,
  LiteralExpression,
  MultiTermOperator,
  OperationExpression,
  ReturnStatement,
  SetExpression,
  SpreadableExpression,
  TernaryExpression,
  TransformExpression,
  TransformOperator,
} from '../../src'

export const $literal = (value: any): LiteralExpression => ({
  type: 'literal',
  value,
})

export const $get = (id: string): GetExpression => ({
  type: 'get',
  id,
})

export const $set = (id: string, value: Expression): SetExpression => ({
  type: 'set',
  id,
  value,
})

export const $call = (func: Expression, ...args: SpreadableExpression[]): FunctionCallExpression => {

  const exp: FunctionCallExpression = {
    type: 'call',
    func,
  }

  if (args.length) {
    exp.args = args.length > 1 ? args : args[0]
  }

  return exp

}

export const $ternary = (condition: Expression, then: Expression, otherwise: Expression): TernaryExpression => ({
  type: 'ternary',
  condition,
  then,
  otherwise,
})

export const $oper = (
  oper: MultiTermOperator,
  ...exp: [Expression, Expression, ...Expression[]]
): OperationExpression => ({
  type: 'oper',
  oper,
  exp,
})

export const $trans = (oper: TransformOperator, exp: Expression): TransformExpression => ({
  type: 'trans',
  oper,
  exp,
})

export const $if = (
  condition: Expression,
  then: FunctionStep | FunctionStep[],
  otherwise?: FunctionStep | FunctionStep[],
): IfStatement => {

  const step: IfStatement = {
    type: 'if',
    condition,
    then,
  }

  if (otherwise) {
    step.otherwise = otherwise
  }

  return step

}

export const $return = (value: Expression): ReturnStatement => ({
  type: 'return',
  value,
})
