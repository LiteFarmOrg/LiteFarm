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
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PropTypes } from 'prop-types';
import ExpenseItemsForType from './ExpenseItemsForType';
import Form from '../../Form';
import Button from '../../Form/Button';
import { NOTE, VALUE, DATE, EXPENSE_DETAIL } from './constants';
import { getLocalDateInYYYYDDMM } from '../../../util/date';
import { useEffect, useMemo } from 'react';

/**
 * Function that generates defaultValues for a type.
 * Return persisted data if exists, otherwise, return [{ [NOTE]: '', [VALUE]: null }].
 *
 * @typedef ExpenseItemValues
 * @type {object}
 * @property {string} note - note
 * @property {number} value - value
 *
 * @param {Array<ExpenseItemValues>} persistedFormDataForType Data user entered. It could be [], [{}] or undefined.
 * @returns {Array<ExpenseItemValues>}
 */
const getDefaultValuesForType = (persistedFormDataForType) => {
  if (persistedFormDataForType?.length && Object.keys(persistedFormDataForType[0]).length) {
    return persistedFormDataForType;
  }
  return [{ [DATE]: getLocalDateInYYYYDDMM(), [NOTE]: '', [VALUE]: null }];
};

/**
 * Function that generates default expenseDetail.
 *
 * @typedef ExpenseType
 * @type {Object}
 * @property {string} name - name of the type
 * @property {string} id - id of the type
 *
 * @typedef ExpenseDetailData
 * @type {Object}
 * @property {Object} - key: typeId of string, value: array of { [NOTE]: <note>, [VALUE]: <value> }
 *
 * @param {Array<ExpenseType>} types Types that the user selected in the previous page.
 * @param {ExpenseDetailData} persistedExpenseDetailData Data user entered. It could be undefined.
 * @returns {ExpenseDetailData}
 */
const getDefaultExpenseDetail = (types, persistedExpenseDetailData) => {
  return types.reduce((expenseDetail, { id }) => {
    return {
      ...expenseDetail,
      [id]: getDefaultValuesForType(persistedExpenseDetailData?.[id]),
    };
  }, {});
};
export default function PureAddExpense({ types, onSubmit }) {
  const { t } = useTranslation();

  const {
    register,
    control,
    watch,
    getValues,
    formState: { isValid, errors },
    handleSubmit,
    reset,
  } = useForm({
    mode: 'onBlur',
    defaultValues: useMemo(
      () => ({
        [EXPENSE_DETAIL]: getDefaultExpenseDetail(types),
      }),
      [types],
    ),
  });

  useEffect(() => {
    reset({
      [EXPENSE_DETAIL]: getDefaultExpenseDetail(types),
    });
  }, [types]);

  const expenseDetail = watch(EXPENSE_DETAIL);

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
      {types.map((type) => {
        return (
          <ExpenseItemsForType
            key={type.id}
            type={type}
            register={register}
            control={control}
            getValues={getValues}
            errors={errors}
          />
        );
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
