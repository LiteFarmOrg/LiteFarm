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
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PropTypes } from 'prop-types';
import ExpenseItemsForType from './ExpenseItemsForType';
import Form from '../../Form';
import Button from '../../Form/Button';
import { STEPS } from '../../AddExpenseForm';
import { useEffect, useState } from 'react';

export default function PureAddExpense({ onSubmit, getTypeName }) {
  const { t } = useTranslation();
  const [typesWithNames, setTypesWithNames] = useState([]);

  const {
    watch,
    formState: { isValid },
    handleSubmit,
  } = useFormContext();

  const selectedTypes = watch(STEPS.EXPENSE_TYPES);
  const expenseDetail = watch(STEPS.EXPENSE_DETAIL);

  useEffect(() => {
    setTypesWithNames(
      selectedTypes.map((type) => ({
        id: type,
        name: getTypeName(type),
      })),
    );
  }, []);

  const hasExpenseItem = Object.keys(expenseDetail).some((key) => !!expenseDetail[key].length);

  return (
    <Form
      buttonGroup={
        <Button
          disabled={!(isValid && hasExpenseItem)}
          onClick={handleSubmit(onSubmit)}
          type={'submit'}
          fullLength
        >
          {t('common:SAVE')}
        </Button>
      }
    >
      {typesWithNames.map((type) => {
        return <ExpenseItemsForType key={type.id} type={type} />;
      })}
    </Form>
  );
}

PureAddExpense.propTypes = {
  types: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
    }),
  ),
  onSubmit: PropTypes.func,
};
