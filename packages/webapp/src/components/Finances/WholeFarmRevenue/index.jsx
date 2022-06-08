import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { gridContainer, gridItem } from '../FinanceGroup/styles.module.scss';
import { useTranslation } from 'react-i18next';
import { Semibold } from '../../Typography';
import grabCurrencySymbol from '../../../util/grabCurrencySymbol';

const WholeFarmRevenue = ({ amount, className, ...props }) => {
  const { t } = useTranslation();

  return (
    <div className={clsx(styles.wholeFarmRevenueContainer, gridContainer, className)} {...props}>
      <Semibold className={clsx(gridItem, styles.textColor)} style={{ paddingLeft: '4px' }} sm>
        {t('FINANCES.WHOLE_FARM_REVENUE')}
      </Semibold>
      <Semibold className={clsx(gridItem, styles.textColor)} sm>
        {`${grabCurrencySymbol()}${amount.toFixed(2)}`}
      </Semibold>
    </div>
  );
};

WholeFarmRevenue.prototype = {
  amount: PropTypes.number,
  className: PropTypes.string,
};

export default WholeFarmRevenue;
