/*
 *  Copyright 2025 LiteFarm.org
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

import {
  AddonPartner,
  Location,
  Point,
  Task,
  ManagementPlan as ModelManagementPlan,
} from '../models/types.js';

enum PlantingMethod {
  BED_METHOD = 'bed_method',
  CONTAINER_METHOD = 'container_method',
  BROADCAST_METHOD = 'broadcast_method',
  ROW_METHOD = 'row_method',
}

type MethodDetails = {
  planting_management_plan_id?: string;
};

interface PlantingManagementPlan {
  planting_method: PlantingMethod;
  bed_method: MethodDetails | null;
  container_method: MethodDetails | null;
  broadcast_method: MethodDetails | null;
  row_method: MethodDetails | null;
}

export interface ManagementPlan {
  management_plan_id: string;
  crop_management_plan: {
    seed_date: string;
    planting_management_plans: PlantingManagementPlan[];
  };
  crop_variety: {
    crop: {
      crop_common_name: string;
      crop_genus: string;
      crop_specie: string;
    };
  };
}

export interface LocationAndCropGraph {
  farm_id: string;
  name: string;
  location_id: string;
  figure: {
    area: {
      grid_points: Point[];
    };
  };
  management_plan: ManagementPlan;
}

interface EnsembleCropData {
  crop_common_name: string;
  crop_genus: string;
  crop_specie: string;
  seed_date: string;
  management_plan_id?: string; // For dev purposes
}

export interface EnsembleLocationAndCropData {
  farm_id: string;
  name: string;
  location_id: string;
  grid_points: Point[];
  crop_data: EnsembleCropData[];
}

export interface AllOrganisationsFarmData {
  [org_pk: number]: EnsembleLocationAndCropData[];
}

export type ExternalIrrigationPrescription = {
  id: number;
  location_id: Location['location_id'];
  management_plan_id?: ModelManagementPlan['management_plan_id'];
  recommended_start_datetime: string;
};

export interface IrrigationPrescription extends ExternalIrrigationPrescription {
  partner_id: AddonPartner['id'];
  task_id?: Task['task_id'];
}

// Type guard for external endpoint
// AI-assisted type guard
export function isExternalIrrigationPrescriptionArray(
  data: unknown,
): data is ExternalIrrigationPrescription[] {
  return (
    Array.isArray(data) &&
    data.every((item): item is ExternalIrrigationPrescription => {
      if (typeof item !== 'object' || item === null) return false;

      const obj = item as Record<string, unknown>;

      return (
        typeof obj.id === 'number' &&
        typeof obj.location_id === 'string' &&
        (obj.management_plan_id === undefined || typeof obj.management_plan_id === 'number') &&
        typeof obj.recommended_start_datetime === 'string'
      );
    })
  );
}
