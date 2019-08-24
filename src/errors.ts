export function error(msg: string) {
  return new Error(msg);
}

export function errorFmt<F extends (...params: any[]) => Error>(template: string): F;
export function errorFmt<F>(template: string): any {
  return (...params: any[]) => new Error(
    template.replace(
      /\$(\d+)/g,
      (_, index) => params[index],
    ),
  );
}

export function errorInvalid(obj: any, what: string) {
  return error(`"${obj}" is not a valid ${what}`);
}

export function errorInvalidType(type: string, what: string) {
  return errorInvalid(type, `${what} type`);
}

export const errorNotInScope = errorFmt<(id: string) => Error>(
  "\"$0\" can't be found in this scope",
);

export const errorRequired = errorFmt<(key: string, type: string) => Error>(
  '"$0" is required in a "$1" expression',
);

export const errorRequired2 = errorFmt<(key: string, type: string) => Error>(
  '"$0" is required in a "$1" statement',
);
