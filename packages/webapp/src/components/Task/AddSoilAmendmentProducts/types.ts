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

import { NPK, UNIT, Unit } from '../../Form/CompositionInputs/NumberInputWithSelect';

export const FIELD_NAMES = {
  PRODUCT_ID: 'product_id',
  NAME: 'name',
  SUPPLIER: `supplier`,
  PERMITTED: `on_permitted_substances_list`,
  COMPOSITION: 'composition',
  UNIT,
  N: NPK.N,
  P: NPK.P,
  K: NPK.K,
} as const;

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
  [FIELD_NAMES.PRODUCT_ID]: number;
  [FIELD_NAMES.NAME]: string;
  product_translation_key: string | null;
  [FIELD_NAMES.SUPPLIER]?: string | null;
  type: 'soil_amendment_task' | 'cleaning_task' | 'pest_control';
  farm_id: string;
  [FIELD_NAMES.PERMITTED]?: 'YES' | null;
  [FIELD_NAMES.N]?: number | null;
  [FIELD_NAMES.P]?: number | null;
  [FIELD_NAMES.K]?: number | null;
  [FIELD_NAMES.UNIT]: Unit | null;
};
