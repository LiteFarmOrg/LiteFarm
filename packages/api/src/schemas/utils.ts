import { TSchema, Type } from '@sinclair/typebox';

// allow both null and optional type
export const nullable = <T extends TSchema>(type: T) =>
  Type.Optional(Type.Union([Type.Null(), type]));

export const StringEnum = <T extends string[]>(items: [...T]) =>
  Type.Unsafe<T[number]>({ type: 'string', enum: items });
