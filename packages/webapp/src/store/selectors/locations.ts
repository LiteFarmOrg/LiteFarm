import { createSelector } from 'reselect';
import { locationApi } from '../api/locationApi';
import { clean, flatten } from '../../hooks/location/useLocations';
import { InternalMapLocationType } from '../api/types';

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

// Note: This will not be able to be removed in favour of hooks until management plans are migrated to rtk-query
export const cropLocationEntitiesSelector = ({ deleted } = { deleted: false }) =>
  createSelector([locationApi.endpoints.getLocations.select()], (locationsResult) => {
    const activeLocations = deleted
      ? locationsResult.data || []
      : (locationsResult.data || []).filter(({ deleted }) => deleted === false);
    const cleanedLocations = activeLocations.map(clean);
    const flattenedLocations = cleanedLocations.map(flatten);
    const filteredLocations = flattenedLocations.filter(({ type }) =>
      [
        InternalMapLocationType.FIELD,
        InternalMapLocationType.GARDEN,
        InternalMapLocationType.GREENHOUSE,
        InternalMapLocationType.BUFFER_ZONE,
      ].includes(type),
    );
    const locationEntities = filteredLocations.reduce(
      (locationEntities, filteredLocation) =>
        Object.assign(locationEntities, { [filteredLocation.location_id]: filteredLocation }),
      {},
    );
    return locationEntities;
  });

// This will not be able to be removed until tasks are migrated to rtk-query
export const locationEntitiesSelector = ({ deleted } = { deleted: false }) =>
  createSelector([locationApi.endpoints.getLocations.select()], (locationsResult) => {
    const activeLocations = deleted
      ? locationsResult.data || []
      : (locationsResult.data || []).filter(({ deleted }) => deleted === false);
    const cleanedLocations = activeLocations.map(clean);
    const flattenedLocations = cleanedLocations.map(flatten);
    const locationEntities = flattenedLocations.reduce(
      (locationEntities, flattenedLocation) =>
        Object.assign(locationEntities, { [flattenedLocation.location_id]: flattenedLocation }),
      {},
    );
    return locationEntities;
  });
