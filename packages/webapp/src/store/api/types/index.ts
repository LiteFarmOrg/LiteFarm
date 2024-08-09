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

// If we don't necessarily want to type an endpoint
export type Result = Array<{ [key: string]: any }>;

export interface Animal {
  birth_date: string | null;
  brought_in_date: string | null;
  custom_breed_id: number | null;
  custom_type_id: number | null;
  dam: string | null;
  default_breed_id: number | null;
  default_type_id: number | null;
  farm_id: string;
  group_ids: number[];
  id: number;
  identifier: string | null;
  identifier_color_id: number | null;
  internal_identifier: number;
  name: string | null;
  notes: string | null;
  origin_id: number;
  photo_url: string | null;
  sex_id: number;
  sire: string | null;
  weaning_date: string | null;
  animal_removal_reason_id: number | null;
  removal_explanation: string | null;
  removal_date: string | null;
}

export interface AnimalBatch {
  count: number;
  custom_breed_id: number | null;
  custom_type_id: number | null;
  default_breed_id: number | null;
  default_type_id: number | null;
  farm_id: string;
  group_ids: number[];
  id: number;
  internal_identifier: number;
  name: string | null;
  notes: string | null;
  photo_url: string | null;
  sex_detail: { sex_id: number; count: number }[];
  animal_removal_reason_id: number | null;
  removal_explanation: string | null;
  removal_date: string | null;
}

export interface AnimalGroup {
  farm_id: string;
  id: number;
  name: string;
  notes: string | null;
  related_animal_ids: number[];
  related_batch_ids: number[];
}

export interface CustomAnimalBreed {
  id: number;
  farm_id: string;
  default_type_id?: number;
  custom_type_id?: number;
  breed: string;
}

export interface CustomAnimalType {
  id: number;
  farm_id: string;
  type: string;
  count?: number;
}

export interface DefaultAnimalBreed {
  id: number;
  default_type_id: number;
  key: string;
}

export interface DefaultAnimalType {
  id: number;
  key: string;
  count?: number;
}

export interface AnimalSex {
  id: number;
  key: string;
}

export type AnimalRemovalReasonKeys =
  | 'SOLD'
  | 'SLAUGHTERED_FOR_SALE'
  | 'SLAUGHTERED_FOR_CONSUMPTION'
  | 'NATURAL_DEATH'
  | 'CULLED'
  | 'OTHER';

export type AnimalRemovalReason = {
  key: AnimalRemovalReasonKeys;
  id: number;
};

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
  product_id: number | string;
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

export enum ElementalUnit {
  RATIO = 'ratio',
  PERCENT = 'percent',
  PPM = 'ppm',
  'MG/KG' = 'mg/kg',
}

export enum MolecularCompoundsUnit {
  PPM = 'ppm',
  'MG/KG' = 'mg/kg',
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
    elemental_unit?: ElementalUnit;
    ammonium?: number;
    nitrate?: number;
    molecular_compounds_unit?: MolecularCompoundsUnit;
    moisture_content_percent?: number;
  };
};
