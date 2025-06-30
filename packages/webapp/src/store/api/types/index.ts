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
import { OrganicStatus } from '../../../types';
import {
  UriPrescriptionData,
  VriPrescriptionData,
} from '../../../components/IrrigationPrescription/types';

// If we don't necessarily want to type an endpoint
export type Result = Array<{ [key: string]: any }>;

export interface Animal {
  animal_use_relationships?: {
    animal_id: number;
    use_id: number;
    other_use: null | string;
  }[];
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
  identifier_type_id: number | null;
  identifier_type_other: string | null;
  identifier_color_id: number | null;
  internal_identifier: number;
  name: string | null;
  notes: string | null;
  origin_id: number;
  photo_url: string | null;
  sex_id: number;
  sire: string | null;
  weaning_date: string | null;
  organic_status: OrganicStatus;
  supplier: string | null;
  price: number | null;
  animal_removal_reason_id: number | null;
  removal_explanation: string | null;
  removal_date: string | null;
  location_id: string | null;
  tasks: { task_id: number }[];
  type_name?: string; // request only
  breed_name?: string; // request only
}

export interface AnimalBatch {
  animal_batch_use_relationships?: {
    animal_batch_id: number;
    use_id: number;
    other_use: null | string;
  }[];
  birth_date: string | null;
  brought_in_date: string | null;
  count: number;
  custom_breed_id: number | null;
  custom_type_id: number | null;
  dam: string | null;
  default_breed_id: number | null;
  default_type_id: number | null;
  farm_id: string;
  id: number;
  internal_identifier: number;
  name: string | null;
  notes: string | null;
  origin_id: number;
  photo_url: string | null;
  sex_detail: {
    id?: number; // response only
    animal_batch_id?: number; // response only
    sex_id: number;
    count: number;
  }[];
  sire: string | null;
  organic_status: OrganicStatus;
  supplier: string | null;
  price: number | null;
  animal_removal_reason_id: number | null;
  removal_explanation: string | null;
  removal_date: string | null;
  location_id: string | null;
  tasks: { task_id: number }[];
  type_name?: string; // request only
  breed_name?: string; // request only
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

export interface AnimalIdentifierType {
  id: number;
  key: string;
}

export interface AnimalIdentifierColor {
  id: number;
  key: string;
}

export interface AnimalMovementPurpose {
  id: number;
  key: string;
}

export interface AnimalOrigin {
  id: number;
  key: string;
}

export interface AnimalUse {
  default_type_id: number | null;
  uses: { id: number; key: string }[];
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

// As specified by Ensemble
export type SensorTypes =
  | 'Weather station'
  | 'Soil Water Potential Sensor'
  | 'IR Temperature Sensor'
  | 'Wind speed sensor'
  | 'Drip line pressure sensor';

export type SensorReadingTypes =
  | 'barometric_pressure'
  | 'cumulative_rainfall'
  | 'current'
  | 'energy'
  | 'rainfall_rate'
  | 'relative_humidity'
  | 'soc'
  | 'soil_water_content'
  | 'soil_water_potential'
  | 'solar_radiation'
  | 'solenoid_control'
  | 'temperature'
  | 'voltage'
  | 'water_pressure'
  | 'wind_direction'
  | 'wind_speed';

export interface Sensor {
  name: SensorTypes;
  label: string; // descriptive name provided by Ensemble
  external_id: string; // esid
  point: {
    lat: number;
    lng: number;
  };
  depth: number;
  depth_unit: 'cm';
  last_seen: string;
  sensor_array_id: string | null;
  location_id: string; //backwards compatibility only
}

export interface SensorArray {
  id: string;
  label: string; // descriptive name provided by Ensemble
  system: string; // descriptive name for the irrigation system
  sensors: Sensor['external_id'][];
  point: {
    lat: number;
    lng: number;
  };
  location_id: string; // backwards compatibility only
}

export interface SensorData {
  sensors: Sensor[];
  sensor_arrays: SensorArray[];
}

export interface FarmAddon {
  id: number;
  addon_partner_id: number;
  org_uuid: string;
}

export type SensorReadingTypeUnits =
  | 'hPa'
  | 'mm'
  | 'mA'
  | 'mWh'
  | 'mm/h'
  | '%'
  | 'kPa'
  | 'W/m2'
  | 'C'
  | 'V'
  | 'psi'
  | 'deg'
  | 'm/s';

export interface SensorDatapoint {
  dateTime: number; // Unix timestamp
  [esid: string]: number | undefined; // Allow missing keys
}

export interface SensorReadings {
  reading_type: SensorReadingTypes;
  unit: SensorReadingTypeUnits;
  readings: SensorDatapoint[];
}
export interface IrrigationPrescription {
  id: number;
  location_id: string;
  management_plan_id?: number | string;
  recommended_start_datetime: string;
  partner_id: number;
  task_id?: number | string;
}

export type IrrigationPrescriptionDetails = {
  id: number;

  location_id: string;
  management_plan_id: number | null;
  recommended_start_datetime: string; // ISO string

  system: string; // descriptive name for the irrigation system

  pivot: {
    center: { lat: number; lng: number };
    radius: number; // in meters
  };

  metadata: {
    // metadata = external sources of information used to generate the irrigation prescription
    weather_forecast: {
      temperature: number;
      temperature_unit: SensorReadingTypeUnits;
      wind_speed: number;
      wind_speed_unit: SensorReadingTypeUnits;
      cumulative_rainfall: number;
      cumulative_rainfall_unit: SensorReadingTypeUnits;
      et_rate: number;
      et_rate_unit: string;
      weather_icon_code: string; // '02d', '50n', OpenWeatherMap icon code
    };
  };

  estimated_time: number;
  estimated_time_unit: string;

  // calculated by the backend
  estimated_water_consumption: number;
  estimated_water_consumption_unit: string;

  prescription:
    | { uriData: UriPrescriptionData; vriData?: never }
    | {
        vriData: {
          zones: VriPrescriptionData[];
          file_url: string;
        };
        uriData?: never;
      };
};
