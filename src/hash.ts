import objectHash from 'object-hash';

let hash: ((object: object, ...others: any[]) => string) | undefined;

if (objectHash) {

  hash = (object: object, ...others: any[]): string => others.reduce<string>(
    (main, other) => `${main}${objectHash.MD5(other)}`,
    objectHash.sha1(object),
  );

}

export { hash };
