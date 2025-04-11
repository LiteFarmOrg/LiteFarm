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

import { getPointLocationsWithinPolygon } from '../../../util/geoUtils';
import { useGetIrrigationPrescriptionsQuery } from '../../../store/api/apiSlice';
import { Location } from '../../../types';
import { IrrigationPrescription } from '../../../store/api/types';

const ONE_HOUR_IN_MS = 1000 * 60 * 60;
const MOCK_DATA: IrrigationPrescription[] = [
  {
    id: 'uuid_maybe_001',
    some_location_id: '001',
    prescription_date: new Date(Date.now() - ONE_HOUR_IN_MS),
    partner_id: 1,
  },
  {
    id: 'uuid_maybe_002',
    some_location_id: '002',
    prescription_date: new Date(Date.now() - ONE_HOUR_IN_MS),
    partner_id: 1,
  },
];

export default function useIrrigationPrescriptions(location?: Location) {
  const { data = [], error, isLoading } = useGetIrrigationPrescriptionsQuery();

  // TODO: remove once mocked data is no longer needed
  let irrigationPrescriptions;
  if (error) {
    irrigationPrescriptions = MOCK_DATA;
  } else {
    irrigationPrescriptions = data;
  }

  let filteredIrrigationPrescriptions: IrrigationPrescription[] = [];
  if (location && location.grid_points && !isLoading) {
    //fieldIrrigationPlans = getPointLocationsWithinPolygon(irrigationPlans, location.grid_points);
    filteredIrrigationPrescriptions = irrigationPrescriptions.filter(
      (plan: IrrigationPrescription) => plan.some_location_id === location.location_id,
    );
  }

  return filteredIrrigationPrescriptions;
}
