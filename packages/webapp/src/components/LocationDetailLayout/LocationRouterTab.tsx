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

import { useSelector } from 'react-redux';
import RouterTab from '../RouterTab';
import useLocationRouterTabs from '../../containers/LocationDetails/useLocationRouterTabs';
import { locationByIdSelector } from '../../containers/locationSlice';
import { Variant } from '../RouterTab/Tab';
import { Location } from 'src/types';

export default function LocationRouterTab({ location_id }: { location_id: Location['id'] }) {
  const location = useSelector(locationByIdSelector(location_id));
  const routerTabs = useLocationRouterTabs(location);

  return (
    <RouterTab
      classes={{ container: { margin: '6px 0 26px 0' } }}
      tabs={routerTabs}
      variant={Variant.UNDERLINE}
    />
  );
}
