import { expenseTypeTileContentsSelector, selectedExpenseSelector } from '../../selectors';
import { setSelectedExpenseTypes } from '../../actions';
import { useTranslation } from 'react-i18next';
import ManageCustomExpenseTypesSpotlight from '../ManageCustomExpenseTypesSpotlight';
import PureFinanceTypeSelection from '../../../../components/Finances/PureFinanceTypeSelection';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import labelIconStyles from '../../../../components/Tile/styles.module.scss';
import { listItemTypes } from '../../../../components/List/constants';
import { getFinanceTypeSearchableStringFunc } from '../../util';
import { ADD_EXPENSE_URL, MANAGE_CUSTOM_EXPENSES_URL } from '../../../../util/siteMapConstants';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { useState } from 'react';

const ExpenseCategories = () => {
  let navigate = useNavigate();
  const expenseTypes = useSelector(expenseTypeTileContentsSelector);
  const selectedExpense = useSelector(selectedExpenseSelector);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  let initialSelectedTypes = selectedExpense.filter((typeId) => {
    return expenseTypes.some(({ expense_type_id }) => expense_type_id === typeId);
  });
  const [selectedTypes, setSelectedTypes] = useState(initialSelectedTypes);

  const nextPage = (event) => {
    event.preventDefault();
    dispatch(setSelectedExpenseTypes(selectedTypes));
    navigate(ADD_EXPENSE_URL);
  };

  const addRemoveType = (id) => {
    let { selectedTypesCopy } = selectedTypes;
    if (selectedTypesCopy.includes(id)) {
      const index = selectedTypesCopy.indexOf(id);
      selectedTypesCopy.splice(index, 1);
    } else {
      selectedTypesCopy.push(id);
    }
    setSelectedTypes(selectedTypesCopy);
  };

  const miscellaneous_type_id = expenseTypes.find(
    (expenseType) => expenseType.expense_translation_key == 'MISCELLANEOUS',
  ).expense_type_id;

  // Do not display miscellaneous as a visible tile
  const filteredExpenseTypes = expenseTypes.filter(
    (expenseType) => expenseType.expense_type_id !== miscellaneous_type_id,
  );

  return (
    <HookFormPersistProvider>
      <PureFinanceTypeSelection
        title={t('EXPENSE.ADD_EXPENSE.TITLE')}
        leadText={t('EXPENSE.ADD_EXPENSE.WHICH_TYPES_TO_RECORD')}
        cancelTitle={t('EXPENSE.ADD_EXPENSE.FLOW')}
        types={filteredExpenseTypes}
        onContinue={nextPage}
        onGoBack={() => navigate(-1)}
        progressValue={33}
        onGoToManageCustomType={() => navigate(MANAGE_CUSTOM_EXPENSES_URL)}
        isTypeSelected={!!selectedTypes.length}
        formatListItemData={(data) => {
          const {
            farm_id,
            expense_translation_key,
            expense_type_id,
            expense_name,
            custom_description,
          } = data;

          return {
            key: expense_type_id,
            iconName: farm_id ? 'OTHER' : expense_translation_key,
            label: farm_id ? expense_name : t(`expense:${expense_translation_key}.EXPENSE_NAME`),
            onClick: () => addRemoveType(expense_type_id),
            selected: selectedTypes.includes(expense_type_id),
            className: labelIconStyles.boldLabelIcon,
            description: farm_id
              ? custom_description
              : t(`expense:${expense_translation_key}.CUSTOM_DESCRIPTION`),
          };
        }}
        listItemType={listItemTypes.ICON_DESCRIPTION_CHECKBOX}
        iconLinkId={'manageCustomExpenseType'}
        Wrapper={ManageCustomExpenseTypesSpotlight}
        customTypeMessages={{
          info: t('FINANCES.CANT_FIND.INFO_EXPENSE'),
          manage: t('FINANCES.CANT_FIND.MANAGE_EXPENSE'),
        }}
        miscellaneousConfig={{
          addRemove: () => addRemoveType(miscellaneous_type_id),
          selected: selectedTypes.includes(miscellaneous_type_id),
        }}
        getSearchableString={getFinanceTypeSearchableStringFunc('expense')}
        searchPlaceholderText={t('FINANCES.SEARCH.EXPENSE_TYPES')}
      />
    </HookFormPersistProvider>
  );
};

export default ExpenseCategories;
