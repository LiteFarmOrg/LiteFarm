import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { gridContainer, gridItem, subtitle } from '../FinanceGroup/styles.module.scss';

const FinanceListHeader = ({ firstColumn, secondColumn, className, style, ...props }) => {
  return (
    <div
      className={clsx(gridContainer, className)}
      style={{
        marginLeft: '8px',
        marginRight: '8px',
        ...style,
      }}
    >
      <div className={clsx(gridItem, subtitle)}>{firstColumn}</div>
      <div className={clsx(gridItem, subtitle)}>{secondColumn}</div>
    </div>
  );
};

FinanceListHeader.prototype = {
  firstColumn: PropTypes.string,
  secondColumn: PropTypes.string,
  className: PropTypes.string,
};

export default FinanceListHeader;
