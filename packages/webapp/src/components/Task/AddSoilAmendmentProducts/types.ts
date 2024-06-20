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

import { TASK_TYPES } from '../../../containers/Task/constants';

export enum Unit {
  RATIO = 'ratio',
  PERCENT = 'percent',
}

export enum NPK {
  N = 'n',
  P = 'p',
  K = 'k',
}

export const TASK_PRODUCT_FIELD_NAMES = {
  PRODUCT_ID: 'product_id',
  PURPOSES: 'purposes',
  OTHER_PURPOSE: 'other_purpose',
} as const;

export const PRODUCT_FIELD_NAMES = {
  PRODUCT_ID: 'product_id',
  PURPOSES: 'purposes',
  OTHER_PURPOSE: 'other_purpose',
  NAME: 'name',
  SUPPLIER: 'supplier',
  PERMITTED: 'on_permitted_substances_list',
  FERTILISER_TYPE: 'fertiliser_type',
  MOISTURE_CONTENT: 'moisture_content',
  DRY_MATTER_CONTENT: 'dry_matter_content',
  COMPOSITION: 'composition',
  UNIT: 'npk_unit',
  N: NPK.N,
  P: NPK.P,
  K: NPK.K,
} as const;

export type ProductId = number | string | undefined;

export type ProductFormFields = {
  [PRODUCT_FIELD_NAMES.SUPPLIER]?: string | null;
  [PRODUCT_FIELD_NAMES.PERMITTED]?: 'YES' | 'NO' | 'NOT_SURE' | null;
  [PRODUCT_FIELD_NAMES.PURPOSES]?: number[];
  [PRODUCT_FIELD_NAMES.OTHER_PURPOSE]?: string;
  [PRODUCT_FIELD_NAMES.FERTILISER_TYPE]?: number;
  [PRODUCT_FIELD_NAMES.MOISTURE_CONTENT]?: number;
  [PRODUCT_FIELD_NAMES.DRY_MATTER_CONTENT]?: number;
  [PRODUCT_FIELD_NAMES.COMPOSITION]?: {
    [PRODUCT_FIELD_NAMES.UNIT]?: Unit;
    [PRODUCT_FIELD_NAMES.N]?: number | null;
    [PRODUCT_FIELD_NAMES.P]?: number | null;
    [PRODUCT_FIELD_NAMES.K]?: number | null;
  };
};

export type Product = {
  [PRODUCT_FIELD_NAMES.PRODUCT_ID]: number;
  [PRODUCT_FIELD_NAMES.NAME]: string;
  [PRODUCT_FIELD_NAMES.SUPPLIER]?: string | null;
  [PRODUCT_FIELD_NAMES.PERMITTED]?: 'YES' | 'NO' | 'NOT_SURE' | null;
  [PRODUCT_FIELD_NAMES.FERTILISER_TYPE]?: number;
  [PRODUCT_FIELD_NAMES.MOISTURE_CONTENT]?: number;
  [PRODUCT_FIELD_NAMES.N]?: number | null;
  [PRODUCT_FIELD_NAMES.P]?: number | null;
  [PRODUCT_FIELD_NAMES.K]?: number | null;
  [PRODUCT_FIELD_NAMES.UNIT]?: Unit | null;
  farm_id: string;
  type:
    | typeof TASK_TYPES.SOIL_AMENDMENT
    | typeof TASK_TYPES.CLEANING
    | typeof TASK_TYPES.PEST_CONTROL;
  product_translation_key: string | null;
};
