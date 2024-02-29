/*
 *  Copyright 2023-2024 LiteFarm.org
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
import FilterGroup from '../../../components/Filter/FilterGroup';
import { allExpenseTypeSelector } from '../../Finances/selectors';
import { transactionTypeEnum } from '../../Finances/useTransactions';
import { EXPENSE_TYPE, REVENUE_TYPE } from '../constants';
import { allRevenueTypesSelector } from '../../revenueTypeSlice';
import type { RevenueType, ExpenseType } from '../../Finances/types';
import type { ReduxFilterEntity, ContainerOnChangeCallback } from '../types';
import type { ComponentFilter } from '../../../components/Filter/types';

/*
TransactionFilterContent

This component receives the Redux state filters from the container (which also holds the filterRef and dirty/reset states) and transforms them into the correct shape for the FilterGroup component. The transactions filter uses a different a different approach where the outermost container holds the dirty state (where previously the inner component did) and filter transformation lives in a different component than the filter Redux state. This is also the only flow where the Redux state is not in the Containers/Filter container.

I'm not sure about the Redux state, but removing the dirty and reset controls from the inner component allows situating these filters into two modals with different dirty/reset/submit actions, and also seems more correct. I'm still a little surprised that the filterRef + Redux interaction is defined in two components.

Data flow for transactions filter is

1. Finances/Report -AND- Finances/TransactionFilter
2. <This component> TransactionsFilterContent
3. FilterGroup + subfilters

The container defines the filterRef and the relationship with the Redux store. The PureFilterPage component is a layout component that holds the title, the button group, and the reset button. FilterGroup displays the correct filter types, which each handle their own filter state.

*/

interface TransactionFilterContentProps {
  transactionsFilter: ReduxFilterEntity;
  filterRef: React.RefObject<ReduxFilterEntity>;
  filterContainerClassName?: string;
  onChange: ContainerOnChangeCallback;
}

const TransactionFilterContent = ({
  transactionsFilter,
  filterRef,
  filterContainerClassName,
  onChange,
}: TransactionFilterContentProps) => {
  const { t } = useTranslation(['translation', 'filter']);
  const expenseTypes: ExpenseType[] = useSelector(allExpenseTypeSelector);
  const revenueTypes: RevenueType[] = useSelector(allRevenueTypesSelector);

  const filters: ComponentFilter[] = [
    {
      subject: t('FINANCES.FILTER.EXPENSE_TYPE'),
      filterKey: EXPENSE_TYPE,
      options: [
        ...(expenseTypes || []).map((type) => ({
          value: type.expense_type_id,
          // This sets the initial state of the filter pill
          default: transactionsFilter[EXPENSE_TYPE]?.[type.expense_type_id]?.active ?? true,
          label:
            (type.farm_id
              ? type.expense_name
              : t(`expense:${type.expense_translation_key}.EXPENSE_NAME`)) +
            (type.retired ? ` ${t('EXPENSE.EDIT_EXPENSE.RETIRED')}` : ''),
        })),
        {
          value: transactionTypeEnum.labourExpense,
          // This sets the initial state of the filter pill
          default:
            transactionsFilter[EXPENSE_TYPE]?.[transactionTypeEnum.labourExpense]?.active ?? true,
          label: t('SALE.FINANCES.LABOUR_LABEL'),
        },
      ],
    },
    {
      subject: t('FINANCES.FILTER.REVENUE_TYPE'),
      filterKey: REVENUE_TYPE,
      options: (revenueTypes || []).map((type) => ({
        value: type.revenue_type_id,
        // This sets the initial state of the filter pill
        default: transactionsFilter[REVENUE_TYPE]?.[type.revenue_type_id]?.active ?? true,
        label:
          (type.farm_id
            ? type.revenue_name
            : t(`revenue:${type.revenue_translation_key}.REVENUE_NAME`)) +
          (type.retired ? ` ${t('REVENUE.EDIT_REVENUE.RETIRED')}` : ''),
      })),
    },
  ];

  return (
    <FilterGroup
      filters={filters.map((filter) => sortFilterOptions(filter))}
      filterRef={filterRef}
      filterContainerClassName={filterContainerClassName}
      onChange={onChange}
      showIndividualFilterControls
    />
  );
};

const filterShape = { active: PropTypes.bool, label: PropTypes.string };

TransactionFilterContent.propTypes = {
  transactionsFilter: PropTypes.objectOf(PropTypes.shape(filterShape)).isRequired,
  filterRef: PropTypes.shape({ current: PropTypes.shape(filterShape) }).isRequired,
  filterContainerClassName: PropTypes.string,
  onChange: PropTypes.func,
};

export default TransactionFilterContent;

const sortFilterOptions = (filters: ComponentFilter): ComponentFilter => {
  return {
    ...filters,
    options: [...filters.options.sort((typeA, typeB) => typeA.label.localeCompare(typeB.label))],
  };
};
