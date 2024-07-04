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
import { getUnitOptionMap } from '../../../util/convert-units/getUnitOptionMap';

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

export const TASK_PRODUCT_FIELD_NAMES = {
  WEIGHT: 'weight',
  WEIGHT_UNIT: 'weight_unit',
  VOLUME: 'volume',
  VOLUME_UNIT: 'volume_unit',
  PERCENT_OF_LOCATION: 'percent_of_location',
  APPLICATION_AREA: 'location_area',
  APPLICATION_AREA_UNIT: 'location_area_unit',
  APPLICATION_RATE_WEIGHT: 'application_rate_weight',
  APPLICATION_RATE_WEIGHT_UNIT: 'application_rate_weight_unit',
  APPLICATION_RATE_VOLUME: 'application_rate_volume',
  APPLICATION_RATE_VOLUME_UNIT: 'application_rate_volume_unit',
} as const;

type UnitKeys = keyof ReturnType<typeof getUnitOptionMap>;
export interface UnitOption {
  value: UnitKeys;
  label: string;
}

export type TaskProductFormFields = {
  [TASK_PRODUCT_FIELD_NAMES.WEIGHT]?: number;
  [TASK_PRODUCT_FIELD_NAMES.WEIGHT_UNIT]?: UnitOption | null;
  [TASK_PRODUCT_FIELD_NAMES.VOLUME]?: number;
  [TASK_PRODUCT_FIELD_NAMES.VOLUME_UNIT]?: UnitOption | null;
  [TASK_PRODUCT_FIELD_NAMES.PERCENT_OF_LOCATION]?: number | null;
  [TASK_PRODUCT_FIELD_NAMES.APPLICATION_AREA]?: number | null;
  [TASK_PRODUCT_FIELD_NAMES.APPLICATION_AREA_UNIT]?: UnitOption | null;
  [TASK_PRODUCT_FIELD_NAMES.APPLICATION_RATE_WEIGHT]?: number | null;
  [TASK_PRODUCT_FIELD_NAMES.APPLICATION_RATE_WEIGHT_UNIT]?: UnitOption;
  [TASK_PRODUCT_FIELD_NAMES.APPLICATION_RATE_VOLUME]?: number | null;
  [TASK_PRODUCT_FIELD_NAMES.APPLICATION_RATE_VOLUME_UNIT]?: UnitOption;
};
