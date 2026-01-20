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
import { ReactComponent as InventoryIcon } from '../assets/images/nav/package.svg';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import {
  ACTUAL_REVENUE_URL,
  ANIMALS_INVENTORY_URL,
  ESTIMATED_REVENUE_URL,
  FINANCES_HOME_URL,
  FINANCES_URL,
  LABOUR_URL,
  OTHER_EXPENSE_URL,
  PRODUCT_INVENTORY_URL,
} from '../util/siteMapConstants';
import Badge from '../components/Badge';

const MENU_KEYS = {
  MAP: 'map',
  TASKS: 'tasks',
  CROPS: 'crops',
  ANIMALS: 'animals',
  FINANCES: 'finances',
  TRANSACTIONS: 'transactions',
  OTHER_EXPENSE: 'other_expense',
  LABOUR: 'labour',
  ACTUAL_REVENUE: 'actual_revenue',
  ESTIMATED_REVENUE: 'estimated_revenue',
  INSIGHTS: 'insights',
  DOCUMENTS: 'documents',
  INVENTORY: 'inventory',
  FARM: 'farm',
  PEOPLE: 'people',
  CERTIFICATION: 'certification',
};

export const offlineViewOnlyPageKeys = new Set([
  MENU_KEYS.MAP,
  MENU_KEYS.CROPS,
  MENU_KEYS.ANIMALS,
  MENU_KEYS.FINANCES,
  MENU_KEYS.TRANSACTIONS,
  MENU_KEYS.INVENTORY,
]);

export const offlineDisabledPageKeys = new Set([
  MENU_KEYS.OTHER_EXPENSE,
  MENU_KEYS.LABOUR,
  MENU_KEYS.ACTUAL_REVENUE,
  MENU_KEYS.ESTIMATED_REVENUE,
  MENU_KEYS.INSIGHTS,
  MENU_KEYS.DOCUMENTS,
  MENU_KEYS.FARM,
  MENU_KEYS.PEOPLE,
  MENU_KEYS.CERTIFICATION,
]);

export const useGetMenuItems = () => {
  const { t } = useTranslation();
  const isAdmin = useSelector(isAdminSelector);

  const mainActions = useMemo(() => {
    const list = [
      { label: t('MENU.MAP'), icon: <MapIcon />, path: '/map', key: MENU_KEYS.MAP },
      { label: t('MENU.TASKS'), icon: <TasksIcon />, path: '/tasks', key: MENU_KEYS.TASKS },
      {
        label: t('MENU.CROPS'),
        icon: <CropsIcon />,
        path: '/crop_catalogue',
        key: MENU_KEYS.CROPS,
      },
      {
        label: t('MENU.ANIMALS'),
        icon: <AnimalsIcon />,
        path: ANIMALS_INVENTORY_URL,
        key: MENU_KEYS.ANIMALS,
        badge: <Badge isMenuItem={true} title={t('BADGE.BETA.TITLE')} showIcon={false} />,
      },
      {
        label: t('MENU.INSIGHTS'),
        icon: <InsightsIcon />,
        path: '/Insights',
        key: MENU_KEYS.INSIGHTS,
      },
    ];

    if (isAdmin) {
      list.splice(3, 0, {
        label: t('MENU.FINANCES'),
        icon: <FinancesIcon />,
        path: FINANCES_URL,
        key: MENU_KEYS.FINANCES,
        subMenu: [
          {
            label: t('MENU.TRANSACTION_LIST'),
            path: FINANCES_HOME_URL,
            key: MENU_KEYS.TRANSACTIONS,
          },
          {
            label: t('MENU.OTHER_EXPENSES'),
            path: OTHER_EXPENSE_URL,
            key: MENU_KEYS.OTHER_EXPENSE,
          },
          { label: t('MENU.LABOUR_EXPENSES'), path: LABOUR_URL, key: MENU_KEYS.LABOUR },
          {
            label: t('MENU.ACTUAL_REVENUES'),
            path: ACTUAL_REVENUE_URL,
            key: MENU_KEYS.ACTUAL_REVENUE,
          },
          {
            label: t('MENU.ESTIMATED_REVENUES'),
            path: ESTIMATED_REVENUE_URL,
            key: MENU_KEYS.ESTIMATED_REVENUE,
          },
        ],
      });
      list.push({
        label: t('MENU.DOCUMENTS'),
        icon: <DocumentsIcon />,
        path: '/documents',
        key: MENU_KEYS.DOCUMENTS,
      });
    }
    list.push({
      label: t('MENU.INVENTORY'),
      icon: <InventoryIcon />,
      path: PRODUCT_INVENTORY_URL,
      key: MENU_KEYS.INVENTORY,
      badge: <Badge isMenuItem={true} title={t('BADGE.BETA.TITLE')} showIcon={false} />,
    });
    return list;
  }, [isAdmin, t]);

  const adminActions = useMemo(
    () =>
      isAdmin
        ? [
            {
              label: t('MENU.FARM_SETTINGS'),
              icon: <FarmSettingsIcon />,
              path: '/farm_settings/',
              key: MENU_KEYS.FARM,
            },
            {
              label: t('MENU.PEOPLE'),
              icon: <PeopleIcon />,
              path: '/people',
              key: MENU_KEYS.PEOPLE,
            },
            {
              label: t('MENU.CERTIFICATIONS'),
              icon: <CertificationsIcon />,
              path: '/certification',
              key: MENU_KEYS.CERTIFICATION,
            },
          ]
        : [],
    [isAdmin, t],
  );

  return { mainActions, adminActions };
};
