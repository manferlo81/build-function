import { compileExp, TransformExpression } from '../../src'
import { $literal, $trans } from '../helpers/expressions'
import { rand } from '../helpers/number'

describe('not transform expression', () => {

  test('should compile not transform expression', () => {

    const value = rand(0, 1, true)

    const expression: TransformExpression = $trans(
      '!',
      $literal(value),
    )
    const resolve = compileExp(expression, {})

    expect(resolve(null as any)).toBe(!value)

  })

})
