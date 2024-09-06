export const rand = (min: number, max: number, asInteger?: boolean): number => {
  const diff = max - min;
  const random = Math.random();
  const result = asInteger ? Math.floor(random * (diff + 1)) : random * diff;
  return result + min;
};
