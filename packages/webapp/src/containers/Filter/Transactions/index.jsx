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

import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { EXPENSE_TYPE, REVENUE_TYPE } from '../constants';
import { expenseTypeSelector } from '../../Finances/selectors';
import { revenueTypesSelector } from '../../revenueTypeSlice';
import FilterGroup from '../../../components/Filter/FilterGroup';
import { Semibold } from '../../../components/Typography';
import styles from './styles.module.scss';

const TransactionFilterContent = ({ transactionsFilter, filterRef, onChange }) => {
  const { t } = useTranslation(['translation', 'filter']);
  const expenseTypes = useSelector(expenseTypeSelector);
  const revenueTypes = useSelector(revenueTypesSelector);

  const filters = [
    {
      subject: t('FINANCES.FILTER.EXPENSE_TYPE'),
      filterKey: EXPENSE_TYPE,
      options: expenseTypes.map((type) => ({
        value: type.expense_type_id,
        default: transactionsFilter[EXPENSE_TYPE]?.[type.expense_type_id]?.active ?? true,
        label: type.farm_id
          ? type.expense_name
          : t(`expense:${type.expense_translation_key}.EXPENSE_NAME`),
      })),
    },
    {
      subject: t('FINANCES.FILTER.REVENUE_TYPE'),
      filterKey: REVENUE_TYPE,
      options: revenueTypes.map((type) => ({
        value: type.revenue_type_id,
        default: transactionsFilter[REVENUE_TYPE]?.[type.revenue_type_id]?.active ?? true,
        label: type.farm_id
          ? type.revenue_name
          : t(`revenue:${type.revenue_translation_key}.REVENUE_NAME`),
      })),
    },
  ];

  return (
    <>
      <Semibold className={styles.helpText}>{t('FINANCES.FILTER.HELP_TEXT')}</Semibold>
      <FilterGroup filters={filters} filterRef={filterRef} onChange={onChange} />
    </>
  );
};

const filterShape = { active: PropTypes.bool, label: PropTypes.string };

TransactionFilterContent.propTypes = {
  transactionsFilter: PropTypes.objectOf(PropTypes.shape(filterShape)).isRequired,
  filterRef: PropTypes.shape({ current: PropTypes.shape(filterShape) }).isRequired,
  onChange: PropTypes.func,
};

export default TransactionFilterContent;
