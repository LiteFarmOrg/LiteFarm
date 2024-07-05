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

export interface SoilAmendmentMethod {
  id: number;
  key: string;
}

export interface SoilAmendmentPurpose {
  id: number;
  key: string;
}

export interface SoilAmendmentFertiliserType {
  id: number;
  key: string;
}

interface Product {
  product_id?: number | string;
  name: string;
  product_translation_key?: string;
  supplier?: string;
  type?:
    | typeof TASK_TYPES.SOIL_AMENDMENT
    | typeof TASK_TYPES.CLEANING
    | typeof TASK_TYPES.PEST_CONTROL;
  farm_id?: string;
  on_permitted_substances_list?: 'YES' | 'NO' | 'NOT_SURE' | null;
}

export type SoilAmendmentProduct = Product & {
  soil_amendment_product: {
    product_id?: number;
    soil_amendment_fertiliser_type_id?: number;
    n?: number;
    p?: number;
    k?: number;
    calcium?: number;
    magnesium?: number;
    sulfur?: number;
    copper?: number;
    manganese?: number;
    boron?: number;
    elemental_unit?: 'percent' | 'ratio' | 'ppm' | 'mg/kg';
    ammonium?: number;
    nitrate?: number;
    molecular_compounds_unit?: 'ppm' | 'mg/kg';
    moisture_content_percent?: number;
  };
};
