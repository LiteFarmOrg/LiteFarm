import React from 'react';
import PropTypes from 'prop-types';
import styles from '../styles.module.scss';
import clsx from 'clsx';
import { BsChevronDown, BsChevronRight } from 'react-icons/bs';
import { Semibold, Text } from '../../../Typography';
import grabCurrencySymbol from '../../../../util/grabCurrencySymbol';

const FinanceGroupHeader = ({
  title,
  subtitle,
  currencyAmount,
  isDropDown,
  open,
  setOpen,
  onClickForward,
}) => {
  return (
    <div
      className={clsx(styles.groupHeader, styles.gridContainer)}
      style={open ? {} : { borderRadius: '4px' }}
    >
      <div className={styles.gridItem} style={{ paddingLeft: '4px' }}>
        <Semibold sm>{title}</Semibold>
        {subtitle && <div className={clsx(styles.subtitle)}>{subtitle}</div>}
      </div>
      <Text className={styles.gridItem}>{`${grabCurrencySymbol()}${currencyAmount.toFixed(
        2,
      )}`}</Text>
      {isDropDown ? (
        <BsChevronDown
          className={clsx(styles.headerChevron, styles.gridItem)}
          style={open ? { transform: 'scaleY(-1)' } : {}}
          onClick={() => setOpen(!open)}
        />
      ) : (
        <BsChevronRight
          className={clsx(styles.headerChevron, styles.rightChevron, styles.gridItem)}
          onClick={onClickForward}
        />
      )}
    </div>
  );
};

FinanceGroupHeader.prototype = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  currencyAmount: PropTypes.number,
  isDropDown: PropTypes.bool,
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  onClickForward: PropTypes.func,
};

export default FinanceGroupHeader;
