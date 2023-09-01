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
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import PureManageCustomTypes from '../../../components/Forms/ManageCustomType';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { selectedExpenseSelector } from '../selectors';
import { setSelectedExpenseTypes } from '../actions';
import { icons } from '../NewExpense/ExpenseCategories';
import labelIconStyles from '../NewExpense/ExpenseCategories/styles.module.scss';
import useCustomExpenseTypeTileContents from '../useCustomExpenseTypeTileContents';

const addCustomTypePath = '/add_task/add_custom_expense_type';
const editCustomTypePath = '/add_task/edit_custom_expense_type';

export default function ManageExpenseTypes({ history }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const selectedExpenseTypes = useSelector(selectedExpenseSelector);

  const onTileClick = (typeId) => {
    if (!selectedExpenseTypes.includes(typeId)) {
      dispatch(setSelectedExpenseTypes([...selectedExpenseTypes, typeId]));
    }
    history.push(editCustomTypePath);
  };
  const customTypes = useCustomExpenseTypeTileContents();

  return (
    <HookFormPersistProvider>
      <PureManageCustomTypes
        title={t('EXPENSE.ADD_EXPENSE.MANAGE_CUSTOM_EXPENSE_TYPE')}
        handleGoBack={history.back}
        addLinkText={t('EXPENSE.ADD_EXPENSE.ADD_CUSTOM_EXPENSE_TYPE')}
        onAddType={() => history.push(addCustomTypePath)}
        tileData={customTypes}
        getIsSelected={(typeId) => selectedExpenseTypes?.includes(typeId)}
        onTileClick={onTileClick}
        customTypeFieldName={'expense_type_id'}
        formatTileData={(data) => {
          const { farm_id, expense_translation_key, expense_name, expense_type_id } = data;

          return {
            key: expense_type_id,
            tileKey: expense_type_id,
            icon: icons[farm_id ? 'OTHER' : expense_translation_key],
            label: farm_id ? expense_name : t(`expense:${expense_translation_key}`),
            className: labelIconStyles.labelIcon,
          };
        }}
      />
    </HookFormPersistProvider>
  );
}
