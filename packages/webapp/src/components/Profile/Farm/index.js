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
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    control,
    formState: { isValid, isDirty },
  } = useForm({
    mode: 'onChange',
  });
  const MEASUREMENT = 'measurement';
  const CURRENCY = 'currency';
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
        defaultValue={userFarm.farm_name}
        name={userFarmEnum.farm_name}
        label={t('PROFILE.FARM.FARM_NAME')}
        inputRef={register({ required: true })}
      />
      <Input
        defaultValue={userFarm.farm_phone_number}
        name={userFarmEnum.farm_phone_number}
        label={t('PROFILE.FARM.PHONE_NUMBER')}
        inputRef={register({ required: false })}
        type={'number'}
        onKeyDown={integerOnKeyDown}
      />
      <Input
        defaultValue={userFarm.address}
        name={userFarmEnum.address}
        label={t('PROFILE.FARM.ADDRESS')}
        inputRef={register({ required: false })}
        disabled
      />
      <Controller
        control={control}
        name={MEASUREMENT}
        label={t('PROFILE.FARM.UNITS')}
        options={options}
        defaultValue={defaultMeasurementOption}
        as={<ReactSelect />}
      />
      <Input
        defaultValue={userFarm.units.currency}
        name={CURRENCY}
        label={t('PROFILE.FARM.CURRENCY')}
        inputRef={register({ required: false })}
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
