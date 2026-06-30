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

import { makeStyles } from '@mui/styles';
import { colors } from '../../../assets/theme';
import { Link } from 'react-router-dom';
import { ReactComponent as ExternalLinkIcon } from '../../../assets/images/icon_external_link.svg';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { HTMLAttributes } from 'react';

const useStyles = makeStyles({
  container: {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '4px 8px',
    height: '24px',
    fontFamily: '"Open Sans", "SansSerif", serif, "Manjari"',
    color: 'white',
    fontWeight: 700,
    borderRadius: '4px',
  },
  active: {
    backgroundColor: colors.brightGreen700,
  },
  planned: {
    backgroundColor: colors.brown700,
  },
  completed: {
    backgroundColor: colors.teal900,
  },
  late: {
    backgroundColor: colors.red700,
  },
  abandoned: {
    backgroundColor: colors.grey600,
  },
  disabled: {
    backgroundColor: colors.grey200,
    color: colors.grey600,
  },
  forReview: {
    backgroundColor: colors.brightGreen700,
  },
  sm: {
    height: '16px',
    fontSize: '11px',
  },
  toSyncCompleted: {
    margin: '8px',
    border: '1px dashed var(--Colors-Primary-Primary-teal-500)',
    background: 'var(--Colors-Primary-Primary-teal-100)',
    color: 'var(--Colors-Primary-Primary-teal-500)',
  },
  toSyncAbandoned: {
    margin: '8px',
    border: '1px dashed var(--Colors-Neutral-Neutral-400)',
    background: 'var(--Colors-Neutral-Neutral-100)',
    color: 'var(--Colors-Neutral-Neutral-700)',
  },
});

export enum TaskStatus {
  ACTIVE = 'active',
  PLANNED = 'planned',
  LATE = 'late',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
  DISABLED = 'disabled',
}

type StatusLabelProps = {
  color: TaskStatus;
  label: string;
  sm?: boolean;
  to_sync?: boolean;
  children?: React.ReactNode;
  props?: HTMLAttributes<HTMLDivElement>;
};

export const StatusLabel = ({
  color = TaskStatus.ACTIVE,
  label,
  sm,
  to_sync = false,
  children,
  ...props
}: StatusLabelProps): React.ReactNode => {
  const classes = useStyles();

  const getStatusClass = () => {
    if (to_sync && color === TaskStatus.COMPLETED) {
      return classes.toSyncCompleted;
    }
    if (to_sync && color === TaskStatus.ABANDONED) {
      return classes.toSyncAbandoned;
    }
    return classes[color];
  };

  return (
    <div
      data-cy="status-label"
      className={clsx(classes.container, getStatusClass(), sm && classes.sm)}
      {...props}
    >
      {label}
      {children}
    </div>
  );
};

export interface StatusLabelLinkProps extends StatusLabelProps {
  taskId: number;
}

export const StatusLabelLink = ({ taskId, ...props }: StatusLabelLinkProps) => {
  return (
    <Link className={styles.link} to={{ pathname: `/tasks/${taskId}/read_only` }}>
      <StatusLabel {...props}>
        <ExternalLinkIcon />
      </StatusLabel>
    </Link>
  );
};
