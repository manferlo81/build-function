export function returning<V>(value: V): () => V;
export function returning(): () => undefined;
export function returning<V>(value?: V): () => V | undefined {
  return () => value
}

export const hasOwn = Object.prototype.hasOwnProperty
