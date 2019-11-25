import { compileStep, createEnv, TryStatement } from '../../src'
import { $call, $get } from '../helpers/expressions'

describe('try statement step', () => {

  // test("should throw on invalid try statement step", () => {

  // });

  test('should compile with empty options', () => {

    const step: TryStatement = {
      type: 'try',
    }

    expect(() => compileStep(step, {})).not.toThrow()

  })

  test('should compile with single step', () => {

    const step: TryStatement = {
      type: 'try',
      body: $call(
        $get('body'),
      ),
      catch: $call(
        $get('catch'),
      ),
    }

    const resolve = compileStep(step, {})

    const body = jest.fn()
    const catchError = jest.fn()

    const env = createEnv(null, {
      body,
      catch: catchError,
    })

    resolve(env)

    expect(body).toHaveBeenCalledTimes(1)
    expect(catchError).not.toHaveBeenCalled()

  })

  test('should compile with multiple steps', () => {

    const step: TryStatement = {
      type: 'try',
      body: [
        $call(
          $get('body'),
        ),
      ],
      catch: [
        $call(
          $get('catch'),
        ),
      ],
    }

    const resolve = compileStep(step, {})

    const body = jest.fn()
    const catchError = jest.fn()

    const env = createEnv(null, {
      body,
      catch: catchError,
    })

    resolve(env)

    expect(body).toHaveBeenCalledTimes(1)
    expect(catchError).not.toHaveBeenCalled()

  })

  test('should catch on throw statement', () => {

    const errorMessage = 'body error'

    const step: TryStatement = {
      type: 'try',
      body: {
        type: 'throw',
        msg: errorMessage,
      },
      error: 'err',
      catch: [
        $call(
          $get('catch'),
          $get('err'),
        ),
      ],
    }

    const resolve = compileStep(step, {})

    const catchError = jest.fn()

    const env = createEnv(null, {
      catch: catchError,
    })

    resolve(env)

    expect(catchError).toHaveBeenCalledTimes(1)
    expect(catchError).toHaveBeenCalledWith(errorMessage)

  })

  test('should catch on actual error', () => {

    const step: TryStatement = {
      type: 'try',
      body: $call(
        $get('body'),
      ),
      error: 'err',
      catch: $call(
        $get('catch'),
        $get('err'),
      ),
    }

    const resolve = compileStep(step, {})

    const errorMessage = 'body error'

    const body = () => {
      throw new Error(errorMessage)
    }
    const catchError = jest.fn()

    const env = createEnv(null, {
      body,
      catch: catchError,
    })

    resolve(env)

    expect(catchError).toHaveBeenCalledTimes(1)
    expect(catchError).toHaveBeenCalledWith(errorMessage)

  })

  test('should catch on string error', () => {

    const step: TryStatement = {
      type: 'try',
      body: $call(
        $get('body'),
      ),
      error: 'err',
      catch: $call(
        $get('catch'),
        $get('err'),
      ),
    }

    const resolve = compileStep(step, {})

    const errorMessage = 'body error'

    const body = () => {
      throw errorMessage
    }
    const catchError = jest.fn()

    const env = createEnv(null, {
      body,
      catch: catchError,
    })

    resolve(env)

    expect(catchError).toHaveBeenCalledTimes(1)
    expect(catchError).toHaveBeenCalledWith(errorMessage)

  })

  test('should catch without error id', () => {

    const step: TryStatement = {
      type: 'try',
      body: $call(
        $get('body'),
      ),
      catch: $call(
        $get('catch'),
      ),
    }

    const resolve = compileStep(step, {})

    const errorMessage = 'body error'

    const body = () => {
      throw new Error(errorMessage)
    }
    const catchError = jest.fn()

    const env = createEnv(null, {
      body,
      catch: catchError,
    })

    expect(() => resolve(env)).not.toThrow()

  })

  test('should ignore error', () => {

    const step: TryStatement = {
      type: 'try',
      body: $call(
        $get('body'),
      ),
    }

    const resolve = compileStep(step, {})

    const errorMessage = 'body error'

    const body = () => {
      throw new Error(errorMessage)
    }

    const env = createEnv(null, {
      body,
    })

    expect(() => resolve(env)).not.toThrow()

  })

  test('should cache throw statement step', () => {

    const step1: TryStatement = {
      type: 'try',
      body: {
        type: 'call',
        func: {
          type: 'get',
          id: 'func',
        },
      },
      error: 'err',
      catch: {
        type: 'call',
        func: {
          type: 'get',
          id: 'log',
        },
        args: {
          type: 'get',
          id: 'err',
        },
      },
    }
    const step2: TryStatement = {
      type: 'try',
      body: {
        type: 'call',
        func: {
          type: 'get',
          id: 'func',
        },
      },
      error: 'err',
      catch: {
        type: 'call',
        func: {
          type: 'get',
          id: 'log',
        },
        args: {
          type: 'get',
          id: 'err',
        },
      },
    }

    const cache = {}
    const same = compileStep(step1, cache) === compileStep(step2, cache)

    expect(same).toBe(true)

  })

})
