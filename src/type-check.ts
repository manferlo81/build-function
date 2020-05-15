export const { isArray } = Array;

export function isObj(param: unknown): param is (null | Record<keyof any, any>) {
  return typeof param === 'object';
}
