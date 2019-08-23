export function error(msg: string) {
  return new Error(msg);
}

export function errorInvalid(type: string, what: string) {
  return error(`"${type}" is not a valid ${what} type`);
}

export function errorNotInScope(id: string) {
  return error(`"${id}" can't be found in this scope`);
}
