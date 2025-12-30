import {
  AreaFigureDetails,
  BarnDetails,
  FenceDetails,
  FieldDetails,
  Figure,
  FigureType,
  GardenDetails,
  GreenhouseDetails,
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

export type ExternalPoints = {
  sensor?: ExternalSensorWithType[];
  sensor_array?: ExternalSensorArrayWithType[];
};

export type ExternalLocations = {
  point?: ExternalPoints;
};
