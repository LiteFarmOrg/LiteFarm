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
import { Tooltip } from '@mui/material';
import styles from './styles.module.scss';
import { Semibold, Main } from '../Typography';

export interface HoverPillProps {
  items: string[];
}

export const HoverPill = ({ items }: HoverPillProps) => {
  const { t } = useTranslation();

  const hoverContent = (
    <>
      {items.map((item, index) => (
        <Main key={index} className={styles.detailText}>
          {item}
        </Main>
      ))}
    </>
  );

  return (
    <Tooltip
      title={hoverContent}
      placement="bottom-end"
      classes={{
        tooltip: styles.hoverDetails,
      }}
      // https://mui.com/material-ui/react-tooltip/#distance-from-anchor
      PopperProps={{
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, -8],
            },
          },
        ],
      }}
    >
      <div className={styles.pill}>
        <Semibold className={styles.pillText}>
          {t('HOVERPILL.PLUS_OTHERS_COUNT', { count: items.length })}
        </Semibold>
      </div>
    </Tooltip>
  );
};
