import Input, { integerOnKeyDown } from '../../Form/Input';
import { Controller, useForm } from 'react-hook-form';
import { userFarmEnum } from '../../../containers/constants';
import ReactSelect from '../../Form/ReactSelect';
import { useTranslation } from 'react-i18next';
import React from 'react';
import Button from '../../Form/Button';
import PropTypes from 'prop-types';
import ProfileLayout from '../ProfileLayout';

export default function PureFarm({ userFarm, onSubmit, history, isAdmin }) {
  const MEASUREMENT = 'units.measurement';
  const { t } = useTranslation();

  const measurementOptionMap = {
    metric: { label: t('PROFILE.FARM.METRIC'), value: 'metric' },
    imperial: { label: t('PROFILE.FARM.IMPERIAL'), value: 'imperial' },
  };
  const options = Object.values(measurementOptionMap);
  const defaultMeasurementOption = measurementOptionMap[userFarm.units.measurement];
  const {
    register,
    handleSubmit,
    control,
    formState: { isValid, isDirty, errors },
  } = useForm({
    mode: 'onChange',
    defaultValues: { ...userFarm, units: { measurement: defaultMeasurementOption } },
    shouldUnregister: true,
  });
  const disabled = !isDirty || !isValid;

  return (
    <ProfileLayout
      onSubmit={handleSubmit(onSubmit)}
      history={history}
      buttonGroup={
        isAdmin && (
          <Button fullLength type={'submit'} disabled={disabled}>
            {t('common:SAVE')}
          </Button>
        )
      }
    >
      <Input
        label={t('PROFILE.FARM.FARM_NAME')}
        hookFormRegister={register(userFarmEnum.farm_name, {
          required: true,
          maxLength: {
            value: 255,
            message: t('PROFILE.FARM.FARM_NAME_LENGTH_ERROR'),
          },
        })}
        disabled={!isAdmin}
        errors={errors[userFarmEnum.farm_name] && errors[userFarmEnum.farm_name].message}
      />
      <Input
        label={t('PROFILE.FARM.PHONE_NUMBER')}
        hookFormRegister={register(userFarmEnum.farm_phone_number, {
          required: false,
          maxLength: {
            value: 20,
            message: t('PROFILE.FARM.PHONE_NUMBER_LENGTH_ERROR'),
          },
        })}
        errors={
          errors[userFarmEnum.farm_phone_number] && errors[userFarmEnum.farm_phone_number].message
        }
        type={'number'}
        onKeyDown={integerOnKeyDown}
        disabled={!isAdmin}
        optional
      />
      <Input label={t('PROFILE.FARM.ADDRESS')} value={userFarm.address} disabled />
      <Controller
        control={control}
        name={MEASUREMENT}
        render={({ field }) => (
          <ReactSelect
            isDisabled={!isAdmin}
            {...field}
            label={t('PROFILE.FARM.UNITS')}
            options={options}
          />
        )}
      />
      <Input label={t('PROFILE.FARM.CURRENCY')} value={userFarm.units.currency} disabled />
    </ProfileLayout>
  );
}
PureFarm.propTypes = {
  userFarm: PropTypes.shape({
    farm_name: PropTypes.string,
    farm_phone_number: PropTypes.string,
    address: PropTypes.string,
    units: PropTypes.shape({
      measurement: PropTypes.string,
      currency: PropTypes.string,
    }),
  }).isRequired,
  onSubmit: PropTypes.func,
};
