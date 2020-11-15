export const { isArray } = Array;

export function isObjOrNull(param: unknown): param is (null | Record<string | number, any> | unknown[]) {
  return typeof param === 'object';
}
