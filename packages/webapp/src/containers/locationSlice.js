import { createSelector } from 'reselect';
import { barnsSelector, barnStatusSelector } from './barnSlice';
import { ceremonialsSelector, ceremonialStatusSelector } from './ceremonialSlice';
import { farmSiteBoundarysSelector, farmSiteBoundaryStatusSelector } from './farmSiteBoundarySlice';
import { fieldsSelector, fieldStatusSelector } from './fieldSlice';
import { greenhousesSelector, greenhouseStatusSelector } from './greenhouseSlice';
import { surfaceWatersSelector, surfaceWaterStatusSelector } from './surfaceWaterSlice';
import { naturalAreasSelector, naturalAreaStatusSelector } from './naturalAreaSlice';
import { residencesSelector, residenceStatusSelector } from './residenceSlice';
import { locationEnum } from './Map/constants';
import { bufferZonesSelector, bufferZoneStatusSelector } from './bufferZoneSlice';
import { creeksSelector, creekStatusSelector } from './creekSlice';
import { fencesSelector, fenceStatusSelector } from './fenceSlice';
import { gatesSelector, gateStatusSelector } from './gateSlice';
import { waterValvesSelector, waterValveStatusSelector } from './waterValveSlice';
import { gardensSelector } from './gardenSlice';

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
  [bufferZonesSelector, creeksSelector, fencesSelector],
  (bufferZones, creeks, fences) => {
    const result = {};
    result[locationEnum.buffer_zone] = bufferZones;
    result[locationEnum.creek] = creeks;
    result[locationEnum.fence] = fences;
    return result;
  },
);
export const lineStatusSelector = createSelector(
  [bufferZoneStatusSelector, creekStatusSelector, fenceStatusSelector],
  (bufferZoneStatus, creekStatus, fenceStatus) => {
    return {
      loading: bufferZoneStatus.loading || creekStatus.loading || fenceStatus.loading,
      loaded: bufferZoneStatus.loaded && creekStatus.loaded && fenceStatus.loaded,
      error: bufferZoneStatus.error || creekStatus.error || fenceStatus.error,
    };
  },
);

export const pointSelector = createSelector(
  [gatesSelector, waterValvesSelector],
  (gates, waterValves) => {
    const result = {};
    result[locationEnum.gate] = gates;
    result[locationEnum.water_valve] = waterValves;
    return result;
  },
);
export const pointStatusSelector = createSelector(
  [gateStatusSelector, waterValveStatusSelector],
  (gateStatus, waterValveStatus) => {
    return {
      loading: gateStatus.loading || waterValveStatus.loading,
      loaded: gateStatus.loaded && waterValveStatus.loaded,
      error: gateStatus.error || waterValveStatus.error,
    };
  },
);
