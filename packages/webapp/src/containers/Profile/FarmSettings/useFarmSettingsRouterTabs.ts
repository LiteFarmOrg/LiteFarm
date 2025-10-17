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

import { useRouteMatch } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFarmSettingsContext } from './FarmSettingsContext';

export const useFarmSettingsRouterTabs = () => {
  const match = useRouteMatch();
  const { t } = useTranslation();

  const { showAddonsTab } = useFarmSettingsContext();

  const TABS = ['basic_profile', 'market_directory', 'addons'];

  const currentTab = TABS.find((tab) => match.path.includes(`/${tab}`));

  const routerTabs = [
    {
      label: t('FARM_SETTINGS.TABS.BASIC_PROFILE'),
      path: match.url.replace(`/${currentTab}`, '/basic_profile'),
    },
    {
      label: t('FARM_SETTINGS.TABS.MARKET_DIRECTORY'),
      path: match.url.replace(`/${currentTab}`, '/market_directory'),
    },
  ];

  if (showAddonsTab) {
    routerTabs.push({
      label: t('FARM_SETTINGS.TABS.ADDONS'),
      path: match.url.replace(`/${currentTab}`, '/addons'),
    });
  }

  return routerTabs;
};
