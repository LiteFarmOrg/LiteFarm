import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Semibold } from '../../Typography';

const WholeFarmRevenue = ({ amount, className, ...props }) => {
  const { t } = useTranslation();

  return (
    <div
      className={clsx(styles.wholeFarmRevenueContainer, styles.gridContainer, className)}
      {...props}
    >
      <Semibold
        className={clsx(styles.gridItem, styles.textColor)}
        style={{ paddingLeft: '4px' }}
        sm
      >
        {t('FINANCES.WHOLE_FARM_REVENUE')}
      </Semibold>
      <Semibold className={clsx(styles.gridItem, styles.textColor)} sm>
        {`$${amount.toFixed(2)}`}
      </Semibold>
    </div>
  );
};

WholeFarmRevenue.prototype = {
  amount: PropTypes.number,
  className: PropTypes.string,
};

export default WholeFarmRevenue;
