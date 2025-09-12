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
import { useHistory, useParams } from 'react-router-dom';
import { useTheme } from '@mui/styles';
import { useMediaQuery } from '@mui/material';

function LocationIrrigation() {
  const history = useHistory();
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down('md'));

  const { location_id } = useParams<{ location_id: string }>();
  const location = useSelector(locationByIdSelector(location_id));

  useEffect(() => {
    if (location === undefined) {
      history.replace('/unknown_record');
    }
  }, [location]);

  const irrigationPrescriptions = useIrrigationPrescriptions(location);
  const routerTabs = useLocationRouterTabs(location);

  return (
    location && (
      <PureLocationIrrigation
        irrigationPrescriptions={irrigationPrescriptions}
        history={history}
        location={location}
        routerTabs={routerTabs}
        isCompact={isCompact}
      />
    )
  );
}

export default LocationIrrigation;
