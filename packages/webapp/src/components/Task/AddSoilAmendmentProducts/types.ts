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

import { ElementalUnit, MolecularCompoundsUnit } from '../../../store/api/types';
import { getUnitOptionMap } from '../../../util/convert-units/getUnitOptionMap';

export enum Nutrients {
  N = 'n',
  P = 'p',
  K = 'k',
  CA = 'calcium',
  MG = 'magnesium',
  S = 'sulfur',
  CU = 'copper',
  MN = 'manganese',
  B = 'boron',
}

export enum MolecularCompound {
  AMMONIUM = 'ammonium',
  NITRATE = 'nitrate',
}

export const TASK_FIELD_NAMES = {
  METHOD_ID: 'method_id',
  OTHER_APPLICATION_METHOD: 'other_application_method',
  FURROW_HOLE_DEPTH: 'furrow_hole_depth',
  FURROW_HOLE_DEPTH_UNIT: 'furrow_hole_depth_unit',
} as const;

export const TASK_PRODUCT_FIELD_NAMES = {
  PRODUCT_ID: 'product_id',
  PURPOSES: 'purposes',
  OTHER_PURPOSE: 'other_purpose',
  WEIGHT: 'weight',
  WEIGHT_UNIT: 'weight_unit',
  VOLUME: 'volume',
  VOLUME_UNIT: 'volume_unit',
  PERCENT_OF_LOCATION_AMENDED: 'percent_of_location_amended',
  TOTAL_AREA_AMENDED: 'total_area_amended',
  TOTAL_AREA_AMENDED_UNIT: 'total_area_amended_unit',
  APPLICATION_RATE_WEIGHT: 'application_rate_weight',
  APPLICATION_RATE_WEIGHT_UNIT: 'application_rate_weight_unit',
  APPLICATION_RATE_VOLUME: 'application_rate_volume',
  APPLICATION_RATE_VOLUME_UNIT: 'application_rate_volume_unit',
} as const;

export const PRODUCT_FIELD_NAMES = {
  PRODUCT_ID: 'product_id',
  PURPOSES: 'purposes',
  OTHER_PURPOSE: 'other_purpose',
  NAME: 'name',
  SUPPLIER: 'supplier',
  PERMITTED: 'on_permitted_substances_list',
  FERTILISER_TYPE_ID: 'soil_amendment_fertiliser_type_id',
  MOISTURE_CONTENT: 'moisture_content_percent',
  DRY_MATTER_CONTENT: 'dry_matter_content',
  COMPOSITION: 'composition',
  ELEMENTAL_UNIT: 'elemental_unit',
  N: Nutrients.N,
  P: Nutrients.P,
  K: Nutrients.K,
  CA: Nutrients.CA,
  MG: Nutrients.MG,
  S: Nutrients.S,
  CU: Nutrients.CU,
  MN: Nutrients.MN,
  B: Nutrients.B,
  AMMONIUM: MolecularCompound.AMMONIUM,
  NITRATE: MolecularCompound.NITRATE,
  MOLECULAR_COMPOUNDS_UNIT: 'molecular_compounds_unit',
} as const;

export type ProductId = number | string | undefined;

export type ProductFormFields = {
  [PRODUCT_FIELD_NAMES.SUPPLIER]?: string;
  [PRODUCT_FIELD_NAMES.PERMITTED]?: 'YES' | 'NO' | 'NOT_SURE' | null;
  [PRODUCT_FIELD_NAMES.PURPOSES]?: number[];
  [PRODUCT_FIELD_NAMES.OTHER_PURPOSE]?: string;
  [PRODUCT_FIELD_NAMES.FERTILISER_TYPE_ID]?: number;
  [PRODUCT_FIELD_NAMES.MOISTURE_CONTENT]?: number;
  [PRODUCT_FIELD_NAMES.DRY_MATTER_CONTENT]?: number;
  [PRODUCT_FIELD_NAMES.COMPOSITION]?: {
    [PRODUCT_FIELD_NAMES.ELEMENTAL_UNIT]?: ElementalUnit;
    [PRODUCT_FIELD_NAMES.N]?: number;
    [PRODUCT_FIELD_NAMES.P]?: number;
    [PRODUCT_FIELD_NAMES.K]?: number;
    [PRODUCT_FIELD_NAMES.CA]?: number;
    [PRODUCT_FIELD_NAMES.MG]?: number;
    [PRODUCT_FIELD_NAMES.S]?: number;
    [PRODUCT_FIELD_NAMES.CU]?: number;
    [PRODUCT_FIELD_NAMES.MN]?: number;
    [PRODUCT_FIELD_NAMES.B]?: number;
  };
  [PRODUCT_FIELD_NAMES.AMMONIUM]?: number;
  [PRODUCT_FIELD_NAMES.NITRATE]?: number;
  [PRODUCT_FIELD_NAMES.MOLECULAR_COMPOUNDS_UNIT]?: MolecularCompoundsUnit;
};

type UnitKeys = keyof ReturnType<typeof getUnitOptionMap>;
export interface UnitOption {
  value: UnitKeys;
  label: string;
}
