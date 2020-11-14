export const { isArray } = Array;

export function isObjOrNull(param: unknown): param is (null | Record<keyof any, any>) {
  return param === null || typeof param === 'object';
}
