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

export const FIELD_NAMES = {
  PRODUCT_ID: 'product_id',
  NAME: 'name',
  SUPPLIER: `supplier`,
  PERMITTED: `on_permitted_substances_list`,
  UNIT: 'unit',
  COMPOSITION: 'composition',
  N: 'n',
  P: 'p',
  K: 'k',
} as const;

export enum Unit {
  PERCENT = 'percent',
  RATIO = 'ratio',
}

export type FormFields = {
  [FIELD_NAMES.PRODUCT_ID]?: number | string;
  [FIELD_NAMES.NAME]?: string;
  [FIELD_NAMES.SUPPLIER]?: string | null;
  [FIELD_NAMES.PERMITTED]?: string | null;
  [FIELD_NAMES.COMPOSITION]?: {
    [FIELD_NAMES.UNIT]: Unit;
    [FIELD_NAMES.N]?: number | null;
    [FIELD_NAMES.P]?: number | null;
    [FIELD_NAMES.K]?: number | null;
  };
};

export type Product = {
  product_id: number;
  name: string;
  product_translation_key: string | null;
  supplier?: string | null;
  type: 'soil_amendment_task' | 'cleaning_task' | 'pest_control';
  farm_id: string;
  on_permitted_substances_list: 'YES' | null;
  n: number | null;
  p: number | null;
  k: number | null;
  npk_unit: Unit | null;
};
