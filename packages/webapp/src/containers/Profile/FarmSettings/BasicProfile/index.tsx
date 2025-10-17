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
import { useDispatch, useSelector } from 'react-redux';
import { putFarm } from '../../../saga';
import { isAdminSelector, userFarmSelector } from '../../../userFarmSlice';
import { getProcessedFormData } from '../../../hooks/useHookFormPersist/utils';
import PureBasicProfile from '../../../../components/Profile/FarmSettings/PureBasicProfile';
import CardLayout from '../../../../components/Layout/CardLayout';
import Tab, { Variant as TabVariants } from '../../../../components/RouterTab/Tab';
import { useFarmSettingsRouterTabs } from '../useFarmSettingsRouterTabs';

const BasicProfile = () => {
  const history = useHistory();
  const match = useRouteMatch();
  const routerTabs = useFarmSettingsRouterTabs();

  const isAdmin = useSelector(isAdminSelector);
  const userFarm = useSelector(userFarmSelector);
  const dispatch = useDispatch();
  /* @ts-expect-error not typing this for now */
  const onSubmit = (data) => {
    /* @ts-expect-error not typing this for now */
    dispatch(putFarm(getProcessedFormData(data)));
  };

  return (
    <CardLayout>
      <Tab
        tabs={routerTabs}
        variant={TabVariants.UNDERLINE}
        isSelected={(tab) => tab.path === match.url}
        onClick={(tab) => history.push(tab.path)}
      />
      <PureBasicProfile
        isAdmin={isAdmin}
        userFarm={userFarm}
        onSubmit={onSubmit}
        history={history}
      />
    </CardLayout>
  );
};

export default BasicProfile;
