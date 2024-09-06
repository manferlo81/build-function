import { ParameterType } from '../types';

export const paramTable: Record<
  ParameterType,
  (index: number) => (input: any[]) => any
> = {

  rest: (index) => {

    return (input) => {

      const arg: any[] = [];
      const len = input.length;

      for (let i = index; i < len; i++) {
        arg.push(
          input[i],
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return arg;

    };

  },

  param: (index) => (input: any[]): any => input[index],

};
