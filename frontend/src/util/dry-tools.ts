export const mkEnumObject = <T extends readonly [string, ...string[]]>(...names: T): Readonly<{ [K in T[number]]: K }> =>
  Object.freeze(names.reduce((carry, item) => ({ ...carry, [item]: item }), {} as { [K in T[number]]: K }));
