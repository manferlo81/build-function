import objectHash from 'object-hash';

let hash: ((object: object, ...others: any[]) => string) | undefined;

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (objectHash) {

  hash = (object: object, ...others: unknown[]): string => others.reduce<string>(
    // eslint-disable-next-line import-x/no-named-as-default-member
    (main, other) => `${main}${objectHash.MD5(other as never)}`,
    // eslint-disable-next-line import-x/no-named-as-default-member
    objectHash.sha1(object),
  );

}

export { hash };
