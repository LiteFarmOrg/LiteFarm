import React from 'react';
import styles from './styles.module.scss';
import PropTypes from 'prop-types';
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
  ...props
}) {
  return (
    <div className={styles.cardContainer} style={{ ...classes.container, ...style }}>
      <div className={styles.statusLabel}>
        <StatusLabel status={status} label={label} />
        {[0, 1, 2, 3, 4, 5].includes(score) && <Rating stars={score} />}
      </div>
      <Card
        color={color}
        onClick={onClick}
        style={{
          cursor: onClick ? 'pointer' : 'default',
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
  color: PropTypes.oneOf(['secondary', 'active', 'completed', 'completedActive']),
  style: PropTypes.object,
  status: PropTypes.oneOf(['active', 'planned', 'late', 'completed', 'abandoned', 'disabled']),
  label: PropTypes.string,
  classes: PropTypes.shape({ container: PropTypes.object, card: PropTypes.object }),
  onClick: PropTypes.func,
  score: PropTypes.oneOf([1, 2, 3, 4, 5, 0]),
  children: PropTypes.node,
};
