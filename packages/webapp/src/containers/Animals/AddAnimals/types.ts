/*
 *  Copyright 2024 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */
import { UseFormReturn } from 'react-hook-form';
import { TFunction } from 'react-i18next';
import { STEPS } from '../AddAnimals';
import type { Option as AnimalSelectOption } from '../../../components/Animals/AddAnimalsFormCard/AnimalSelect';
import type { Details as SexDetailsType } from '../../../components/Form/SexDetails/SexDetailsPopover';

export const BasicsFields = {
  TYPE: 'type',
  BREED: 'breed',
  SEX_DETAILS: 'sexDetails',
  COUNT: 'count',
  CREATE_INDIVIDUAL_PROFILES: 'createIndividualProfiles',
  GROUP_NAME: 'group_name',
  BATCH_NAME: 'batch_name',
  FIELD_ARRAY_ID: 'field_array_id', // for synching basics and details
} as const;

export type AnimalBasicsFormFields = {
  [BasicsFields.TYPE]: AnimalSelectOption | undefined;
  [BasicsFields.BREED]?: AnimalSelectOption | undefined;
  [BasicsFields.SEX_DETAILS]: SexDetailsType | undefined;
  [BasicsFields.COUNT]: number;
  [BasicsFields.CREATE_INDIVIDUAL_PROFILES]?: boolean;
  [BasicsFields.GROUP_NAME]?: string;
  [BasicsFields.BATCH_NAME]?: string;
  [BasicsFields.FIELD_ARRAY_ID]?: string;
};

export enum DetailsFields {
  ANIMAL_OR_BATCH = 'animal_or_batch', // remove before submitting
  BASICS_FIELD_ARRAY_ID = 'field_array_id', // remove before submitting

  // GENERAL
  BATCH_NAME = 'batch_name',
  TYPE = 'type',
  BREED = 'breed',
  SEX = 'sex_id',
  USE = 'use',
  OTHER_USE = 'other_use',
  COUNT = 'count',
  SEX_DETAILS = 'sex_details',

  // UNIQUE
  NAME = 'name', // animal name
  DATE_OF_BIRTH = 'birth_date',
  TAG_NUMBER = 'identifier',
  TAG_COLOR = 'identifier_color',
  TAG_TYPE = 'identifier_type',
  TAG_TYPE_INFO = 'identifier_type_other',

  // OTHER
  WEANING_DATE = 'weaning_date',
  ORGANIC_STATUS = 'organic_status',
  OTHER_DETAILS = 'notes',
  ANIMAL_IMAGE = 'photo_url',

  // ORIGIN
  ORIGIN = 'origin_id',
  DAM = 'dam',
  SIRE = 'sire',
  BROUGHT_IN_DATE = 'brought_in_date',
  SUPPLIER = 'supplier',
  PRICE = 'price',
}

export type ReactSelectOption<T extends string | number> = {
  label: string;
  value: T;
  key?: string;
};

export type Option = {
  [DetailsFields.TYPE]: AnimalSelectOption;
  [DetailsFields.BREED]?: AnimalSelectOption;
  [DetailsFields.USE]: ReactSelectOption<number>;
  [DetailsFields.TAG_COLOR]: ReactSelectOption<number>;
  [DetailsFields.TAG_TYPE]: ReactSelectOption<number>;
  [DetailsFields.ORGANIC_STATUS]: ReactSelectOption<'Non-Organic' | 'Transitional' | 'Organic'>;
  [DetailsFields.SEX]: ReactSelectOption<number>;
  [DetailsFields.ORIGIN]: ReactSelectOption<number>;
};

export type AnimalDetailsFormFields = {
  [DetailsFields.ANIMAL_OR_BATCH]?: string;
  [DetailsFields.BASICS_FIELD_ARRAY_ID]?: string;
  [DetailsFields.BATCH_NAME]?: string;
  [DetailsFields.COUNT]?: number;
  [DetailsFields.NAME]?: string;
  [DetailsFields.TYPE]: Option[DetailsFields.TYPE];
  [DetailsFields.BREED]?: Option[DetailsFields.BREED];
  [DetailsFields.SEX]?: number;
  [DetailsFields.SEX_DETAILS]?: SexDetailsType;
  [DetailsFields.USE]?: Option[DetailsFields.USE][];
  [DetailsFields.OTHER_USE]?: string;
  [DetailsFields.DATE_OF_BIRTH]?: string;
  [DetailsFields.TAG_NUMBER]?: string;
  [DetailsFields.TAG_COLOR]?: Option[DetailsFields.TAG_COLOR];
  [DetailsFields.TAG_TYPE]?: Option[DetailsFields.TAG_TYPE];
  [DetailsFields.TAG_TYPE_INFO]?: string;
  [DetailsFields.WEANING_DATE]?: string;
  [DetailsFields.ORGANIC_STATUS]?: Option[DetailsFields.ORGANIC_STATUS];
  [DetailsFields.OTHER_DETAILS]?: string;
  [DetailsFields.ANIMAL_IMAGE]?: any;
  [DetailsFields.ORIGIN]?: number;
  [DetailsFields.DAM]?: string;
  [DetailsFields.SIRE]?: string;
  [DetailsFields.BROUGHT_IN_DATE]?: string;
  [DetailsFields.SUPPLIER]?: string;
  [DetailsFields.PRICE]?: number;
};

// Used by Storybook
export interface FormMethods extends UseFormReturn<Partial<AnimalDetailsFormFields>> {}

export type CommonDetailsProps = {
  t: TFunction;
  namePrefix?: string;
};

// Used by AddAnimals Form
export type AddAnimalsFormFields = {
  [STEPS.BASICS]: AnimalBasicsFormFields[];
  [STEPS.DETAILS]: AnimalDetailsFormFields[];
};
