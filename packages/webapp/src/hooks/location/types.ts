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

import {
  AreaFigureDetails,
  BarnDetails,
  FenceDetails,
  FieldDetails,
  Figure,
  FigureType,
  GardenDetails,
  GreenhouseDetails,
  InternalMapLocationType,
  LineFigureDetails,
  Location,
  PointFigureDetails,
  Sensor,
  SensorArray,
  SurfaceWaterDetails,
  WatercourseDetails,
  WaterValveDetails,
  WithFigureId,
  WithLocationId,
} from '../../store/api/types';

// Internal Locations
type FigurePayloadMap = {
  [FigureType.AREA]: AreaFigureDetails;
  [FigureType.LINE]: LineFigureDetails;
  [FigureType.POINT]: PointFigureDetails;
};

type FlattenedFigureWithType<T extends FigureType> = { figure_type: T } & FigurePayloadMap[T] &
  Omit<WithFigureId<Figure>, 'location_id'>;

export type FlattenedBarn = WithLocationId<Location> &
  FlattenedFigureWithType<FigureType.AREA> &
  BarnDetails;
export type FlattenedBufferZone = WithLocationId<Location> &
  FlattenedFigureWithType<FigureType.LINE>;
export type FlattenedCeremonialArea = WithLocationId<Location> &
  FlattenedFigureWithType<FigureType.AREA>;
export type FlattenedFarmSiteBoundary = WithLocationId<Location> &
  FlattenedFigureWithType<FigureType.AREA>;
export type FlattenedFence = WithLocationId<Location> &
  FlattenedFigureWithType<FigureType.LINE> &
  FenceDetails;
export type FlattenedField = WithLocationId<Location> &
  FlattenedFigureWithType<FigureType.AREA> &
  FieldDetails;
export type FlattenedGarden = WithLocationId<Location> &
  FlattenedFigureWithType<FigureType.AREA> &
  GardenDetails;
export type FlattenedGate = WithLocationId<Location> & FlattenedFigureWithType<FigureType.POINT>;
export type FlattenedGreenhouse = WithLocationId<Location> &
  FlattenedFigureWithType<FigureType.AREA> &
  GreenhouseDetails;
export type FlattenedNaturalArea = WithLocationId<Location> &
  FlattenedFigureWithType<FigureType.AREA>;
export type FlattenedResidence = WithLocationId<Location> &
  FlattenedFigureWithType<FigureType.AREA>;
export type FlattenedSoilSampleLocation = WithLocationId<Location> &
  FlattenedFigureWithType<FigureType.POINT>;
export type FlattenedSurfaceWater = WithLocationId<Location> &
  FlattenedFigureWithType<FigureType.AREA> &
  SurfaceWaterDetails;
export type FlattenedWatercourse = WithLocationId<Location> &
  FlattenedFigureWithType<FigureType.LINE> &
  WatercourseDetails;
export type FlattenedWaterValve = WithLocationId<Location> &
  FlattenedFigureWithType<FigureType.POINT> &
  WaterValveDetails;

export type FlattenedInternalMapLocation =
  | FlattenedBarn
  | FlattenedBufferZone
  | FlattenedCeremonialArea
  | FlattenedFarmSiteBoundary
  | FlattenedFence
  | FlattenedField
  | FlattenedGarden
  | FlattenedGate
  | FlattenedGreenhouse
  | FlattenedNaturalArea
  | FlattenedResidence
  | FlattenedSoilSampleLocation
  | FlattenedSurfaceWater
  | FlattenedWatercourse
  | FlattenedWaterValve;

// External Locations
export enum ExternalMapLocationType {
  SENSOR = 'sensor',
  SENSOR_ARRAY = 'sensor_array',
}

export type ExternalLocationWithType<T> = T & {
  type: ExternalMapLocationType;
  figure_type: FigureType;
};

export interface ExternalSensorWithType extends ExternalLocationWithType<Sensor> {
  isAddonSensor: boolean;
}

export interface ExternalSensorArrayWithType extends ExternalLocationWithType<SensorArray> {
  isAddonSensor: boolean;
}

// Shared
export enum GroupByOptions {
  TYPE = 'type',
  FIGURE = 'figure',
  FIGURE_AND_TYPE = 'figure_and_type',
}

export type UseLocationPropsWithFilterBy<AvailableLocationTypes, HookProps = {}> = HookProps & {
  filterBy?: AvailableLocationTypes | FigureType;
  groupBy?: never;
};

export type UseLocationPropsWithGroupBy<T = {}> = T & {
  filterBy?: never;
  groupBy?: GroupByOptions;
};
