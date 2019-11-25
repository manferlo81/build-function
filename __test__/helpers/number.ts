export const rand = (min: number, max: number, asInteger?: boolean) => {
  const diff = max - min
  const random = Math.random()
  return (asInteger ? Math.floor(random * (diff + 1)) : (random * diff)) + min
}
