/*
 *  Copyright 2024 LiteFarm.org
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
import { useNavigate } from 'react-router-dom';
import Tab, { Variant as TabVariants } from '../../../components/RouterTab/Tab';
import styles from './styles.module.scss';

// TODO: Most likely to be scoped after movement tasks. It is not part of this user story.
// @ts-ignore
const AnimalTasks = () => {
  let navigate = useNavigate();
  const { t } = useTranslation();

  const routerTabs = [
    {
      label: t('ANIMAL.TABS.BASIC_INFO'),
      path: location.pathname.replace('/tasks', ''),
    },
    {
      label: t('ANIMAL.TABS.TASKS'),
      path: location.pathname,
    },
  ];

  return (
    <div className={styles.container}>
      <div>
        {/* TODO: LF-4381 Header component */}
        <h1>LF-4381 Header component</h1>
      </div>
      <Tab
        tabs={routerTabs}
        variant={TabVariants.UNDERLINE}
        isSelected={(tab) => tab.path === location.pathname}
        onClick={(tab) => navigate(tab.path)}
      />
      <div>AnimalTasks</div>
    </div>
  );
};

export default AnimalTasks;
