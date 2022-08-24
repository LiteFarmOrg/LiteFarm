import Input, { integerOnKeyDown, getInputErrors } from '../../Form/Input';
import { Controller, useForm } from 'react-hook-form';
import { userFarmEnum } from '../../../containers/constants';
import ReactSelect from '../../Form/ReactSelect';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useRef } from 'react';
import Button from '../../Form/Button';
import PropTypes from 'prop-types';
import ProfileLayout from '../ProfileLayout';

const useLanguageOptions = (language_preference) => {
  const { t } = useTranslation();
  const languageOptionMap = {
    en: { label: t('PROFILE.ACCOUNT.ENGLISH'), value: 'en' },
    es: { label: t('PROFILE.ACCOUNT.SPANISH'), value: 'es' },
    pt: { label: t('PROFILE.ACCOUNT.PORTUGUESE'), value: 'pt' },
    fr: { label: t('PROFILE.ACCOUNT.FRENCH'), value: 'fr' },
  };
  const languageOptions = Object.values(languageOptionMap);
  const languagePreferenceOptionRef = useRef();
  languagePreferenceOptionRef.current = languageOptionMap[language_preference];
  return { languageOptionMap, languageOptions, languagePreferenceOptionRef };
};

export default function PureAccount({ userFarm, onSubmit, history, isAdmin }) {
  const { languageOptions, languagePreferenceOptionRef } = useLanguageOptions(
    userFarm.language_preference,
  );
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { isValid, isDirty, errors },
  } = useForm({
    mode: 'onChange',
    defaultValues: userFarm,
    shouldUnregister: true,
  });
  useEffect(() => {
    setValue(userFarmEnum.language_preference, null, { shouldValidate: false, shouldDirty: false });
    setTimeout(() => {
      setValue(userFarmEnum.language_preference, languagePreferenceOptionRef.current, {
        shouldValidate: false,
        shouldDirty: false,
      });
    }, 100);
  }, [userFarm.language_preference]);
  const disabled = !isDirty || !isValid;
  return (
    <ProfileLayout
      onSubmit={handleSubmit(onSubmit)}
      history={history}
      buttonGroup={
        <Button fullLength type={'submit'} disabled={disabled}>
          {t('common:SAVE')}
        </Button>
      }
    >
      <Input
        label={t('PROFILE.ACCOUNT.FIRST_NAME')}
        hookFormRegister={register(userFarmEnum.first_name, {
          required: true,
          pattern: /^[A-Za-zÀ-ÖØ-öø-ÿ]+/g,
          maxLength: {
            value: 255,
            message: t('PROFILE.ACCOUNT.NAME_LENGTH_ERROR'),
          },
        })}
        errors={getInputErrors(errors, userFarmEnum.first_name)}
      />
      <Input
        label={t('PROFILE.ACCOUNT.LAST_NAME')}
        hookFormRegister={register(userFarmEnum.last_name, {
          required: false,
          pattern: /^[A-Za-zÀ-ÖØ-öø-ÿ]+/g,
          maxLength: {
            value: 255,
            message: t('PROFILE.ACCOUNT.NAME_LENGTH_ERROR'),
          },
        })}
        errors={getInputErrors(errors, userFarmEnum.last_name)}
      />
      <Input
        label={t('PROFILE.ACCOUNT.EMAIL')}
        disabled
        hookFormRegister={register(userFarmEnum.email)}
      />
      <Input
        type={'number'}
        label={t('PROFILE.ACCOUNT.PHONE_NUMBER')}
        hookFormRegister={register(userFarmEnum.phone_number, { required: false })}
        onKeyDown={integerOnKeyDown}
      />
      <Controller
        control={control}
        name={userFarmEnum.language_preference}
        render={({ field }) => (
          <ReactSelect label={t('PROFILE.ACCOUNT.LANGUAGE')} options={languageOptions} {...field} />
        )}
      />
      <Input
        label={t('PROFILE.ACCOUNT.USER_ADDRESS')}
        hookFormRegister={register(userFarmEnum.user_address, { required: false })}
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
