import React from 'react';
import styles from './styles.module.scss';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Card from '../Card';
import { StatusLabel } from './StatusLabel';

import Rating from '../Rating';

export function CardWithStatus({
  status,
  label,
  style,
  classes = {},
  onClick,
  score,
  color,
  children,
  to_sync = false,
  className,
  ...props
}) {
  const hasRating = [0, 1, 2, 3, 4, 5].includes(score);

  return (
    <div className={styles.cardContainer} style={{ ...classes.container, ...style }}>
      <div className={styles.statusLabel}>
        <StatusLabel color={status} label={label} to_sync={to_sync} />
        {hasRating && <Rating stars={score} viewOnly />}
      </div>
      <Card
        color={color}
        onClick={onClick}
        className={className}
        style={{
          cursor: onClick && color !== 'disabled' ? 'pointer' : 'default',
          ...classes.card,
        }}
        {...props}
      >
        {children}
      </Card>
    </div>
  );
}

CardWithStatus.propTypes = {
  color: PropTypes.oneOf(['secondary', 'active', 'completed', 'completedActive', 'disabled']),
  style: PropTypes.object,
  status: PropTypes.oneOf(['active', 'planned', 'late', 'completed', 'abandoned', 'disabled']),
  label: PropTypes.string,
  classes: PropTypes.shape({ container: PropTypes.object, card: PropTypes.object }),
  onClick: PropTypes.func,
  score: PropTypes.oneOf([1, 2, 3, 4, 5, 0]),
  children: PropTypes.node,
  to_sync: PropTypes.bool,
  className: PropTypes.string,
};
