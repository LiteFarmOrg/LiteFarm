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

import { useDispatch, useSelector } from 'react-redux';
import { putFarm } from '../../../saga';
import { isAdminSelector, userFarmSelector } from '../../../userFarmSlice';
import { getProcessedFormData } from '../../../hooks/useHookFormPersist/utils';
import PureBasicProfile from '../../../../components/Profile/FarmSettings/PureBasicProfile';
import CardLayout from '../../../../components/Layout/CardLayout';
import RouterTab from '../../../../components/RouterTab';
import { Variant as TabVariants } from '../../../../components/RouterTab/Tab';
import { useFarmSettingsRouterTabs } from '../useFarmSettingsRouterTabs';

const BasicProfile = () => {
  const routerTabs = useFarmSettingsRouterTabs();

  const isAdmin = useSelector(isAdminSelector);
  const userFarm = useSelector(userFarmSelector);
  const dispatch = useDispatch();
  const onSubmit = (data: any) => {
    dispatch(putFarm(getProcessedFormData(data)));
  };

  return (
    <CardLayout>
      <RouterTab tabs={routerTabs} variant={TabVariants.UNDERLINE} />
      <PureBasicProfile isAdmin={isAdmin} userFarm={userFarm} onSubmit={onSubmit} />
    </CardLayout>
  );
};

export default BasicProfile;
