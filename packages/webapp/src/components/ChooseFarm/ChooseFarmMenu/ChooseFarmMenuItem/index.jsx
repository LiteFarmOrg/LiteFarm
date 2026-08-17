import React from 'react';
import styles from './chooseFarmMenuItem.module.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import Card from '../../../Card';
import EmailIcon from '../../../../assets/images/chooseFarm/emailIcon.svg?react';

const ChooseFarmMenuItem = ({
  color = 'secondary',
  ownerName,
  farmName = 'Farm name',
  address,
  style,
  onClick,
  ...props
}) => {
  const isInvited = color === 'blue' || color === 'blueActive';
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
        wordBreak: 'break-word',
        padding: '8px 0',
        ...style,
      }}
      {...props}
    >
      <div className={clsx(styles.leftColumn, styles[color])}>
        <h5 className={clsx(styles.farmName)}>
          {farmName.length > 77 ? `${farmName.substring(0, 77).trim()}...` : farmName}
        </h5>
        {ownerName && <p className={clsx(styles.address)}>{ownerName}</p>}
      </div>
      <div className={clsx(styles.rightColumn, styles[color])}>
        <div className={styles.addressContainer}>
          {address?.map((row, index) => (
            <p key={index} className={clsx(styles.address)}>
              {row}
            </p>
          ))}
        </div>
        {isInvited && (
          <div>
            {' '}
            <EmailIcon className={styles.emailIcon} />
          </div>
        )}
      </div>
    </Card>
  );
};

ChooseFarmMenuItem.propTypes = {
  color: PropTypes.oneOf(['secondary', 'active', 'disabled', 'blue', 'blueActive']),
  onClick: PropTypes.func,
  ownerName: PropTypes.string,
  farmName: PropTypes.string,
  address: PropTypes.arrayOf(PropTypes.string),
  style: PropTypes.object,
};

export default ChooseFarmMenuItem;
