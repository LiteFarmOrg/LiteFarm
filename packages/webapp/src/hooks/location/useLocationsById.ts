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
  locationIds: T['location_id'][],
): UseLocationsReturn<T[] | undefined>;

// Implementation stays the same
function useLocationsById(
  locationIds: FlattenedInternalMapLocation['location_id'][],
): UseLocationsReturn<FlattenedInternalMapLocation[] | undefined> {
  const { locations, isLoading } = useLocations();

  if (isLoading || !locations) {
    return { locations, isLoading };
  }

  const filteredLocations = locations.filter(({ location_id }) =>
    locationIds.includes(location_id),
  );

  return { locations: filteredLocations, isLoading };
}

export default useLocationsById;
