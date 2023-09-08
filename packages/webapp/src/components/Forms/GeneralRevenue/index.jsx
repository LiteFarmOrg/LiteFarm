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
const GENERAL_SALE = 'general_sale';
const SALE_VALUE = `${GENERAL_SALE}.sale_value`;
const NOTES = `${GENERAL_SALE}.notes`;

const GeneralRevenue = ({ onSubmit, title, dateLabel, customerLabel, currency, sale }) => {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      [SALE_DATE]: getLocalDateInYYYYDDMM(sale?.[SALE_DATE]),
      [SALE_CUSTOMER]: sale?.[SALE_CUSTOMER] || '',
      [GENERAL_SALE]: sale?.[GENERAL_SALE] || {
        sale_value: null,
        notes: '',
      },
    },
  });

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
        hookFormRegister={register(SALE_VALUE, { required: true, valueAsNumber: true })}
        currency={currency}
        style={{ marginBottom: '40px' }}
        errors={getInputErrors(errors, SALE_VALUE)}
      />
      <InputAutoSize
        style={{ marginBottom: '40px' }}
        label={t('LOG_COMMON.NOTES')}
        optional={true}
        hookFormRegister={register(NOTES, { maxLength: hookFormMaxCharsValidation(10000) })}
        name={NOTES}
        errors={getInputErrors(errors, NOTES)}
      />
    </Form>
  );
};

export default GeneralRevenue;
