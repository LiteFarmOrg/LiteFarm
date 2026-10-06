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

import { useTranslation } from 'react-i18next';
import { useFarmSettingsContext } from './FarmSettingsContext';

export const useFarmSettingsRouterTabs = () => {
  const { t } = useTranslation();

  const { showAddonsTab } = useFarmSettingsContext();

  const routerTabs = [
    {
      label: t('FARM_SETTINGS.TABS.BASIC_PROFILE'),
      path: '/farm_settings/basic_profile',
    },
    {
      label: t('FARM_SETTINGS.TABS.MARKET_DIRECTORY'),
      path: '/farm_settings/market_directory',
    },
  ];

  if (showAddonsTab) {
    routerTabs.push({
      label: t('FARM_SETTINGS.TABS.ADDONS'),
      path: '/farm_settings/addons',
    });
  }

  return routerTabs;
};
