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
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PropTypes } from 'prop-types';
import ExpenseItemsForType from './ExpenseItemsForType';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import Input, { getInputErrors } from '../../Form/Input';
import Form from '../../Form';
import Button from '../../Form/Button';
import { NOTE, VALUE, DATE, EXPENSE_DETAIL } from './constants';
import { getLocalDateInYYYYDDMM } from '../../../util/date';

const getDefaultExpenseDetail = (types) => {
  return types.reduce((expenseDetail, { id }) => {
    return {
      ...expenseDetail,
      [id]: [{ [NOTE]: '', [VALUE]: null }],
    };
  }, {});
};

export default function PureAddExpense({ types, onGoBack, onSubmit, useHookFormPersist }) {
  const { t } = useTranslation();
  const { historyCancel } = useHookFormPersist();

  const {
    register,
    control,
    watch,
    setValue,
    formState: { isValid, errors },
    handleSubmit,
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      [DATE]: getLocalDateInYYYYDDMM(),
      [EXPENSE_DETAIL]: getDefaultExpenseDetail(types),
    },
  });

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
      <MultiStepPageTitle
        onGoBack={onGoBack}
        onCancel={historyCancel}
        cancelModalTitle={t('EXPENSE.ADD_EXPENSE.FLOW')}
        title={t('EXPENSE.ADD_EXPENSE.NEW_EXPENSE_ITEM')}
        value={66}
        style={{ marginBottom: '24px' }}
      />
      <Input
        style={{ marginBottom: '40px' }}
        type={'date'}
        label={t('common:DATE')}
        hookFormRegister={register(DATE, { required: true })}
        errors={getInputErrors(errors, DATE)}
        required
      />
      {types.map((type) => {
        return (
          <ExpenseItemsForType
            key={type.id}
            type={type}
            register={register}
            control={control}
            setValue={setValue}
            errors={errors}
          />
        );
      })}
    </Form>
  );
}

PureAddExpense.proptype = {
  types: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
  }),
  onGoBack: PropTypes.func,
  onSubmit: PropTypes.func,
  useHookFormPersist: PropTypes.func,
};
