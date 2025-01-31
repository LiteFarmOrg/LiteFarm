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

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Tooltip } from '@mui/material';
import { ReactComponent as StatusIndicatorDot } from '../../assets/images/status-indicator-dot.svg';
import styles from './styles.module.scss';
import { Semibold, Main } from '../Typography';

export enum Status {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
}

export enum PillVariant {
  SENSOR = 'SENSOR',
}

export interface StatusIndicatorPillProps {
  status: Status;
  variant?: PillVariant;
  showHoverTooltip?: boolean;
}

const statusTextMapping = {
  [PillVariant.SENSOR]: {
    [Status.ONLINE]: {
      pillText: 'STATUS.ONLINE',
      tooltipText: 'STATUS.SENSOR.ONLINE_TOOLTIP',
    },
    [Status.OFFLINE]: {
      pillText: 'STATUS.OFFLINE',
      tooltipText: 'STATUS.SENSOR.OFFLINE_TOOLTIP',
    },
  },
};

export const StatusIndicatorPill = ({
  status,
  variant = PillVariant.SENSOR,
  showHoverTooltip = true,
}: StatusIndicatorPillProps) => {
  const { t } = useTranslation();

  const isOnline = status === Status.ONLINE;
  const { pillText, tooltipText } = statusTextMapping[variant][status];

  const hoverContent = <Main className={styles.hoverText}>{t(tooltipText)}</Main>;

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

  const statusPill = (
    <div
      className={clsx(
        styles.pill,
        isOnline ? styles.online : styles.offline,
        showHoverTooltip && styles.hover,
      )}
    >
      <StatusIndicatorDot />
      <Semibold className={styles.pillText}>{t(pillText)}</Semibold>
    </div>
  );

  return showHoverTooltip ? (
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
      {statusPill}
    </Tooltip>
  ) : (
    statusPill
  );
};
