export function error(msg: string) {
  return new Error(msg);
}

export function errorInvalid(type: string, what: string) {
  return error(`"${type}" is not a valid ${what} type`);
}
