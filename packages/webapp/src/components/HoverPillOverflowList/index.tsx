/*
 *  Copyright 2024, 2025 LiteFarm.org
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

export interface HoverPillOverflowListProps {
  items: string[];
  noneText?: string;
}

export const HoverPillOverflowList = ({ items, noneText = '' }: HoverPillOverflowListProps) => {
  const { t } = useTranslation();

  if (items.length === 0) {
    return <Main className={styles.itemText}>{noneText}</Main>;
  }

  const hoverContent = (
    <>
      {items.slice(1).map((item, index) => (
        <Main key={index} className={styles.detailText}>
          {item}
        </Main>
      ))}
    </>
  );

  // https://mui.com/material-ui/react-tooltip/#distance-from-anchor
  const PopperProps = {
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 4],
        },
      },
    ],
  };

  return (
    <div className={styles.container}>
      <Main className={styles.itemText}>{items[0]}</Main>
      {items.length > 1 && (
        <Tooltip
          title={hoverContent}
          placement="bottom-end"
          classes={{
            tooltip: styles.hoverDetails,
          }}
          PopperProps={PopperProps}
          enterTouchDelay={0}
          leaveTouchDelay={900000}
        >
          <div className={styles.pill}>
            <Semibold className={styles.pillText}>
              {t('HOVERPILL.PLUS_OTHERS_COUNT', { count: items.length - 1 })}
            </Semibold>
          </div>
        </Tooltip>
      )}
    </div>
  );
};
