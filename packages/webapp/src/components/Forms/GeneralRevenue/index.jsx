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
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Form from '../../Form';
import Button from '../../Form/Button';
import Input, { getInputErrors } from '../../Form/Input';
import InputAutoSize from '../../Form/InputAutoSize';
import PageTitle from '../../PageTitle/v2';
import { getLocalDateInYYYYDDMM } from '../../../util/date';
import { hookFormMaxCharsValidation } from '../../Form/hookformValidationUtils';

const SALE_DATE = 'sale_date';
const SALE_CUSTOMER = 'customer_name';
const VALUE = `value`;
const NOTE = `note`;

const GeneralRevenue = ({
  onSubmit,
  title,
  dateLabel,
  customerLabel,
  currency,
  sale,
  useHookFormPersist,
  persistedFormData,
}) => {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    getValues,
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      [SALE_DATE]:
        (sale?.[SALE_DATE] && getLocalDateInYYYYDDMM(sale.SALE_DATE)) ||
        persistedFormData?.[SALE_DATE] ||
        getLocalDateInYYYYDDMM(),
      [SALE_CUSTOMER]: sale?.[SALE_CUSTOMER] || persistedFormData?.[SALE_CUSTOMER] || '',
      [VALUE]: sale?.[VALUE] || null,
      [NOTE]: sale?.[NOTE] || '',
    },
  });

  useHookFormPersist(getValues);

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      buttonGroup={
        <Button disabled={!isValid} fullLength type={'submit'}>
          {t('common:SAVE')}
        </Button>
      }
    >
      <PageTitle title={title} onGoBack={() => history.back()} style={{ marginBottom: '24px' }} />
      <Input
        label={customerLabel}
        hookFormRegister={register(SALE_CUSTOMER, { required: true })}
        style={{ marginBottom: '40px' }}
        errors={getInputErrors(errors, SALE_CUSTOMER)}
        type={'text'}
      />
      <Input
        label={dateLabel}
        hookFormRegister={register(SALE_DATE, { required: true })}
        style={{ marginBottom: '40px' }}
        type={'date'}
        errors={getInputErrors(errors, SALE_DATE)}
      />
      <Input
        label={t('SALE.DETAIL.VALUE')}
        type="number"
        hookFormRegister={register(VALUE, { required: true, valueAsNumber: true })}
        currency={currency}
        style={{ marginBottom: '40px' }}
        errors={getInputErrors(errors, VALUE)}
      />
      <InputAutoSize
        style={{ marginBottom: '40px' }}
        label={t('LOG_COMMON.NOTES')}
        optional={true}
        hookFormRegister={register(NOTE, { maxLength: hookFormMaxCharsValidation(10000) })}
        name={NOTE}
        errors={getInputErrors(errors, NOTE)}
      />
    </Form>
  );
};

export default GeneralRevenue;
