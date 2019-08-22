export const isArray = Array.isArray;

export function isObj(param: unknown): param is Record<keyof any, any> {
  return typeof param === "object";
}
