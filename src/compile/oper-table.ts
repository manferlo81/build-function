import type { EnvBasedResolver, RegularBinaryOperator, RegularUnaryOperator, SpecialBinaryOperator } from '../types';

export const transTable: Record<RegularUnaryOperator, (value: any) => any> = {
  '!': (value) => !value,
  '!!': (value) => !!value,
  '~': (value) => ~value,
};

export const specialOperTable: Record<
  SpecialBinaryOperator,
  (resolvers: EnvBasedResolver[]) => EnvBasedResolver
> = {

  '||': (resolvers) => {

    const len = resolvers.length;

    return (env) => {

      let result;

      for (let i = 0; i < len; i++) {

        result = resolvers[i](env);

        if (result) {
          break;
        }

      }

      return result;

    };

  },

  '&&': (resolvers) => {

    const len = resolvers.length;

    return (env) => {

      let result;

      for (let i = 0; i < len; i++) {

        result = resolvers[i](env);

        if (!result) {
          break;
        }

      }

      return result;

    };

  },

  '??': (resolvers) => {

    const len = resolvers.length;

    return (env) => {

      let result;

      for (let i = 0; i < len; i++) {

        result = resolvers[i](env);

        if (result != null) {
          break;
        }

      }

      return result;

    };

  },

  '**': (resolvers) => {

    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    const resolveLast = resolvers.pop() as EnvBasedResolver;

    return (env) => {

      let result = resolveLast(env) as number;
      let i = resolvers.length - 1;

      while (i >= 0) {
        result = resolvers[i](env) as number ** result;
        i--;
      }

      return result;

    };

  },

};

export const operTable: Record<
  RegularBinaryOperator,
  (total: any, value: any) => any
> = {
  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands, @typescript-eslint/no-unsafe-return
  '+': (total, value) => total + value,
  '-': (total, value) => total - value,
  '*': (total, value) => total * value,
  '/': (total, value) => total / value,
  '%': (total, value) => total % value,
  '&': (total, value) => total & value,
  '|': (total, value) => total | value,
  '^': (total, value) => total ^ value,
  '<<': (total, value) => total << value,
  '>>': (total, value) => total >> value,
  '>>>': (total, value) => total >>> value,
  '==': (total, value) => total == value,
  '===': (total, value) => total === value,
  '!=': (total, value) => total != value,
  '!==': (total, value) => total !== value,
  '>': (total, value) => total > value,
  '<': (total, value) => total < value,
  '>=': (total, value) => total >= value,
  '<=': (total, value) => total <= value,
};
