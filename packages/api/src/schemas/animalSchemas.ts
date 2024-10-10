import { Type, Static } from '@sinclair/typebox';
import { nullable, StringEnum } from './utils.js';

export const addAnimalsSharedSchema = Type.Object({
  default_breed_id: nullable(Type.Integer()),
  custom_breed_id: nullable(Type.Integer()),
  custom_type_id: nullable(Type.Integer()),
  default_type_id: nullable(Type.Integer()),
  type_name: nullable(Type.String()),
  sex_id: nullable(Type.Integer()),
  name: nullable(Type.String()),
  birth_date: nullable(Type.String({ format: 'date-time' })),
  identifier: nullable(Type.String()),
  identifier_color_id: nullable(Type.Integer()),
  origin_id: nullable(Type.Integer()),
  dam: nullable(Type.String()),
  sire: nullable(Type.String()),
  brought_in_date: nullable(Type.String({ format: 'date-time' })),
  weaning_date: nullable(Type.String({ format: 'date-time' })),
  notes: nullable(Type.String()),
  photo_url: nullable(Type.String()),
  animal_removal_reason_id: nullable(Type.Integer()),
  removal_explanation: nullable(Type.String()),
  removal_date: nullable(Type.String({ format: 'date-time' })),
  identifier_type_id: nullable(Type.Integer()),
  identifier_type_other: nullable(Type.String()),
  organic_status: nullable(StringEnum(['Non-Organic', 'Transitional', 'Organic'])),
  supplier: nullable(Type.String({ maxLength: 255 })),
  price: nullable(Type.Number()),
  breed_name: nullable(Type.String()),
  group_name: nullable(Type.String()),
});

export const addAnimalsSchema = Type.Array(
  Type.Intersect([
    addAnimalsSharedSchema,
    Type.Object({
      animal_use_relationships: nullable(
        Type.Array(
          Type.Object({
            id: Type.Integer(),
            key: Type.String(),
          }),
        ),
      ),
    }),
  ]),
);

export type AddAnimalsReqBody = Static<typeof addAnimalsSchema>;
