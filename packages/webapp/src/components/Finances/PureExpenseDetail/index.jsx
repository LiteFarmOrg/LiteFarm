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

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import Form from '../../Form';
import PageTitle from '../../PageTitle/v2';
import Input, { getInputErrors } from '../../Form/Input';
import Button from '../../Form/Button';
import PropTypes from 'prop-types';
import { IconLink } from '../../Typography';
import DeleteBox from '../../Task/TaskReadOnly/DeleteBox';
import TrashIcon from '../../../assets/images/document/trash.svg?react';
import { hookFormMaxCharsValidation } from '../../Form/hookformValidationUtils';
import { useCurrencySymbol } from '../../../containers/hooks/useCurrencySymbol';
import ReactSelect from '../../Form/ReactSelect';
import { getDateInputFormat } from '../../../util/moment';
import { NOTE, VALUE, DATE, TYPE } from '../AddExpense/constants';

const PureExpenseDetail = ({
  pageTitle,
  handleGoBack,
  onSubmit = () => {},
  onRetire = () => {},
  view,
  buttonText,
  inputMaxChars = 100,
  expense,
  expenseTypeReactSelectOptions,
}) => {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);
  const {
    handleSubmit,
    register,
    control,
    formState: { errors, isValid, isDirty },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      [NOTE]: expense.note,
      [DATE]: getDateInputFormat(expense.expense_date),
      [TYPE]: expenseTypeReactSelectOptions.find(
        (option) => option.value === expense.expense_type_id,
      ),
      [VALUE]: expense.value,
    },
  });
  const readonly = view === 'read-only';
  const disabledInput = readonly;
  const disabledButton = (!isValid || !isDirty) && !readonly;

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      buttonGroup={
        <Button color={'primary'} fullLength disabled={disabledButton}>
          {buttonText}
        </Button>
      }
    >
      <PageTitle style={{ marginBottom: '24px' }} onGoBack={handleGoBack} title={pageTitle} />
      <Input
        style={{ marginBottom: '24px' }}
        label={t('EXPENSE.ITEM_NAME')}
        hookFormRegister={register(NOTE, {
          required: true,
          maxLength: hookFormMaxCharsValidation(inputMaxChars),
        })}
        name={NOTE}
        errors={getInputErrors(errors, NOTE)}
        optional={false}
        disabled={disabledInput}
      />
      <Input
        style={{ marginBottom: '24px' }}
        label={t('common:DATE')}
        type={'date'}
        hookFormRegister={register(DATE, { required: true })}
        name={DATE}
        errors={getInputErrors(errors, DATE)}
        disabled={disabledInput}
      />
      <Controller
        control={control}
        name={TYPE}
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <ReactSelect
            label={t('EXPENSE.TYPE')}
            options={expenseTypeReactSelectOptions}
            onChange={onChange}
            isDisabled={disabledInput}
            value={value}
            style={{ marginBottom: '24px' }}
          />
        )}
      />
      <Input
        style={{ marginBottom: '24px' }}
        label={t('EXPENSE.VALUE')}
        type={'number'}
        hookFormRegister={register(VALUE, {
          required: true,
          setValueAs: (v) => (v === '' ? null : +v),
          min: { value: 0 },
        })}
        currency={useCurrencySymbol()}
        name={VALUE}
        errors={getInputErrors(errors, VALUE)}
        optional={false}
        disabled={disabledInput}
      />
      <div style={{ marginTop: 'auto' }}>
        {readonly && !isDeleting && (
          <IconLink
            style={{ color: 'var(--grey600)' }}
            icon={
              <TrashIcon
                style={{
                  fill: 'var(--grey600)',
                  stroke: 'var(--grey600)',
                  transform: 'translate(0px, 6px)',
                }}
              />
            }
            onClick={() => setIsDeleting(true)}
            isIconClickable
          >
            {t('EXPENSE.DELETE.LINK')}
          </IconLink>
        )}

        {isDeleting && (
          <DeleteBox
            color="error"
            onOk={onRetire}
            onCancel={() => setIsDeleting(false)}
            header={t('EXPENSE.DELETE.HEADER')}
            headerIcon={<TrashIcon />}
            message={t('EXPENSE.DELETE.MESSAGE')}
            primaryButtonLabel={t('EXPENSE.DELETE.CONFIRM')}
          />
        )}
      </div>
    </Form>
  );
};

PureExpenseDetail.propTypes = {
  pageTitle: PropTypes.string,
  handleGoBack: PropTypes.func,
  onSubmit: PropTypes.func,
  onRetire: PropTypes.func,
  view: PropTypes.oneOf(['add', 'read-only', 'edit']),
  buttonText: PropTypes.string,
  inputMaxChars: PropTypes.number,
  expense: PropTypes.object,
  expenseTypeReactSelectOptions: PropTypes.arrayOf(PropTypes.object),
};

export default PureExpenseDetail;
