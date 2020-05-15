import { compileExp, compileStep, DeclareWithValue, FunctionCallExpression, GetExpression, VariableDeclaration } from '../../src';
import { compileDecl, compileParam } from '../../src/compile/compile';
import { $call, $get, $literal } from '../helpers/expressions';

jest.mock('object-hash', () => {
  return null;
});

describe('compile without cache', () => {

  test('should compile expression without cache if no object-hash', () => {

    const exp1: GetExpression = $get('value');
    const exp2: GetExpression = $get('value');

    const cache = {};
    const same = compileExp(exp1, cache) === compileExp(exp2, cache);

    expect(same).toBe(false);

  });

  test('should compile single step without cache if no object-hash', () => {

    const step1: FunctionCallExpression = $call(
      $get('func'),
      $get('a'),
      $get('b'),
    );
    const step2: FunctionCallExpression = $call(
      $get('func'),
      $get('a'),
      $get('b'),
    );

    const cache = {};
    const same = compileStep(step1, cache) === compileStep(step2, cache);

    expect(same).toBe(false);

  });

  test('should compile multiple steps without cache if no object-hash', () => {

    const step1: FunctionCallExpression[] = [
      $call(
        $get('func1'),
        $get('a'),
        $get('b'),
      ),
      $call(
        $get('func2'),
        $get('a'),
        $get('b'),
      ),
    ];
    const step2: FunctionCallExpression[] = [
      $call(
        $get('func1'),
        $get('a'),
        $get('b'),
      ),
      $call(
        $get('func2'),
        $get('a'),
        $get('b'),
      ),
    ];

    const cache = {};
    const same = compileStep(step1, cache) === compileStep(step2, cache);

    expect(same).toBe(false);

  });

  test('should compile single function parameter without cache if no object-hash', () => {

    const cache = {};
    const same = compileParam('param', cache) === compileParam('param', cache);

    expect(same).toBe(false);

  });

  test('should compile multiple function parameters without cache if no object-hash', () => {

    const cache = {};
    const same = compileParam(['a', 'b'], cache) === compileParam(['a', 'b'], cache);

    expect(same).toBe(false);

  });

  test('should compile single variable declaration without cache if no object-hash', () => {

    const declare1: DeclareWithValue = { id: 'value', value: $literal(true) };
    const declare2: DeclareWithValue = { id: 'value', value: $literal(true) };

    const cache = {};
    const same = compileDecl(declare1, cache) === compileDecl(declare2, cache);

    expect(same).toBe(false);

  });

  test('should compile multiple variable declarations without cache if no object-hash', () => {

    const declare1: VariableDeclaration[] = ['a', 'b'];
    const declare2: VariableDeclaration[] = ['a', 'b'];

    const cache = {};
    const same = compileDecl(declare1, cache) === compileDecl(declare2, cache);

    expect(same).toBe(false);

  });

});
