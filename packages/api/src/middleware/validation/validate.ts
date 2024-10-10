import { Ajv } from 'ajv';
import { DefinedError } from 'ajv/dist/core.js';
import addFormats from 'ajv-formats';
import { TSchema, Static } from '@sinclair/typebox';
import { randomUUID } from 'crypto';
import { TypedRequestHandler } from '../../types.js';

export const ajv = new Ajv({ allErrors: true });
//@ts-expect-error
addFormats(ajv);

export const validateBody = <T extends TSchema>(schema: T): TypedRequestHandler<Static<T>> => (
  req,
  res,
  next,
) => {
  if (!schema.$id) {
    schema.$id = randomUUID();
  }

  const validate = ajv.getSchema(schema.$id) || ajv.compile(schema);

  if (!validate(req.body)) {
    return res.status(400).send(
      (validate.errors as DefinedError[]).map(({ instancePath, keyword, message }) => ({
        instancePath,
        keyword,
        message,
      })),
    );
  }

  next();
};
