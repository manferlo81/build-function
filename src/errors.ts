export function error(msg: string): Error {
  return new Error(msg);
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function errorFmt<F extends (...params: any[]) => Error>(template: string): F;
export function errorFmt(template: string): (...params: any[]) => Error {
  return function () {
    // eslint-disable-next-line prefer-rest-params
    const args = arguments;
    return error(
      template.replace(
        /\$(\d+)/g,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        (_, index) => args[+index],
      ),
    );
  };
}

const msgInvalid = '"$0" is not a valid $1';

export const errorInvalid = errorFmt<(obj: any, what: string) => Error>(
  msgInvalid,
);

export const errorInvalidType = errorFmt<(obj: any, what: string) => Error>(
  `${msgInvalid} type`,
);

export const errorNotInEnv = errorFmt<(id: string) => Error>(
  '"$0" can\'t be found in this environment',
);

const msgRequired = '"$0" is required in a "$1"';

export const errorExpReq = errorFmt<(key: string, type: string) => Error>(
  `${msgRequired} expression`,
);

export const errorStmnReq = errorFmt<(key: string, type: string) => Error>(
  `${msgRequired} statement`,
);
