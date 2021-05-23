import Input, { integerOnKeyDown } from '../../Form/Input';
import { Controller, useForm } from 'react-hook-form';
import { userFarmEnum } from '../../../containers/constants';
import ReactSelect from '../../Form/ReactSelect';
import { useTranslation } from 'react-i18next';
import React from 'react';
import Button from '../../Form/Button';
import PropTypes from 'prop-types';
import ProfileLayout from '../ProfileLayout';
import useDefaultOption from '../../Form/useDefaultOption';

export default function PureFarm({ userFarm, onSubmit }) {
  const MEASUREMENT = 'measurement';
  const CURRENCY = 'currency';
  const getDefaultValues = () => {
    const defaultValues = {};
    defaultValues[userFarmEnum.farm_name] = userFarm.farm_name;
    defaultValues[userFarmEnum.farm_phone_number] = userFarm.farm_phone_number;
    defaultValues[userFarmEnum.address] = userFarm.address;
    defaultValues[CURRENCY] = userFarm.units.currency;
    return defaultValues;
  };
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    control,
    formState: { isValid, isDirty },
  } = useForm({
    mode: 'onChange',
    defaultValues: getDefaultValues(),
  });

  const disabled = !isDirty || !isValid;

  const options = [
    { label: t('PROFILE.FARM.METRIC'), value: 'metric' },
    { label: t('PROFILE.FARM.IMPERIAL'), value: 'imperial' },
  ];
  const defaultMeasurementOption = useDefaultOption(options, userFarm.units.measurement);
  return (
    <ProfileLayout
      onSubmit={handleSubmit(onSubmit)}
      buttonGroup={
        <Button fullLength type={'submit'} disabled={disabled}>
          {t('common:SAVE')}
        </Button>
      }
    >
      <Input
        label={t('PROFILE.FARM.FARM_NAME')}
        hookFormRegister={register(userFarmEnum.farm_name, { required: true })}
      />
      <Input
        label={t('PROFILE.FARM.PHONE_NUMBER')}
        hookFormRegister={register(userFarmEnum.farm_phone_number, { required: false })}
        type={'number'}
        onKeyDown={integerOnKeyDown}
      />
      <Input
        label={t('PROFILE.FARM.ADDRESS')}
        hookFormRegister={register(userFarmEnum.address, { required: false })}
        disabled
      />
      <Controller
        control={control}
        name={MEASUREMENT}
        defaultValue={defaultMeasurementOption}
        render={({ field }) => (
          <ReactSelect {...field} label={t('PROFILE.FARM.UNITS')} options={options} />
        )}
      />
      <Input
        label={t('PROFILE.FARM.CURRENCY')}
        hookFormRegister={register(CURRENCY, { required: false })}
        disabled
      />
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
