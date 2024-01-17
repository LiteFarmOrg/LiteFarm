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
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import PureManageCustomTypes from '../../../components/Forms/ManageCustomTypes';
import { setPersistedPaths } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { icons } from '../NewExpense/ExpenseCategories';
import labelIconStyles from '../../../components/Tile/styles.module.scss';
import useCustomExpenseTypeTileContents from '../useCustomExpenseTypeTileContents';
import {
  ADD_CUSTOM_EXPENSE_URL,
  FINANCES_HOME_URL,
  MANAGE_CUSTOM_EXPENSES_URL,
  createEditCustomExpenseURL,
  createReadonlyCustomExpenseURL,
} from '../../../util/siteMapConstants';

const addCustomTypePath = ADD_CUSTOM_EXPENSE_URL;

const getPaths = (typeId) => ({
  readOnly: createReadonlyCustomExpenseURL(typeId),
  edit: createEditCustomExpenseURL(typeId),
});

export default function ManageExpenseTypes({ history }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const customTypes = useCustomExpenseTypeTileContents();

  const onItemClick = (typeId) => {
    const { readOnly, edit } = getPaths(typeId);
    dispatch(setPersistedPaths([readOnly, edit]));

    history.push(readOnly);
  };

  useEffect(() => {
    // Manipulate page navigation by pushing "/expense_categories" on top of FINANCES_HOME_URL.
    // When browser's back button or form's back button is clicked, we want to
    // navigate the user to "/expense_categories" not FINANCES_HOME_URL.
    const unlisten = history.listen(() => {
      if (history.action === 'POP' && history.location.pathname === FINANCES_HOME_URL) {
        dispatch(setPersistedPaths(['/expense_categories', '/add_expense']));
        unlisten();
        history.push('/expense_categories');
      } else if (
        // unlisten when the user gets out of the page without going back to FINANCES_HOME_URL.
        // pathname: "/manage_custom_expenses" happens when the user lands on this page.
        !(
          history.location.pathname === MANAGE_CUSTOM_EXPENSES_URL ||
          (history.action === 'POP' && history.location.pathname === FINANCES_HOME_URL)
        )
      ) {
        unlisten();
      }
    });
  }, []);

  const onAddType = () => {
    setPersistedPaths(addCustomTypePath);
    history.push(addCustomTypePath);
  };

  return (
    <PureManageCustomTypes
      title={t('EXPENSE.ADD_EXPENSE.MANAGE_CUSTOM_EXPENSE_TYPE')}
      handleGoBack={history.back}
      addLinkText={t('EXPENSE.ADD_EXPENSE.ADD_CUSTOM_EXPENSE_TYPE')}
      onAddType={onAddType}
      listItemData={customTypes}
      formatListItemData={(data) => {
        const { expense_name, expense_type_id, custom_description } = data;

        return {
          key: expense_type_id,
          icon: icons['OTHER'],
          label: expense_name,
          className: labelIconStyles.boldLabelIcon,
          description: custom_description,
          onClick: () => onItemClick(expense_type_id),
        };
      }}
    />
  );
}
