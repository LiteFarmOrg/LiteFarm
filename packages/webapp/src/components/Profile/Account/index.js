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
  const disabled = !isDirty || !isValid;

  const options = [
    { label: t('PROFILE.ACCOUNT.ENGLISH'), value: 'en' },
    { label: t('PROFILE.ACCOUNT.SPANISH'), value: 'es' },
    { label: t('PROFILE.ACCOUNT.PORTUGUESE'), value: 'pt' },
    { label: t('PROFILE.ACCOUNT.FRENCH'), value: 'fr' },
  ];
  const language_preference = localStorage.getItem('litefarm_lang');
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
        name={userFarmEnum.first_name}
        label={t('PROFILE.ACCOUNT.FIRST_NAME')}
        inputRef={register({ required: true })}
      />
      <Input
        defaultValue={userFarm.last_name}
        name={userFarmEnum.last_name}
        label={t('PROFILE.ACCOUNT.LAST_NAME')}
        inputRef={register({ required: false })}
      />
      <Input
        defaultValue={userFarm.email}
        name={userFarmEnum.email}
        label={t('PROFILE.ACCOUNT.EMAIL')}
        disabled
        inputRef={register({ required: true })}
      />
      <Input
        type={'number'}
        defaultValue={userFarm.phone_number}
        name={userFarmEnum.phone_number}
        label={t('PROFILE.ACCOUNT.PHONE_NUMBER')}
        inputRef={register({ required: false })}
        onKeyDown={integerOnKeyDown}
      />
      <Input
        defaultValue={userFarm.user_address}
        name={userFarmEnum.user_address}
        label={t('PROFILE.ACCOUNT.USER_ADDRESS')}
        inputRef={register({ required: false })}
      />

      <Controller
        control={control}
        name={userFarmEnum.language_preference}
        label={t('PROFILE.ACCOUNT.LANGUAGE')}
        options={options}
        defaultValue={defaultLanguageOption}
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
