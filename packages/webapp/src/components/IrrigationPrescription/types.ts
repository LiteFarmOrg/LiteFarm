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

import { Point } from '../../util/geoUtils';

export interface UriPrescriptionData {
  soil_moisture_deficit: number;
  application_depth: number;
  application_depth_unit: string;
}

export type VriPrescriptionData = UriPrescriptionData & {
  grid_points: Point[];
};

export type IrrigationPrescriptionTableInfo = UriPrescriptionData & {
  id: number;
};

// TODO LF-4788: This is the backend-received data structure and belongs in the RTK Query slice types once that endpoint is implemented
export type IrrigationPrescription = {
  id: number;

  location_id: string;
  recommended_start_datetime: string; // ISO string

  pivot: {
    center: { lat: number; lng: number };
    radius: number; // in meters
  };

  metadata: {
    // metadata = external sources of information used to generate the irrigation prescription
    weather_forecast?: {
      temperature: number;
      temperature_unit: string;
      wind_speed: number;
      wind_speed_unit: string;
      cumulative_rainfall: number;
      cumultative_rainfall_unit: string;
      et_rate: number;
      et_rate_unit: string;
      weather_icon_code: string; // '02d', '50n', OpenWeatherMap icon code if available
    };
  };

  estimated_time: number;
  estimated_time_unit: string;

  // calculated by the backend
  estimated_water_consumption: number;
  estimated_water_consumption_unit: string;

  // TODO: confirm with product if we are indeed getting only URI or VRI data per prescription
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
