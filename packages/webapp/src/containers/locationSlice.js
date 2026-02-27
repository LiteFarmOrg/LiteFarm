import { createSelector } from 'reselect';
import { barnEntitiesSelector } from './barnSlice';
import { ceremonialEntitiesSelector } from './ceremonialSlice';
import { farmSiteBoundaryEntitiesSelector } from './farmSiteBoundarySlice';
import { fieldEntitiesSelector } from './fieldSlice';
import { greenhouseEntitiesSelector } from './greenhouseSlice';
import { surfaceWaterEntitiesSelector } from './surfaceWaterSlice';
import { naturalAreaEntitiesSelector } from './naturalAreaSlice';
import { residenceEntitiesSelector } from './residenceSlice';
import { bufferZoneEntitiesSelector } from './bufferZoneSlice';
import { watercourseEntitiesSelector } from './watercourseSlice';
import { fenceEntitiesSelector } from './fenceSlice';
import { gateEntitiesSelector } from './gateSlice';
import { waterValveEntitiesSelector } from './waterValveSlice';
import { soilSampleLocationEntitiesSelector } from './soilSampleLocationSlice';
import { gardenEntitiesSelector } from './gardenSlice';

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
    soilSampleLocationEntitiesSelector,
  ],
  (...args) => {
    return args.reduce(
      (locationEntities, entities) => Object.assign(locationEntities, entities),
      {},
    );
  },
);
