export function returning<V>(value: V): () => V;
export function returning(): () => undefined;
export function returning<V>(value?: V): () => V | undefined {
  return () => value
}

// eslint-disable-next-line @typescript-eslint/unbound-method
export const hasOwn = Object.prototype.hasOwnProperty
