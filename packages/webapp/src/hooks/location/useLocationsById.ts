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

import { FlattenedInternalMapLocation, UseLocationsReturn } from './types';
import useLocations from './useLocations';

// Function overrides for correct return type inference
function useLocationsById<T extends FlattenedInternalMapLocation>(
  locationIds?: T['location_id'],
): UseLocationsReturn<T | undefined>;

function useLocationsById<T extends FlattenedInternalMapLocation>(
  locationIds?: T['location_id'][],
): UseLocationsReturn<T[] | undefined>;

function useLocationsById(
  locationIds?:
    | FlattenedInternalMapLocation['location_id'][]
    | FlattenedInternalMapLocation['location_id'],
): UseLocationsReturn<FlattenedInternalMapLocation[] | FlattenedInternalMapLocation | undefined> {
  const { locations, isLoading } = useLocations();

  if (isLoading || !locations || !locationIds) {
    return { locations, isLoading };
  }

  const filteredLocations = locations.filter(({ location_id }) =>
    Array.isArray(locationIds) ? locationIds.includes(location_id) : location_id === locationIds,
  );

  return {
    locations: Array.isArray(locationIds) ? filteredLocations : filteredLocations?.[0],
    isLoading,
  };
}

export default useLocationsById;
