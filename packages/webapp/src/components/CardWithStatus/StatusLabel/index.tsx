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
});

enum TaskStatus {
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
  sm: boolean;
  children: React.ReactNode;
  props: HTMLAttributes<HTMLDivElement>;
};

export const StatusLabel = ({
  color = TaskStatus.ACTIVE,
  label,
  sm,
  children,
  ...props
}: StatusLabelProps): React.ReactNode => {
  const classes = useStyles();
  return (
    <div
      data-cy="status-label"
      className={clsx(classes.container, classes[color], sm && classes.sm)}
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
    <Link className={styles.link} to={{ pathname: `/task/${taskId}/read_only` }}>
      <StatusLabel {...props}>
        <ExternalLinkIcon />
      </StatusLabel>
    </Link>
  );
};
