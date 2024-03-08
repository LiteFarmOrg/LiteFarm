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

import { ReactComponent as MapIcon } from '../assets/images/nav/map.svg';
import { ReactComponent as TasksIcon } from '../assets/images/nav/tasks.svg';
import { ReactComponent as CropsIcon } from '../assets/images/nav/crops.svg';
import { ReactComponent as AnimalsIcon } from '../assets/images/nav/animals.svg';
import { ReactComponent as FinancesIcon } from '../assets/images/nav/finances.svg';
import { ReactComponent as InsightsIcon } from '../assets/images/nav/insights.svg';
import { ReactComponent as DocumentsIcon } from '../assets/images/nav/documents.svg';
import { ReactComponent as FarmSettingsIcon } from '../assets/images/nav/farmSettings.svg';
import { ReactComponent as PeopleIcon } from '../assets/images/nav/people.svg';
import { ReactComponent as CertificationsIcon } from '../assets/images/nav/certifications.svg';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import styles from '../components/Navigation/SideMenu/styles.module.scss';
import {
  ACTUAL_REVENUE_URL,
  ANIMALS_GROUPS_URL,
  ANIMALS_INVENTORY_URL,
  ANIMALS_LOCATION_URL,
  ANIMALS_URL,
  ESTIMATED_REVENUE_URL,
  FINANCES_HOME_URL,
  FINANCES_URL,
  LABOUR_URL,
  OTHER_EXPENSE_URL,
} from '../util/siteMapConstants';

export const useGetMenuItems = () => {
  const { t } = useTranslation();
  const isAdmin = useSelector(isAdminSelector);

  const mainActions = useMemo(() => {
    const list = [
      { label: t('MENU.MAP'), icon: <MapIcon />, path: '/map', key: 'map' },
      { label: t('MENU.TASKS'), icon: <TasksIcon />, path: '/tasks', key: 'tasks' },
      {
        label: t('MENU.CROPS'),
        icon: <CropsIcon className={styles.cropsIcon} />,
        path: '/crop_catalogue',
        key: 'crops',
      },
      {
        label: t('MENU.ANIMALS'),
        icon: <AnimalsIcon />,
        path: ANIMALS_URL,
        key: 'animals',
        subMenu: [
          {
            label: t('MENU.ANIMALS_INVENTORY'),
            path: ANIMALS_INVENTORY_URL,
            key: 'animals_inventory',
          },
          {
            label: t('MENU.ANIMALS_LOCATION'),
            path: ANIMALS_LOCATION_URL,
            key: 'animals_location',
          },
          {
            label: t('MENU.ANIMALS_GROUPS'),
            path: ANIMALS_GROUPS_URL,
            key: 'animals_groups',
          },
        ],
      },
      { label: t('MENU.INSIGHTS'), icon: <InsightsIcon />, path: '/Insights', key: 'insights' },
    ];

    if (isAdmin) {
      list.splice(3, 0, {
        label: t('MENU.FINANCES'),
        icon: <FinancesIcon />,
        path: FINANCES_URL,
        key: 'finances',
        subMenu: [
          {
            label: t('MENU.TRANSACTION_LIST'),
            path: FINANCES_HOME_URL,
            key: 'transactions',
          },
          {
            label: t('MENU.OTHER_EXPENSES'),
            path: OTHER_EXPENSE_URL,
            key: 'other_expense',
          },
          { label: t('MENU.LABOUR_EXPENSES'), path: LABOUR_URL, key: 'labour' },
          {
            label: t('MENU.ACTUAL_REVENUES'),
            path: ACTUAL_REVENUE_URL,
            key: 'actual_revenue',
          },
          {
            label: t('MENU.ESTIMATED_REVENUES'),
            path: ESTIMATED_REVENUE_URL,
            key: 'estimated_revenue',
          },
        ],
      });
      list.push({
        label: t('MENU.DOCUMENTS'),
        icon: <DocumentsIcon />,
        path: '/documents',
        key: 'documents',
      });
    }
    return list;
  }, [isAdmin, t]);

  const adminActions = useMemo(
    () =>
      isAdmin
        ? [
            {
              label: t('MENU.FARM_SETTINGS'),
              icon: <FarmSettingsIcon />,
              path: '/farm',
              key: 'farm',
            },
            { label: t('MENU.PEOPLE'), icon: <PeopleIcon />, path: '/people', key: 'people' },
            {
              label: t('MENU.CERTIFICATIONS'),
              icon: <CertificationsIcon />,
              path: '/certification',
              key: 'certification',
            },
          ]
        : [],
    [isAdmin, t],
  );

  return { mainActions, adminActions };
};
