import { compileExp, compileStep, createEnv, OperationExpression } from '../../src';
import { $get, $literal, $oper, $set } from '../helpers/expressions';

describe('operation expression step', () => {

  test('should compile and operation expression step', () => {

    const step: OperationExpression = $oper(
      '&&',
      $literal(1),
      $set(
        'value',
        $literal(100),
      ),
    );
    const resolve = compileStep(step, {});

    const getValue = compileExp(
      $get('value'),
      {},
    );

    const scope = createEnv(null, {
      value: 0,
    });

    expect(getValue(scope)).toBe(0);

    const result = resolve(scope);

    expect(result).toBeUndefined();
    expect(getValue(scope)).toBe(100);

  });

  test('should compile or operation expression step', () => {

    const step: OperationExpression = $oper(
      '||',
      $literal(0),
      $set(
        'value',
        $literal(100),
      ),
    );
    const resolve = compileStep(step, {});

    const getValue = compileExp(
      $get('value'),
      {},
    );

    const scope = createEnv(null, {
      value: 0,
    });

    expect(getValue(scope)).toBe(0);

    const result = resolve(scope);

    expect(result).toBeUndefined();
    expect(getValue(scope)).toBe(100);

  });

});
