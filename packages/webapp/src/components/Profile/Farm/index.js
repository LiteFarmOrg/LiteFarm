import Input, { integerOnKeyDown } from '../../Form/Input';
import { Controller, useForm } from 'react-hook-form';
import { userFarmEnum } from '../../../containers/constants';
import ReactSelect from '../../Form/ReactSelect';
import { useTranslation } from 'react-i18next';
import React, { useMemo } from 'react';
import Button from '../../Form/Button';
import PropTypes from 'prop-types';
import ProfileLayout from '../ProfileLayout';

export default function PureAccount({ userFarm, onSubmit }) {
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
    { label: t('PROFILE.ACCOUNT.ENGLISH'), value: 'metric' },
    { label: t('PROFILE.ACCOUNT.SPANISH'), value: 'imperial' },
  ];
  const language_preference = localStorage.getItem('litefarm_lang');
  const defaultMeasurementOption = useMemo(() => {
    for (const option of options) {
      if (language_preference.includes(option.value)) return option;
    }
  }, [language_preference]);
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
      <Controller
        control={control}
        name={CURRENCY}
        label={t('PROFILE.FARM.CURRENCY')}
        options={[{ label: userFarm.units.currency, value: userFarm.units.currency }]}
        defaultValue={{ label: userFarm.units.currency, value: userFarm.units.currency }}
        isDisabled={true}
        as={<ReactSelect />}
      />
    </ProfileLayout>
  );
}
PureAccount.propTypes = {
  userFarm: PropTypes.shape({
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    email: PropTypes.string,
    phone_number: PropTypes.string,
    user_address: PropTypes.string,
  }).isRequired,
  onSubmit: PropTypes.func,
};
