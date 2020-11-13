import { FunctionParameterDescriptor } from '../../src';
import { compileParam } from '../../src/compile/compile';

describe('compile function parameters with cache', () => {

  test('should cache single parameter', () => {

    const param1: FunctionParameterDescriptor = { id: 'param', type: 'param' };
    const param2: FunctionParameterDescriptor = { id: 'param', type: 'param' };

    const cache = {};
    const same = compileParam(param1, cache) === compileParam(param2, cache);

    expect(same).toBe(true);

  });

  test('should cache single parameter from 1 item array', () => {

    const param1: FunctionParameterDescriptor = { id: 'param', type: 'param' };
    const param2: [FunctionParameterDescriptor] = [{ id: 'param', type: 'param' }];

    const cache = {};
    const same = compileParam(param1, cache) === compileParam(param2, cache);

    expect(same).toBe(true);

  });

  test('should cache multiple parameters', () => {

    const param1: FunctionParameterDescriptor[] = [
      { id: 'a', type: 'param' },
      { id: 'b', type: 'param' },
    ];
    const param2: FunctionParameterDescriptor[] = [
      { id: 'a', type: 'param' },
      { id: 'b', type: 'param' },
    ];

    const cache = {};
    const same = compileParam(param1, cache) === compileParam(param2, cache);

    expect(same).toBe(true);

  });

});
