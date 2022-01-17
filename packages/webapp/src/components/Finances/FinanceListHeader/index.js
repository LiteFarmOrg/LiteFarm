import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import styles from '../FinanceGroup/styles.module.scss';

const FinanceListHeader = ({ firstColumn, secondColumn, className, style, ...props }) => {
  return (
    <div
      className={clsx(styles.gridContainer, className)}
      style={{
        marginLeft: '8px',
        marginRight: '8px',
        ...style,
      }}
    >
      <div className={clsx(styles.gridItem, styles.subtitle)}>{firstColumn}</div>
      <div className={clsx(styles.gridItem, styles.subtitle)}>{secondColumn}</div>
    </div>
  );
};

FinanceListHeader.prototype = {
  firstColumn: PropTypes.string,
  secondColumn: PropTypes.string,
  className: PropTypes.string,
};

export default FinanceListHeader;
