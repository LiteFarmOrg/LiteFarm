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
  id: number;
  identifier: string | null;
  identifier_color_id: number | null;
  identifier_placement_id: number | null;
  internal_identifier: number;
  name: string | null;
  notes: string | null;
  origin_id: number;
  photo_url: string | null;
  sex_id: number;
  sire: string | null;
  weaning_date: string | null;
}

export interface AnimalBatch {
  id: number;
  farm_id: string;
  internal_identifier: number;
  default_type_id: number | null;
  custom_type_id: number | null;
  default_breed_id: number | null;
  custom_breed_id: number | null;
  photo_url: string | null;
  name: string | null;
  notes: string | null;
  count: number;
  sex_detail: { sex_id: number; count: number }[];
}

export interface AnimalGroup {
  id: number;
  farm_id: string;
  name: string;
  notes: string | null;
  related_animal_ids: number[];
  related_batch_ids: number[];
}
