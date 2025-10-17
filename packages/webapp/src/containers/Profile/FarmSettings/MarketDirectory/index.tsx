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

import { useHistory, useRouteMatch } from 'react-router-dom';
import CardLayout from '../../../../components/Layout/CardLayout';
import Tab, { Variant as TabVariants } from '../../../../components/RouterTab/Tab';
import { useFarmSettingsRouterTabs } from '../useFarmSettingsRouterTabs';

const MarketDirectory = () => {
  const history = useHistory();
  const match = useRouteMatch();

  const routerTabs = useFarmSettingsRouterTabs();

  return (
    <CardLayout>
      <Tab
        tabs={routerTabs}
        variant={TabVariants.UNDERLINE}
        isSelected={(tab) => tab.path === match.url}
        onClick={(tab) => history.push(tab.path)}
      />
      <h3>
        <i>Coming soon!</i>
      </h3>
    </CardLayout>
  );
};

export default MarketDirectory;
