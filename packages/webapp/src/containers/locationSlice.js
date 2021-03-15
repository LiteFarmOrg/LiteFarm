import { createSelector } from 'reselect';
import { barnsSelector, barnStatusSelector } from './barnSlice';
import { ceremonialsSelector, ceremonialStatusSelector } from './ceremonialSlice';
import { farmSiteBoundarysSelector, farmSiteBoundaryStatusSelector } from './farmSiteBoundarySlice';
import { fieldsSelector, fieldStatusSelector } from './fieldSlice';
import { greenhousesSelector, greenhouseStatusSelector } from './greenhouseSlice';
import { groundwatersSelector, groundwaterStatusSelector } from './groundwaterSlice';
import { naturalAreasSelector, naturalAreaStatusSelector } from './naturalAreaSlice';
import { residencesSelector, residenceStatusSelector } from './residenceSlice';
import { locationEnum } from './Map/constants';
import { bufferZonesSelector, bufferZoneStatusSelector } from './bufferZoneSlice';
import { creeksSelector, creekStatusSelector } from './creekSlice';
import { fencesSelector, fenceStatusSelector } from './fenceSlice';
import { gatesSelector, gateStatusSelector } from './gateSlice';
import { waterValvesSelector, waterValveStatusSelector } from './waterValveSlice';

export const areaSelector = createSelector(
  [
    barnsSelector,
    ceremonialsSelector,
    farmSiteBoundarysSelector,
    fieldsSelector,
    greenhousesSelector,
    groundwatersSelector,
    naturalAreasSelector,
    residencesSelector,
  ],
  (
    barns,
    ceremonials,
    farmSiteBoundaries,
    fields,
    greenhouses,
    groundwaters,
    naturalAreas,
    residences,
  ) => {
    const result = {};
    result[locationEnum.barn] = barns;
    result[locationEnum.ceremonial_area] = ceremonials;
    result[locationEnum.farm_bound] = farmSiteBoundaries;
    result[locationEnum.field] = fields;
    result[locationEnum.greenhouse] = greenhouses;
    result[locationEnum.ground_water] = groundwaters;
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
    groundwaterStatusSelector,
    naturalAreaStatusSelector,
    residenceStatusSelector,
  ],
  (
    barnStatus,
    ceremonialStatus,
    farmSiteBoundarieStatus,
    fieldStatus,
    greenhouseStatus,
    groundwaterStatus,
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
        groundwaterStatus.loading ||
        naturalAreaStatus.loading ||
        residenceStatus.loading,
      loaded:
        barnStatus.loaded &&
        ceremonialStatus.loaded &&
        farmSiteBoundarieStatus.loaded &&
        fieldStatus.loaded &&
        greenhouseStatus.loaded &&
        groundwaterStatus.loaded &&
        naturalAreaStatus.loaded &&
        residenceStatus.loaded,
      error:
        barnStatus.error ||
        ceremonialStatus.error ||
        farmSiteBoundarieStatus.error ||
        fieldStatus.error ||
        greenhouseStatus.error ||
        groundwaterStatus.error ||
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
