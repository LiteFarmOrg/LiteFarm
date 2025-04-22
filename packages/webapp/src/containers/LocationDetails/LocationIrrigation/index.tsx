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
import { locationByIdSelector } from '../../locationSlice';
import PureLocationIrrigation from '../../../components/LocationIrrigation';
import useIrrigationPrescriptions from './useIrrigationPrescriptions';
import useLocationRouterTabs from '../useLocationRouterTabs';
import { useEffect } from 'react';
import { match } from 'react-router-dom';
import { History } from 'history';

function LocationIrrigation({
  history,
  match,
}: {
  history: History;
  match: match<{ location_id: string }>;
}) {
  const { location_id } = match.params;
  const location = useSelector(locationByIdSelector(location_id));

  useEffect(() => {
    if (location === undefined) {
      history.replace('/unknown_record');
    }
  }, [location]);

  const irrigationPrescriptions = useIrrigationPrescriptions(location);
  const routerTabs = useLocationRouterTabs(location, match);

  return (
    location && (
      <PureLocationIrrigation
        irrigationPrescriptions={irrigationPrescriptions}
        history={history}
        match={match}
        location={location}
        routerTabs={routerTabs}
      />
    )
  );
}

export default LocationIrrigation;
