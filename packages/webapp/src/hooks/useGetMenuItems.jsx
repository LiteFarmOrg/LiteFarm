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

export const useGetMenuItems = () => {
  const { t } = useTranslation();
  const isAdmin = useSelector(isAdminSelector);

  const mainActions = useMemo(() => {
    const list = [
      { label: t('MENU.MAP'), icon: <MapIcon />, path: '/map' },
      { label: t('MENU.TASKS'), icon: <TasksIcon />, path: '/tasks' },
      {
        label: t('MENU.CROPS'),
        icon: <CropsIcon className={styles.cropsIcon} />,
        path: '/crop_catalogue',
      },
      { label: t('MENU.INSIGHTS'), icon: <InsightsIcon />, path: '/Insights' },
    ];

    if (isAdmin) {
      list.splice(3, 0, {
        label: t('MENU.FINANCES'),
        icon: <FinancesIcon />,
        path: '/finances',
        subMenu: [
          { label: t('MENU.TRANSACTION_LIST'), path: '/finances/transactions' },
          { label: t('MENU.OTHER_EXPENSES'), path: '/finances/other_expense' },
          { label: t('MENU.LABOUR_EXPENSES'), path: '/finances/labour' },
          { label: t('MENU.ACTUAL_REVENUES'), path: '/finances/actual_revenue' },
          { label: t('MENU.ESTIMATED_REVENUES'), path: '/finances/estimated_revenue' },
        ],
      });
      list.push({ label: t('MENU.DOCUMENTS'), icon: <DocumentsIcon />, path: '/documents' });
    }
    return list;
  }, [isAdmin, t]);

  const adminActions = useMemo(
    () => [
      { label: t('MENU.FARM_SETTINGS'), icon: <FarmSettingsIcon />, path: '/farm' },
      { label: t('MENU.PEOPLE'), icon: <PeopleIcon />, path: '/people' },
      { label: t('MENU.CERTIFICATIONS'), icon: <CertificationsIcon />, path: '/certification' },
    ],
    [t],
  );

  return { mainActions, adminActions };
};
