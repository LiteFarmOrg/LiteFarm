import { createSelector } from 'reselect';
import { barnEntitiesSelector, barnsSelector } from './barnSlice';
import { ceremonialEntitiesSelector, ceremonialsSelector } from './ceremonialSlice';
import { farmSiteBoundaryEntitiesSelector } from './farmSiteBoundarySlice';
import { fieldEntitiesSelector, fieldsSelector } from './fieldSlice';
import { greenhouseEntitiesSelector, greenhousesSelector } from './greenhouseSlice';
import { surfaceWaterEntitiesSelector, surfaceWatersSelector } from './surfaceWaterSlice';
import { naturalAreaEntitiesSelector, naturalAreasSelector } from './naturalAreaSlice';
import { residenceEntitiesSelector, residencesSelector } from './residenceSlice';
import { bufferZoneEntitiesSelector, bufferZonesSelector } from './bufferZoneSlice';
import { watercourseEntitiesSelector, watercoursesSelector } from './watercourseSlice';
import { fenceEntitiesSelector } from './fenceSlice';
import { gateEntitiesSelector } from './gateSlice';
import { waterValveEntitiesSelector } from './waterValveSlice';
import { soilSampleLocationEntitiesSelector } from './soilSampleLocationSlice';
import { gardenEntitiesSelector, gardensSelector } from './gardenSlice';

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
