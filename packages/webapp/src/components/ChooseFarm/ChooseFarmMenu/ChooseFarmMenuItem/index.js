import React from 'react';
import styles from './chooseFarmMenuItem.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import Card from '../../../Card';

const ChooseFarmMenuItem = ({
  color = 'secondary',
  ownerName,
  farmName = 'Farm name',
  address,
  coordinate,
  style,
  onClick,
  ...props
}) => {
  return (
    <Card
      color={color}
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'row',
        minHeight: '63px',
        justifyContent: 'space-between',
        cursor: color === 'secondary' ? 'pointer' : 'default',
        ...style,
      }}
      {...props}
    >
      <div className={styles.leftColumn}>
        <h5 className={clsx(styles.farmName, color === 'active' && styles.active)}>{farmName}</h5>
        {ownerName && <p className={clsx(styles.address, styles[color])}>{ownerName}</p>}
      </div>
      <div className={styles.rightColumn}>
        {address.map((row) => (
          <p className={clsx(styles.address, styles[color])}>{row}</p>
        ))}
      </div>
    </Card>
  );
};

ChooseFarmMenuItem.propTypes = {
  color: PropTypes.oneOf(['secondary', 'active', 'disabled']),
  onClick: PropTypes.func,
  ownerName: PropTypes.string,
  farmName: PropTypes.string,
  address: PropTypes.arrayOf(PropTypes.string),
  style: PropTypes.object,
};

export default ChooseFarmMenuItem;
