export function error(msg: string) {
  return new Error(msg)
}

export function errorFmt<F extends (...params: any[]) => Error>(template: string): F;
export function errorFmt<F>(template: string): any {
  return (...params: any[]) => error(
    template.replace(
      /\$(\d+)/g,
      (_, index) => params[index],
    ),
  )
}

const msgInvalid = '"$0" is not a valid $1'

export const errorInvalid = errorFmt<(obj: any, what: string) => Error>(
  msgInvalid,
)

export const errorInvalidType = errorFmt<(obj: any, what: string) => Error>(
  `${msgInvalid} type`,
)

export const errorNotInEnv = errorFmt<(id: string) => Error>(
  '"$0" can\'t be found in this environment',
)

const msgRequired = '"$0" is required in a "$1"'

export const errorExpReq = errorFmt<(key: string, type: string) => Error>(
  `${msgRequired} expression`,
)

export const errorStmnReq = errorFmt<(key: string, type: string) => Error>(
  `${msgRequired} statement`,
)
