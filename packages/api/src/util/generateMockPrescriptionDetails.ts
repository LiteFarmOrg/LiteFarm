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

import { customError } from './customErrors.js';
import LocationModel from '../models/locationModel.js';
import ManagementPlanModel from '../models/managementPlanModel.js';
import { Point, getCentroidOfPolygon } from './geoUtils.js';
import type {
  EsciReturnedPrescriptionDetails,
  VriPrescriptionData,
} from './ensembleService.types.js';

/* Reverse the logic generating the mock id to pull a datetime from it */
export const getDateFromDayOfMonth = (day: number): string => {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), day);

  return date.toISOString().split('T')[0];
};

interface GenerateMockPrescriptionDetailsParams {
  farm_id: string;
  irrigationPrescriptionId: number;
  applicationDepths?: number[];
  pivotRadius?: number;
  pivotArc?: { start_angle: string; end_angle: string };
}

export const generateMockPrescriptionDetails = async ({
  farm_id,
  irrigationPrescriptionId,
  applicationDepths = [15, 10, 20],
  pivotRadius = 400,
  pivotArc = { start_angle: '190', end_angle: '45' },
}: GenerateMockPrescriptionDetailsParams): Promise<EsciReturnedPrescriptionDetails> => {
  const locations = await LocationModel.getCropSupportingLocationsByFarmId(farm_id);

  if (locations.length === 0) {
    throw customError('No crop supporting locations found for the farm', 404);
  }

  const managementPlan = await ManagementPlanModel.getMostRecentManagementPlanByLocationId(
    locations[0].location_id,
  );

  const locationPolygon = locations[0].figure?.area?.grid_points;

  const mockPivot = {
    center: getCentroidOfPolygon(locationPolygon) ?? locationPolygon[0],
    radius: pivotRadius,
  };

  const commonMockData = {
    id: irrigationPrescriptionId,
    location_id: locations[0].location_id,
    management_plan_id: managementPlan?.management_plan_id ?? null,
    recommended_start_date: getDateFromDayOfMonth(irrigationPrescriptionId),
    pivot: mockPivot,
    system_name: 'NW System',
    system_id: 12,
    metadata: {
      weather_forecast: {
        temperature: 20,
        temperature_unit: '˚C' as const,
        wind_speed: 10,
        wind_speed_unit: 'm/s' as const,
        cumulative_rainfall: 5,
        cumulative_rainfall_unit: 'mm' as const,
        et_rate: 2,
        et_rate_unit: 'mm/24h',
        weather_icon_code: '02d',
      },
    },
  };

  const mockUriData = {
    application_depth: applicationDepths[0],
    application_depth_unit: 'mm',
    soil_moisture_deficit: 40,
  };

  // All even IP IDs will return URI data, odd ones will return VRI data
  return irrigationPrescriptionId % 2 === 0
    ? {
        ...commonMockData,
        pivot: {
          ...mockPivot,
          arc: pivotArc,
        },
        prescription: {
          uriData: mockUriData,
        },
      }
    : {
        ...commonMockData,
        prescription: {
          vriData: {
            zones: generateMockPieSliceZones(mockPivot, applicationDepths),
            file_url: 'https://example.com/vri_data.vri',
          },
        },
      };
};

// Mock relocated from frontend; PR #3779
const EARTH_RADIUS = 6371000;

function offsetPoint(center: Point, distance: number, angleDeg: number): Point {
  const angleRad = (angleDeg * Math.PI) / 180;
  const deltaLat = (distance * Math.cos(angleRad)) / EARTH_RADIUS;
  const deltaLng =
    (distance * Math.sin(angleRad)) / (EARTH_RADIUS * Math.cos((center.lat * Math.PI) / 180));

  return {
    lat: center.lat + (deltaLat * 180) / Math.PI,
    lng: center.lng + (deltaLng * 180) / Math.PI,
  };
}

function generateMockPieSliceZones(
  {
    center,
    radius,
  }: {
    center: Point;
    radius: number;
  },
  applicationDepths: number[],
): VriPrescriptionData[] {
  const zones: VriPrescriptionData[] = [];
  const zoneCount = 3;
  const arcSpan = 120;

  for (let i = 0; i < zoneCount; i++) {
    const startAngle = i * arcSpan;
    const endAngle = startAngle + arcSpan;
    const step = 30;

    const arcPoints: Point[] = [];
    for (let angle = startAngle; angle <= endAngle; angle += step) {
      arcPoints.push(offsetPoint(center, radius, angle));
    }

    const innerEdgePoint = offsetPoint(center, radius * 0.6, endAngle);
    const innerStartPoint = offsetPoint(center, radius * 0.6, startAngle);

    const polygonPoints = [...arcPoints, innerEdgePoint, center, innerStartPoint];

    zones.push({
      soil_moisture_deficit: 40 + i * 10,
      application_depth: applicationDepths[i],
      application_depth_unit: 'mm',
      grid_points: polygonPoints,
    });
  }

  return zones;
}
