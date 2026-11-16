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

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon';
import { point } from '@turf/helpers';
import { userFarmSelector } from '../../userFarmSlice';
import { BC_BOUNDARY } from './bcBoundary';
import type { FarmLocationCodes } from './surveyConfig';
import type { UserFarm } from '../../../types';
import type { Point } from '../../../util/geoUtils';

const isInBC = (gridPoints: Point): boolean =>
  booleanPointInPolygon(point([gridPoints.lng, gridPoints.lat]), BC_BOUNDARY);

export default function useFarmLocationCodes(): FarmLocationCodes {
  const { country_code, grid_points } = useSelector(userFarmSelector) as UserFarm;

  return useMemo(
    () => ({
      countryCode: country_code,
      subdivisionCode: country_code === 'CA' && isInBC(grid_points) ? 'CA-BC' : undefined,
    }),
    [country_code, grid_points.lat, grid_points.lng],
  );
}
