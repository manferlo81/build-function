import { compileExp, createEnv, GetExpression } from '../../src'
import { $get } from '../helpers/expressions'
import { rand } from '../helpers/number'

describe('get expression', () => {

  test('should throw on invalid get expression', () => {

    const base = { type: 'get' }
    const invalid = [
      base,
      { ...base, id: 10 },
    ]

    invalid.forEach((expression) => {

      expect(() => compileExp(expression as any, {})).toThrow()

    })

  })

  test('should compile get expression with string id', () => {

    const getId = 'value'
    const expression: GetExpression = $get(getId)
    const resolve = compileExp(expression, {})

    const value = rand(1, 100)
    const scope = createEnv(null, {
      [getId]: value,
    })

    const result = resolve(scope)
    expect(result).toBe(value)

  })

  test('should throw if not found', () => {

    const expression: GetExpression = $get('value')
    const resolve = compileExp(expression, {})

    const scope = createEnv(null)

    expect(() => resolve(scope)).toThrow()

  })

  test('should cache get expression', () => {

    const expression1: GetExpression = $get('value')
    const expression2: GetExpression = $get('value')

    const cache = {}
    const same = compileExp(expression1, cache) === compileExp(expression2, cache)

    expect(same).toBe(true)

  })

})
