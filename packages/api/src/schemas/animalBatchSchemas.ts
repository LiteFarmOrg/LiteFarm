import { Type, Static } from '@sinclair/typebox';
import { addAnimalsSharedSchema } from './animalSchemas.js';
import { nullable } from './utils.js';

export const addBatchAnimalsSchema = Type.Array(
  Type.Intersect([
    addAnimalsSharedSchema,
    Type.Object({
      count: Type.Number(),
      sex_detail: nullable(
        Type.Array(Type.Object({ count: Type.Integer(), sex_id: Type.Integer() })),
      ),
      animal_batch_use_relationships: nullable(
        Type.Array(
          Type.Object({
            use_id: Type.Integer(),
            animal_batch_id: Type.Integer(),
            other_use: nullable(Type.String()),
          }),
        ),
      ),
    }),
  ]),
);

export type AddBatchAnimalsReqBody = Static<typeof addBatchAnimalsSchema>;
