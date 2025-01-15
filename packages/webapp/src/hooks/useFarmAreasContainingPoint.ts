/*
 *  Copyright 2025 LiteFarm.org
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

import { useSelector } from 'react-redux';
import { areaSelector } from '../containers/locationSlice';
import { getLocationsContainingPoint, Point } from '../util/geoUtils';

export const useFarmAreasContainingPoint = (coordinates: Point) => {
  const farmAreas = useSelector(areaSelector);

  // areaSelector returns an object whose keys are the location type
  const flattenedFarmAreas = Object.values(farmAreas).flat();

  return getLocationsContainingPoint(flattenedFarmAreas, coordinates);
};
