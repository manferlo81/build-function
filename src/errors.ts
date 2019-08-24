export function error(msg: string) {
  return new Error(msg);
}

export function errorInvalid(obj: any, what: string) {
  return error(`"${obj}" is not a valid ${what}`);
}

export function errorInvalidType(type: string, what: string) {
  return errorInvalid(type, `${what} type`);
}

export function errorNotInScope(id: string) {
  return error(`"${id}" can't be found in this scope`);
}
