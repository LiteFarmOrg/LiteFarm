import Input, { integerOnKeyDown } from '../../Form/Input';
import { Controller, useForm } from 'react-hook-form';
import { userFarmEnum } from '../../../containers/constants';
import ReactSelect from '../../Form/ReactSelect';
import { useTranslation } from 'react-i18next';
import React, { useMemo } from 'react';
import Button from '../../Form/Button';
import PropTypes from 'prop-types';
import ProfileLayout from '../ProfileLayout';
import { getLanguageFromLocalStorage } from '../../../util';

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
  const disabled = !isDirty || !isValid;

  const options = [
    { label: t('PROFILE.ACCOUNT.ENGLISH'), value: 'en' },
    { label: t('PROFILE.ACCOUNT.SPANISH'), value: 'es' },
    { label: t('PROFILE.ACCOUNT.PORTUGUESE'), value: 'pt' },
    { label: t('PROFILE.ACCOUNT.FRENCH'), value: 'fr' },
  ];
  const language_preference = getLanguageFromLocalStorage();
  const defaultLanguageOption = useMemo(() => {
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
        defaultValue={userFarm.first_name}
        label={t('PROFILE.ACCOUNT.FIRST_NAME')}
        hookFormRegister={register(userFarmEnum.first_name, { required: true })}
      />
      <Input
        defaultValue={userFarm.last_name}
        label={t('PROFILE.ACCOUNT.LAST_NAME')}
        hookFormRegister={register(userFarmEnum.last_name, { required: false })}
      />
      <Input
        defaultValue={userFarm.email}
        label={t('PROFILE.ACCOUNT.EMAIL')}
        disabled
        hookFormRegister={register(userFarmEnum.email, { required: true })}
      />
      <Input
        type={'number'}
        defaultValue={userFarm.phone_number}
        label={t('PROFILE.ACCOUNT.PHONE_NUMBER')}
        hookFormRegister={register(userFarmEnum.phone_number, { required: false })}
        onKeyDown={integerOnKeyDown}
      />
      <Input
        defaultValue={userFarm.user_address}
        label={t('PROFILE.ACCOUNT.USER_ADDRESS')}
        hookFormRegister={register(userFarmEnum.user_address, { required: false })}
      />

      <Controller
        control={control}
        name={userFarmEnum.language_preference}
        label={t('PROFILE.ACCOUNT.LANGUAGE')}
        options={options}
        defaultValue={defaultLanguageOption}
        render={({ field }) => <ReactSelect {...field} />}
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
