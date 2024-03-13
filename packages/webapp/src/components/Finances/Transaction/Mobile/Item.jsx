/*
 *  Copyright 2023 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */
import clsx from 'clsx';
import { formatAmount } from '../../../../containers/Finances/util';
import commonStyles from '../styles.module.scss';
import styles from './styles.module.scss';
import Icon from '../../../Icons';

export default function TransactionItem({ iconKey, transaction, type, amount, currencySymbol }) {
  return (
    <div className={styles.mainContent}>
      <div className={styles.mainContentLeft}>
        <Icon circle iconName={iconKey} className={styles.expandableItemIcon} />
        <div className={styles.mainContentText}>
          <div className={styles.mainContentTitle}>{transaction}</div>
          <div className={styles.mainContentInfo}>{type}</div>
        </div>
      </div>
      <div
        className={clsx(
          styles.amount,
          commonStyles[+amount < 0 ? 'negativeValue' : 'positiveValue'],
        )}
      >
        {formatAmount(amount, currencySymbol)}
      </div>
    </div>
  );
}
