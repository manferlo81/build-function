import { error } from "./errors";
import { SingleOrMulti } from "./helper-types";
import { hasOwn } from "./helpers";
import { isArray } from "./type-check";
import { Expression } from "./types";

export function validateExpression<O extends Expression>(target: O, keys: SingleOrMulti<keyof O>): void {

  function single(key: keyof O) {
    if (!hasOwn.call(target, key)) {
      throw error(`"${key}" is required in a "${target.type}" expression`);
    }
  }

  if (!isArray(keys)) {
    return single(keys);
  }

  keys.forEach(single);

}
