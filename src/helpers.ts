export function functionReturning<V>(value: V): () => V;
export function functionReturning(): () => undefined;
export function functionReturning<V>(value?: V): () => V | undefined {
  return () => value;
}
