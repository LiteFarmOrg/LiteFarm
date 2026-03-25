/*
 *  Copyright 2026 LiteFarm.org
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

import { getFigureType } from '../../../containers/LocationDetails/utils';
import {
  BufferWidthUnit,
  FlowRateUnit,
  InternalMapLocationType,
  LengthWidthUnit,
  PerimiterUnit,
  TotalAreaUnit,
  WaterSource,
} from '../../../store/api/types';
import { OrganicStatus } from '../../../types';

const farm_id = '31881f94-83c6-11ec-9fa9-0242ac130004';

// Locations
const fakeGridPoints = [
  {
    lat: 49.26822337992714,
    lng: -123.2591160736328,
  },
  {
    lat: 49.2656190259034,
    lng: -123.25606908419188,
  },
  {
    lat: 49.267131248202105,
    lng: -123.25177754976805,
  },
  {
    lat: 49.27068758833716,
    lng: -123.25430955507811,
  },
];

const fakeArea = {
  grid_points: fakeGridPoints,
  total_area: 40,
  total_area_unit: TotalAreaUnit.M2,
  perimeter: 26,
  perimeter_unit: PerimiterUnit.M,
};

const fakeLine = {
  line_points: fakeGridPoints, // minimum 2
  length: 40,
  length_unit: LengthWidthUnit.M,
  width: 1,
  width_unit: LengthWidthUnit.M,
  total_area: 40,
  total_area_unit: TotalAreaUnit.M2,
};

const fakePoint = {
  point: fakeGridPoints[0],
};

const figure_id = '8b56f10c-2724-11f1-b435-ce0b8496eaa9';
const hasFigureId = (figure_id) => (figure_id ? { figure_id } : {});

const fakeBaseFigure = (locationType, figure_id, location_id) => ({
  ...hasFigureId(figure_id),
  ...hasLocationId(location_id),
  type: locationType,
});

const fakeFigure = (locationType, figure_id, location_id) => {
  const figureType = getFigureType(locationType);
  switch (figureType) {
    case 'area':
      return { ...fakeBaseFigure(locationType, figure_id, location_id), ...fakeArea };
    case 'line':
      return { ...fakeBaseFigure(locationType, figure_id, location_id), ...fakeLine };
    case 'point':
      return { ...fakeBaseFigure(locationType, figure_id, location_id), ...fakePoint };
    default:
      return {};
  }
};

const fakeStationId = {
  station_id: null,
};

const fakeOrganicStatus = {
  organic_status: OrganicStatus.NON_ORGANIC,
  transition_date: null,
};

const fakeBarn = {
  wash_and_pack: null,
  cold_storage: null,
  used_for_animals: null,
};

const fakeFence = {
  pressure_treated: null,
};

const fakeField = {
  ...fakeStationId,
  ...fakeOrganicStatus,
};

const fakeGarden = {
  ...fakeStationId,
  ...fakeOrganicStatus,
};

const fakeGreenhouse = {
  ...fakeOrganicStatus,
  supplemental_lighting: null,
  co2_enrichment: null,
  greenhouse_heated: null,
};

const fakeSurfaceWater = {
  used_for_irrigation: null,
};

const fakeWatercourse = {
  used_for_irrigation: null,
  buffer_width: 2,
  buffer_width_unit: BufferWidthUnit.M,
};

const fakeWaterValve = {
  source: WaterSource.GROUNDWATER,
  flow_rate: 1,
  flow_rate_unit: FlowRateUnit.L_PER_MIN,
};

const fakeLocationTypeDetails = {
  [InternalMapLocationType.BARN]: fakeBarn,
  [InternalMapLocationType.BUFFER_ZONE]: {},
  [InternalMapLocationType.CEREMONIAL_AREA]: {},
  [InternalMapLocationType.FARM_SITE_BOUNDARY]: {},
  [InternalMapLocationType.FENCE]: fakeFence,
  [InternalMapLocationType.FIELD]: fakeField,
  [InternalMapLocationType.GARDEN]: fakeGarden,
  [InternalMapLocationType.GATE]: {},
  [InternalMapLocationType.GREENHOUSE]: fakeGreenhouse,
  [InternalMapLocationType.NATURAL_AREA]: {},
  [InternalMapLocationType.RESIDENCE]: {},
  [InternalMapLocationType.SOIL_SAMPLE_LOCATION]: {},
  [InternalMapLocationType.SURFACE_WATER]: fakeSurfaceWater,
  [InternalMapLocationType.WATERCOURSE]: fakeWatercourse,
  [InternalMapLocationType.WATER_VALVE]: fakeWaterValve,
};

const location_id = '8b566c14-2724-11f1-b435-ce0b8496eaa9';
const hasLocationId = (location_id) => (location_id ? { location_id } : {});

export const fakeDBLocation = (locationType) => ({
  ...fakeLocationTypeDetails[locationType],
  ...hasLocationId(location_id),
  figure: fakeFigure(locationType, figure_id, location_id),
  farm_id: farm_id,
  name: locationType,
  notes: null,
  location_defaults: null,
  deleted: false,
});
