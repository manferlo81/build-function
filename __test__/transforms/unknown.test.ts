import { compileExp, OperationExpression } from '../../src'
import { $get, $trans } from '../helpers/expressions'

describe('unknown transform expression', () => {

  test('should throw if less than 2 operands', () => {

    const expression: OperationExpression = $trans(
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      '?',
      $get('a'),
    )

    expect(() => compileExp(expression, {})).toThrow()

  })

})
