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

import { useEffect } from 'react';
import { useHistory, useNavigate, useRouteMatch } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { locationByIdSelector } from '../../locationSlice';
import PureLocationFieldTechnology from '../../../components/LocationFieldTechnology';
import useFieldTechnology from './useFieldTechnology';
import useLocationRouterTabs from '../useLocationRouterTabs';

function LocationFieldTechnology() {
  const history = useHistory();
  const navigate = useNavigate();
  const match = useRouteMatch();
  const { location_id } = match.params;
  const location = useSelector(locationByIdSelector(location_id));

  useEffect(() => {
    if (location === undefined) {
      navigate('/unknown_record', { replace: true });
    }
  }, [location]);

  const fieldTechnology = useFieldTechnology(location);
  const routerTabs = useLocationRouterTabs(location);

  return (
    location && (
      <PureLocationFieldTechnology
        fieldTechnology={fieldTechnology}
        history={history}
        match={match}
        location={location}
        routerTabs={routerTabs}
      />
    )
  );
}

export default LocationFieldTechnology;
