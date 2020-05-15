export type SingleOrMulti<T> = T | T[];
export type AnyFunction = (...args: any[]) => any;

export interface Typed<T extends string> {
  type: T;
}
