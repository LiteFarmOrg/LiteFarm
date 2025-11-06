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
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from '../../../Snackbar/snackbarSlice';
import PureFarmAddons from '../../../../components/Profile/FarmSettings/Addons';
import { useGetFarmAddonQuery, useDeleteFarmAddonMutation } from '../../../../store/api/apiSlice';
import { PARTNERS } from '../../../AddSensors/constants';
import CardLayout from '../../../../components/Layout/CardLayout';
import RouterTab from '../../../../components/RouterTab';
import { Variant as TabVariants } from '../../../../components/RouterTab/Tab';
import { useFarmSettingsRouterTabs } from '../useFarmSettingsRouterTabs';

const FarmAddons = () => {
  const history = useHistory();
  const routerTabs = useFarmSettingsRouterTabs();

  const { data: esciDataArray = [] } = useGetFarmAddonQuery(
    `?addon_partner_id=${PARTNERS.ESCI.id}`,
  );

  const hasActiveConnection = {
    esci: esciDataArray.length > 0,
  };

  const [esciData] = esciDataArray;

  const organizationIds = {
    esci: esciData?.org_uuid,
  };

  const [deleteFarmAddon] = useDeleteFarmAddonMutation();

  const dispatch = useDispatch();
  const { t } = useTranslation(['message']);

  const handleDisconnect = async (addonId: number) => {
    try {
      await deleteFarmAddon(addonId).unwrap();
      dispatch(enqueueSuccessSnackbar(t('FARM_ADDON.SUCCESS_DISCONNECT_ADDON')));
    } catch (error) {
      dispatch(enqueueErrorSnackbar(t('FARM_ADDON.FAILED_DISCONNECT_ADDON')));
    }
  };

  const onDisconnect = {
    esci: () => handleDisconnect(esciData?.id),
  };

  return (
    <CardLayout>
      <RouterTab tabs={routerTabs} variant={TabVariants.UNDERLINE} history={history} />
      <PureFarmAddons
        hasActiveConnection={hasActiveConnection}
        organizationIds={organizationIds}
        onDisconnect={onDisconnect}
      />
    </CardLayout>
  );
};

export default FarmAddons;
