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

export const FIELD_NAMES = {
  PRODUCT_ID: 'product_id',
  NAME: 'name',
  SUPPLIER: 'supplier',
  PERMITTED: 'on_permitted_substances_list',
  COMPOSITION: 'composition',
  UNIT: 'npk_unit',
  N: NPK.N,
  P: NPK.P,
  K: NPK.K,
} as const;

export type ProductId = number | string | undefined;

export type FormFields = {
  [FIELD_NAMES.SUPPLIER]?: string | null;
  [FIELD_NAMES.PERMITTED]?: 'YES' | 'NO' | 'NOT_SURE' | null;
  [FIELD_NAMES.COMPOSITION]?: {
    [FIELD_NAMES.UNIT]?: Unit;
    [FIELD_NAMES.N]?: number | null;
    [FIELD_NAMES.P]?: number | null;
    [FIELD_NAMES.K]?: number | null;
  };
};

export type Product = {
  [FIELD_NAMES.PRODUCT_ID]: number;
  [FIELD_NAMES.NAME]: string;
  [FIELD_NAMES.SUPPLIER]?: string | null;
  [FIELD_NAMES.PERMITTED]?: 'YES' | 'NO' | 'NOT_SURE' | null;
  [FIELD_NAMES.N]?: number | null;
  [FIELD_NAMES.P]?: number | null;
  [FIELD_NAMES.K]?: number | null;
  [FIELD_NAMES.UNIT]?: Unit | null;
  farm_id: string;
  type:
    | typeof TASK_TYPES.SOIL_AMENDMENT
    | typeof TASK_TYPES.CLEANING
    | typeof TASK_TYPES.PEST_CONTROL;
  product_translation_key: string | null;
};
