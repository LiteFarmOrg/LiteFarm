import React from 'react';
import PropTypes from 'prop-types';
import styles from '../styles.module.scss';
import clsx from 'clsx';
import { BsChevronRight } from 'react-icons/bs';
import { Text } from '../../../Typography';
import CalendarIcon from '../../../../assets/images/managementPlans/calendar.svg';
import grabCurrencySymbol from '../../../../util/grabCurrencySymbol';

const FinanceItem = ({ title, subtitle, amount, isPlan, onClickForward }) => {
  return (
    <div className={clsx(styles.groupItem, styles.gridContainer)}>
      <div className={styles.gridItem} style={{ paddingLeft: '14px' }}>
        <Text style={{ lineHeight: '16px' }}>{title}</Text>
        {subtitle && (
          <div className={styles.subtitleContainer}>
            {isPlan && (
              <div className={clsx(styles.iconContainer)}>
                <CalendarIcon className={clsx(styles.icon)} />
              </div>
            )}
            <div>{subtitle}</div>
          </div>
        )}
      </div>
      <Text className={styles.gridItem}>{`${grabCurrencySymbol()}${amount.toFixed(2)}`}</Text>
      {onClickForward && (
        <BsChevronRight
          className={clsx(styles.itemChevron, styles.rightChevron, styles.gridItem)}
          onClick={onClickForward}
        />
      )}
    </div>
  );
};

FinanceItem.prototype = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  amount: PropTypes.number,
  isPlan: PropTypes.bool,
  onClickForward: PropTypes.func,
};

export default FinanceItem;
