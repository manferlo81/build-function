import objectHash from "object-hash";
import { FunctionStep } from "./types";

let hash: ((object: FunctionStep) => string) | undefined;

if (objectHash) {
  hash = (object: FunctionStep): string => (
    objectHash.MD5(object.type) + objectHash.sha1(object)
  );
}

export { hash };
