/*
 *  Copyright 2023 LiteFarm.org
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

import i18n from '../../locales/i18n';
import { ReactComponent as MapIcon } from '../../assets/images/nav/map.svg';
import { ReactComponent as TasksIcon } from '../../assets/images/nav/tasks.svg';
import { ReactComponent as CropsIcon } from '../../assets/images/nav/crops.svg';
import { ReactComponent as FinancesIcon } from '../../assets/images/nav/finances.svg';
import { ReactComponent as InsightsIcon } from '../../assets/images/nav/insights.svg';
import { ReactComponent as DocumentsIcon } from '../../assets/images/nav/documents.svg';
import { ReactComponent as FarmSettingsIcon } from '../../assets/images/nav/farmSettings.svg';
import { ReactComponent as PeopleIcon } from '../../assets/images/nav/people.svg';
import { ReactComponent as CertificationsIcon } from '../../assets/images/nav/certifications.svg';

export const getMenuList = (isAdmin) => {
  const list = [
    { label: i18n.t('MENU.MAP'), icon: <MapIcon />, path: '/map', key: 'map' },
    { label: i18n.t('MENU.TASKS'), icon: <TasksIcon />, path: '/tasks', key: 'tasks' },
    {
      label: i18n.t('MENU.CROPS'),
      icon: <CropsIcon />,
      path: '/crop_catalogue',
      key: 'crops',
    },
    { label: i18n.t('MENU.INSIGHTS'), icon: <InsightsIcon />, path: '/Insights', key: 'insights' },
  ];

  if (isAdmin) {
    list.splice(3, 0, {
      label: i18n.t('MENU.FINANCES'),
      icon: <FinancesIcon />,
      path: '/finances',
      subMenu: [
        { label: i18n.t('MENU.TRANSACTION_LIST'), path: '/finances/transactions' },
        { label: i18n.t('MENU.OTHER_EXPENSES'), path: '/finances/other_expense' },
        { label: i18n.t('MENU.LABOUR_EXPENSES'), path: '/finances/labour' },
        { label: i18n.t('MENU.ACTUAL_REVENUES'), path: '/finances/actual_revenue' },
        { label: i18n.t('MENU.ESTIMATED_REVENUES'), path: '/finances/estimated_revenue' },
      ],
      key: 'finances',
    });
    list.push({
      label: i18n.t('MENU.DOCUMENTS'),
      icon: <DocumentsIcon />,
      path: '/documents',
      key: 'documents',
    });
  }
  return list;
};

export const getAdministratorActionsList = () => [
  { label: i18n.t('MENU.FARM_SETTINGS'), icon: <FarmSettingsIcon />, path: '/farm' },
  { label: i18n.t('MENU.PEOPLE'), icon: <PeopleIcon />, path: '/people' },
  { label: i18n.t('MENU.CERTIFICATIONS'), icon: <CertificationsIcon />, path: '/certification' },
];
