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

import { ReactNode } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useTheme } from '@mui/styles';
import { useMediaQuery } from '@mui/material';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { Title } from '../Typography';
import { SummaryTiles } from './SummaryTiles';
import { KPITile } from './KPITile';

export interface KPI {
  label: string;
  count: number;
  icon: ReactNode;
  onClick: () => void;
}

interface PureKPIDashboardProps {
  KPIs: KPI[];
  dashboardTitle: string;
  categoryLabel: string;
}

export const PureKPIDashboard = ({
  KPIs,
  dashboardTitle,
  categoryLabel,
}: PureKPIDashboardProps) => {
  const { t } = useTranslation();

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const totalCount = KPIs.reduce((sum, element) => sum + element.count, 0);
  const categoryCount = KPIs.length;

  return (
    <div className={styles.container}>
      <Title className={styles.title}>{dashboardTitle}</Title>
      <div className={styles.mainContent}>
        <SummaryTiles
          totalCount={totalCount}
          categoryCount={categoryCount}
          categoryLabel={categoryLabel}
        />
        <div className={styles.gridContainer}>
          {KPIs.map((item, index) => (
            <div key={index} className={clsx(styles.gridItem, isDesktop ? styles.fixed : '')}>
              <KPITile key={index} {...item} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// export const PureKPIDashboard = ({
//   KPIs,
//   dashboardTitle,
//   categoryLabel,
// }: PureKPIDashboardProps) => {
//   const { t } = useTranslation();

//   const totalCount = KPIs.reduce((sum, element) => {
//     return sum + element.count;
//   }, 0);

//   const categoryCount = KPIs.length;

//   return (
//     <div className={styles.container}>
//       <Title className={styles.title}>{dashboardTitle}</Title>
//       <div className={styles.tileContainer}>
//         <div className={styles.summaryTiles}>
//           <div className={styles.totalCount}>
//             <Main className={styles.countLabel}>total</Main>
//             <Main className={styles.countText}>{totalCount}</Main>
//           </div>
//           <div className={styles.typeCount}>
//             <Main className={styles.countLabel}>{categoryLabel}</Main>
//             <Main className={styles.countText}>{categoryCount}</Main>
//           </div>
//         </div>
//         <div className={styles.KPIcontainer}>
//           {KPIs.map((item, index) => (
//             <TextButton className={styles.tile} key={index} onClick={item.onClick}>
//               <div className={styles.icon}>{item.icon}</div>
//               <div className={styles.tileText}>
//                 <Main className={styles.tileLabel}>{item.label}</Main>
//                 <Main className={styles.tileCountLabel}>{item.count}</Main>
//               </div>
//             </TextButton>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };
