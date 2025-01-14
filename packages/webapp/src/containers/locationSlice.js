import { createSelector } from 'reselect';
import { barnEntitiesSelector, barnsSelector, barnStatusSelector } from './barnSlice';
import {
  ceremonialEntitiesSelector,
  ceremonialsSelector,
  ceremonialStatusSelector,
} from './ceremonialSlice';
import {
  farmSiteBoundaryEntitiesSelector,
  farmSiteBoundarysSelector,
  farmSiteBoundaryStatusSelector,
} from './farmSiteBoundarySlice';
import { fieldEntitiesSelector, fieldsSelector, fieldStatusSelector } from './fieldSlice';
import {
  greenhouseEntitiesSelector,
  greenhousesSelector,
  greenhouseStatusSelector,
} from './greenhouseSlice';
import {
  surfaceWaterEntitiesSelector,
  surfaceWatersSelector,
  surfaceWaterStatusSelector,
} from './surfaceWaterSlice';
import {
  naturalAreaEntitiesSelector,
  naturalAreasSelector,
  naturalAreaStatusSelector,
} from './naturalAreaSlice';
import {
  residenceEntitiesSelector,
  residencesSelector,
  residenceStatusSelector,
} from './residenceSlice';
import { locationEnum } from './Map/constants';
import {
  bufferZoneEntitiesSelector,
  bufferZonesSelector,
  bufferZoneStatusSelector,
} from './bufferZoneSlice';
import {
  watercourseEntitiesSelector,
  watercoursesSelector,
  watercourseStatusSelector,
} from './watercourseSlice';
import { fenceEntitiesSelector, fencesSelector, fenceStatusSelector } from './fenceSlice';
import { gateEntitiesSelector, gatesSelector, gateStatusSelector } from './gateSlice';
import {
  waterValveEntitiesSelector,
  waterValvesSelector,
  waterValveStatusSelector,
} from './waterValveSlice';
import { sensorEntitiesSelector, sensorSelector, sensorStatusSelector } from './sensorSlice';
import { gardenEntitiesSelector, gardensSelector, gardenStatusSelector } from './gardenSlice';

export const sortedAreaSelector = createSelector(
  [
    barnsSelector,
    ceremonialsSelector,
    farmSiteBoundarysSelector,
    fieldsSelector,
    gardensSelector,
    greenhousesSelector,
    surfaceWatersSelector,
    naturalAreasSelector,
    residencesSelector,
  ],
  (
    barns,
    ceremonials,
    farmSiteBoundaries,
    fields,
    gardens,
    greenhouses,
    surfaceWaters,
    naturalAreas,
    residences,
  ) => {
    const result = [
      ...barns,
      ...ceremonials,
      ...farmSiteBoundaries,
      ...fields,
      ...gardens,
      ...greenhouses,
      ...surfaceWaters,
      ...naturalAreas,
      ...residences,
    ];
    return result.sort((a, b) => b.total_area - a.total_area);
  },
);

export const areaSelector = createSelector(
  [
    barnsSelector,
    ceremonialsSelector,
    farmSiteBoundarysSelector,
    fieldsSelector,
    gardensSelector,
    greenhousesSelector,
    surfaceWatersSelector,
    naturalAreasSelector,
    residencesSelector,
  ],
  (
    barns,
    ceremonials,
    farmSiteBoundaries,
    fields,
    gardens,
    greenhouses,
    surfaceWaters,
    naturalAreas,
    residences,
  ) => {
    const result = {};
    result[locationEnum.barn] = barns;
    result[locationEnum.ceremonial_area] = ceremonials;
    result[locationEnum.farm_site_boundary] = farmSiteBoundaries;
    result[locationEnum.field] = fields;
    result[locationEnum.garden] = gardens;
    result[locationEnum.greenhouse] = greenhouses;
    result[locationEnum.surface_water] = surfaceWaters;
    result[locationEnum.natural_area] = naturalAreas;
    result[locationEnum.residence] = residences;
    return result;
  },
);

export const areaStatusSelector = createSelector(
  [
    barnStatusSelector,
    ceremonialStatusSelector,
    farmSiteBoundaryStatusSelector,
    fieldStatusSelector,
    greenhouseStatusSelector,
    surfaceWaterStatusSelector,
    naturalAreaStatusSelector,
    residenceStatusSelector,
  ],
  (
    barnStatus,
    ceremonialStatus,
    farmSiteBoundarieStatus,
    fieldStatus,
    greenhouseStatus,
    surfaceWaterStatus,
    naturalAreaStatus,
    residenceStatus,
  ) => {
    return {
      loading:
        barnStatus.loading ||
        ceremonialStatus.loading ||
        farmSiteBoundarieStatus.loading ||
        fieldStatus.loading ||
        greenhouseStatus.loading ||
        surfaceWaterStatus.loading ||
        naturalAreaStatus.loading ||
        residenceStatus.loading,
      loaded:
        barnStatus.loaded &&
        ceremonialStatus.loaded &&
        farmSiteBoundarieStatus.loaded &&
        fieldStatus.loaded &&
        greenhouseStatus.loaded &&
        surfaceWaterStatus.loaded &&
        naturalAreaStatus.loaded &&
        residenceStatus.loaded,
      error:
        barnStatus.error ||
        ceremonialStatus.error ||
        farmSiteBoundarieStatus.error ||
        fieldStatus.error ||
        greenhouseStatus.error ||
        surfaceWaterStatus.error ||
        naturalAreaStatus.error ||
        residenceStatus.error,
    };
  },
);

export const lineSelector = createSelector(
  [bufferZonesSelector, watercoursesSelector, fencesSelector],
  (bufferZones, watercourses, fences) => {
    const result = {};
    result[locationEnum.buffer_zone] = bufferZones;
    result[locationEnum.watercourse] = watercourses;
    result[locationEnum.fence] = fences;
    return result;
  },
);
export const lineStatusSelector = createSelector(
  [bufferZoneStatusSelector, watercourseStatusSelector, fenceStatusSelector],
  (bufferZoneStatus, watercourseStatus, fenceStatus) => {
    return {
      loading: bufferZoneStatus.loading || watercourseStatus.loading || fenceStatus.loading,
      loaded: bufferZoneStatus.loaded && watercourseStatus.loaded && fenceStatus.loaded,
      error: bufferZoneStatus.error || watercourseStatus.error || fenceStatus.error,
    };
  },
);

export const pointSelector = createSelector(
  [gatesSelector, waterValvesSelector, sensorSelector],
  (gates, waterValves, sensor) => {
    const result = {};
    result[locationEnum.gate] = gates;
    result[locationEnum.water_valve] = waterValves;
    result[locationEnum.sensor] = sensor;
    return result;
  },
);
export const pointStatusSelector = createSelector(
  [gateStatusSelector, waterValveStatusSelector, sensorStatusSelector],
  (gateStatus, waterValveStatus, sensorStatus) => {
    return {
      loading: gateStatus.loading || waterValveStatus.loading || sensorStatus.loading,
      loaded: gateStatus.loaded && waterValveStatus.loaded && sensorStatus.loaded,
      error: gateStatus.error || waterValveStatus.error || sensorStatus.error,
    };
  },
);
/**
 * {
 *
 * location_id: field,
 *
 * location_id: garden,
 *
 * location_id: greenhouse,
 *
 * location_id: buffer_zone
 *
 * }
 */
export const cropLocationEntitiesSelector = createSelector(
  [
    fieldEntitiesSelector,
    gardenEntitiesSelector,
    greenhouseEntitiesSelector,
    bufferZoneEntitiesSelector,
  ],
  (fieldEntities, gardenEntities, greenhouseEntities, bufferzoneEntities) => {
    return { ...fieldEntities, ...gardenEntities, ...greenhouseEntities, ...bufferzoneEntities };
  },
);

export const cropLocationByIdSelector = (location_id) =>
  createSelector(cropLocationEntitiesSelector, (entities) => entities[location_id]);

export const cropLocationStatusSelector = createSelector(
  [fieldStatusSelector, gardenStatusSelector, greenhouseStatusSelector, bufferZoneStatusSelector],
  (fieldStatus, gardenStatus, greenhouseStatus, bufferzoneStatus) => ({
    loading:
      fieldStatus.loading ||
      gardenStatus.loading ||
      greenhouseStatus.loading ||
      bufferzoneStatus.loading,
    loaded:
      fieldStatus.loaded &&
      gardenStatus.loaded &&
      greenhouseStatus.loaded &&
      bufferzoneStatus.loaded,
    error:
      fieldStatus.error || gardenStatus.error || greenhouseStatus.error || bufferzoneStatus.error,
  }),
);

export const cropLocationsSelector = createSelector(
  [fieldsSelector, gardensSelector, greenhousesSelector, bufferZonesSelector],
  (fields, gardens, greenhouses, bufferzones) => {
    return [...fields, ...gardens, ...greenhouses, ...bufferzones];
  },
);

export const animalLocationsSelector = createSelector(
  [
    barnsSelector,
    ceremonialsSelector,
    fieldsSelector,
    gardensSelector,
    greenhousesSelector,
    surfaceWatersSelector,
    naturalAreasSelector,
    residencesSelector,
    bufferZonesSelector,
    watercoursesSelector,
  ],
  (
    barns,
    ceremonials,
    fields,
    gardens,
    greenhouses,
    surfaceWaters,
    naturalAreas,
    residences,
    bufferzones,
    watercourses,
  ) => {
    return [
      ...barns,
      ...ceremonials,
      ...fields,
      ...gardens,
      ...greenhouses,
      ...surfaceWaters,
      ...naturalAreas,
      ...residences,
      ...bufferzones,
      ...watercourses,
    ];
  },
);

export const locationsSelector = createSelector(
  [areaSelector, lineSelector, pointSelector],
  (areas, lines, points) => {
    const locationAssetMaps = { ...areas, ...lines, ...points };
    return Object.keys(locationAssetMaps).reduce(
      (allLocations, locationType) => allLocations.concat(locationAssetMaps[locationType]),
      [],
    );
  },
);

export const locationByIdSelector = (location_id) =>
  createSelector(locationsSelector, (entities) =>
    entities.find((entity) => entity.location_id === location_id),
  );

export const locationEntitiesSelector = createSelector(
  [
    barnEntitiesSelector,
    ceremonialEntitiesSelector,
    farmSiteBoundaryEntitiesSelector,
    fieldEntitiesSelector,
    gardenEntitiesSelector,
    greenhouseEntitiesSelector,
    surfaceWaterEntitiesSelector,
    naturalAreaEntitiesSelector,
    residenceEntitiesSelector,
    bufferZoneEntitiesSelector,
    watercourseEntitiesSelector,
    fenceEntitiesSelector,
    gateEntitiesSelector,
    waterValveEntitiesSelector,
    sensorEntitiesSelector,
  ],
  (...args) => {
    return args.reduce(
      (locationEntities, entities) => Object.assign(locationEntities, entities),
      {},
    );
  },
);
