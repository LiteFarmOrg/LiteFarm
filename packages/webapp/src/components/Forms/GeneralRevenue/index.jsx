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
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Form from '../../Form';
import Button from '../../Form/Button';
import Input, { getInputErrors } from '../../Form/Input';
import InputAutoSize from '../../Form/InputAutoSize';
import PageTitle from '../../PageTitle/v2';
import ReactSelect from '../../Form/ReactSelect';
import { IconLink } from '../../Typography';
import TrashIcon from '../../../assets/images/document/trash.svg';
import DeleteBox from '../../Task/TaskReadOnly/DeleteBox';
import { getLocalDateInYYYYDDMM } from '../../../util/date';
import { hookFormMaxCharsValidation } from '../../Form/hookformValidationUtils';
import {
  SALE_DATE,
  CUSTOMER_NAME,
  VALUE,
  NOTE,
  REVENUE_TYPE_OPTION,
  REVENUE_TYPE_ID,
} from './constants';
import PropTypes from 'prop-types';

const GeneralRevenue = ({
  onSubmit,
  title,
  currency,
  sale,
  persistedFormData,
  view,
  handleGoBack,
  onClick,
  revenueTypeOptions,
  onTypeChange,
  buttonText,
  customFormChildrenDefaultValues,
  useCustomFormChildren = () => {},
  revenueTypes,
  onRetire,
}) => {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);

  const data = sale || persistedFormData;

  const reactHookFormFunctions = useForm({
    mode: 'onChange',
    defaultValues: {
      [SALE_DATE]: data[SALE_DATE]
        ? getLocalDateInYYYYDDMM(new Date(data[SALE_DATE]))
        : getLocalDateInYYYYDDMM(),
      [CUSTOMER_NAME]: data[CUSTOMER_NAME] ?? null,
      [REVENUE_TYPE_OPTION]: revenueTypeOptions?.find((option) => {
        return option.value === data[REVENUE_TYPE_ID];
      }),
      [VALUE]: !isNaN(data[VALUE]) ? data[VALUE] : null,
      [NOTE]: data[NOTE] ?? null,
      ...customFormChildrenDefaultValues,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    control,
    setValue,
  } = reactHookFormFunctions;

  const selectedTypeOption = watch(REVENUE_TYPE_OPTION);

  useEffect(() => {
    if (revenueTypeOptions?.length && !selectedTypeOption) {
      setValue(
        REVENUE_TYPE_OPTION,
        revenueTypeOptions?.find((option) => {
          return option.value === data[REVENUE_TYPE_ID];
        }),
      );
    }
  }, [revenueTypeOptions]);

  const readonly = view === 'read-only';
  const disabledInput = readonly;
  const disabledButton = !isValid && !readonly;
  // TODO: LF-3680 fix isDirty for dynamic fields
  // const disabledButton = (!isValid || !isDirty) && !readonly;

  const customChildren = useCustomFormChildren(
    reactHookFormFunctions,
    sale,
    currency,
    disabledInput,
    revenueTypes,
    selectedTypeOption,
  );

  // Separating these into separate vs prop rendered nodes prevents form submission onClick for noSubmitButton
  const noSubmitButton = (
    <Button
      color={'secondary'}
      fullLength
      disabled={disabledButton}
      onClick={onClick}
      type={'button'}
    >
      {buttonText}
    </Button>
  );
  const submitButton = (
    <Button color={'primary'} fullLength disabled={disabledButton} type={'submit'}>
      {buttonText}
    </Button>
  );

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      buttonGroup={
        <>
          {onClick && noSubmitButton}
          {onSubmit && submitButton}
        </>
      }
    >
      <PageTitle
        title={title}
        onGoBack={() => {
          handleGoBack();
        }}
        style={{ marginBottom: '24px' }}
      />
      <Input
        label={t('SALE.DETAIL.CUSTOMER_NAME')}
        hookFormRegister={register(CUSTOMER_NAME, { required: true })}
        style={{ marginBottom: '40px' }}
        errors={getInputErrors(errors, CUSTOMER_NAME)}
        type={'text'}
        disabled={disabledInput}
      />
      <Input
        label={t('FINANCES.DATE')}
        hookFormRegister={register(SALE_DATE, { required: true })}
        style={{ marginBottom: '40px' }}
        type={'date'}
        errors={getInputErrors(errors, SALE_DATE)}
        disabled={disabledInput}
      />
      <InputAutoSize
        style={{ marginBottom: '40px' }}
        label={t('LOG_COMMON.NOTES')}
        optional={true}
        hookFormRegister={register(NOTE, { maxLength: hookFormMaxCharsValidation(10000) })}
        name={NOTE}
        errors={getInputErrors(errors, NOTE)}
        disabled={disabledInput}
      />
      {view != 'add' && (
        <Controller
          control={control}
          name={REVENUE_TYPE_OPTION}
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <ReactSelect
              data-cy="generalRevenue-typeSelect"
              label={t('REVENUE.EDIT_REVENUE.REVENUE_TYPE')}
              options={revenueTypeOptions}
              style={{ marginBottom: '40px' }}
              onChange={(e) => {
                onTypeChange(e.value, setValue);
                onChange(e);
              }}
              value={value}
              isDisabled={disabledInput}
            />
          )}
        />
      )}
      {customChildren ? (
        customChildren
      ) : (
        <Input
          label={t('SALE.DETAIL.VALUE')}
          type="number"
          hookFormRegister={register(VALUE, {
            required: customChildren ? false : true,
            valueAsNumber: true,
          })}
          currency={currency}
          style={{ marginBottom: '40px' }}
          errors={getInputErrors(errors, VALUE)}
          disabled={disabledInput}
        />
      )}
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
            {t('REVENUE.DELETE.LINK')}
          </IconLink>
        )}

        {isDeleting && (
          <DeleteBox
            color="error"
            onOk={onRetire}
            onCancel={() => setIsDeleting(false)}
            header={t('REVENUE.DELETE.HEADER')}
            headerIcon={<TrashIcon />}
            message={t('REVENUE.DELETE.MESSAGE')}
            primaryButtonLabel={t('REVENUE.DELETE.CONFIRM')}
          />
        )}
      </div>
    </Form>
  );
};

GeneralRevenue.propTypes = {
  onSubmit: PropTypes.func,
  title: PropTypes.string.isRequired,
  currency: PropTypes.string.isRequired,
  sale: PropTypes.object,
  useHookFormPersist: PropTypes.func,
  persistedFormData: PropTypes.object,
  view: PropTypes.oneOf(['add', 'read-only', 'edit']).isRequired,
  handleGoBack: PropTypes.func.isRequired,
  onClick: PropTypes.func,
  revenueTypeOptions: PropTypes.array.isRequired,
  onTypeChange: PropTypes.func,
  buttonText: PropTypes.string.isRequired,
  customFormChildrenDefaultValues: PropTypes.object,
  useCustomFormChildren: PropTypes.func,
  revenueTypes: PropTypes.array.isRequired,
  onRetire: PropTypes.func,
};

export default GeneralRevenue;
