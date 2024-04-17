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

export type ReactSelectOption<T extends string | number> = {
  label: string;
  value: T;
};

export enum DetailsFields {
  // GENERAL
  NAME = 'name',
  TYPE = 'type',
  BREED = 'breed',
  SEX = 'sex',
  USED_FOR_PRODUCTION = 'used_for_production',
  USE = 'use',

  // UNIQUE
  DATE_OF_BIRTH = 'birth_date',
  TAG_NUMBER = 'identifier',
  TAG_TYPE = 'identifier_type',
  TAG_COLOR = 'identifier_color_id',
  TAG_PLACEMENT = 'identifier_placement_id',
  TAG_PLACEMENT_INFO = 'identifier_placement_info',

  // OTHER
  WEANING_DATE = 'weaning_date',
  ORGANIC_STATUS = 'organic_status',
  OTHER_DETAILS = 'notes',
  ANIMAL_IMAGE = 'image_file',

  // ORIGIN
  ORIGIN = 'origin_id',
  DAM = 'dam',
  SIRE = 'sire',
  BROUGHT_IN_DATE = 'brought_in_date',
  MERCHANT = 'merchant',
  PRICE = 'price',
}

export type FormValues = {
  [DetailsFields.NAME]: string;
  [DetailsFields.TYPE]: ReactSelectOption<string>; // TODO: confirm
  [DetailsFields.BREED]: ReactSelectOption<string>; // TODO: confirm
  [DetailsFields.SEX]: number;
  [DetailsFields.USED_FOR_PRODUCTION]: boolean;
  [DetailsFields.USE]: ReactSelectOption<number | string>[]; // TODO: confirm
  [DetailsFields.DATE_OF_BIRTH]: string;
  [DetailsFields.TAG_NUMBER]: string;
  [DetailsFields.TAG_TYPE]: ReactSelectOption<number>; // TODO: confirm
  [DetailsFields.TAG_COLOR]: ReactSelectOption<number>; // TODO: confirm
  [DetailsFields.TAG_PLACEMENT]: ReactSelectOption<number | string>;
  [DetailsFields.TAG_PLACEMENT_INFO]: string;
  [DetailsFields.WEANING_DATE]: string;
  [DetailsFields.ORGANIC_STATUS]: ReactSelectOption<string>;
  [DetailsFields.OTHER_DETAILS]: string;
  [DetailsFields.ANIMAL_IMAGE]: any;
  [DetailsFields.ORIGIN]: number;
  [DetailsFields.DAM]: string;
  [DetailsFields.SIRE]: string;
  [DetailsFields.BROUGHT_IN_DATE]: string;
  [DetailsFields.MERCHANT]: string;
  [DetailsFields.PRICE]: number;
};

export interface FormMethods extends UseFormReturn<FormValues> {}

export type CommonDetailsProps = {
  t: TFunction;
  formMethods: FormMethods;
};
