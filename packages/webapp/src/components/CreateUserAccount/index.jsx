import Form from '../Form';
import Button from '../Form/Button';
import Input from '../Form/Input';
import React, { useEffect, useState } from 'react';
import { Title } from '../Typography';
import PropTypes from 'prop-types';
import { Controller, useForm } from 'react-hook-form';
import { validatePasswordWithErrors } from '../Signup/utils';
import { PasswordError } from '../Form/Errors';
import ReactSelect from '../Form/ReactSelect';
import { useTranslation } from 'react-i18next';
import i18n from '../../locales/i18n';

export default function PureCreateUserAccount({ onSignUp, email, onGoBack }) {
  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,

    formState: { isDirty, isValid, errors },
  } = useForm({
    mode: 'onTouched',
  });

  const NAME = 'name';
  const GENDER = 'gender';
  const LANGUAGE = 'language';
  const BIRTHYEAR = 'birth_year';
  const PASSWORD = 'password';
  const password = watch(PASSWORD, undefined);
  const { t } = useTranslation(['translation', 'common', 'gender']);
  const title = t('CREATE_USER.TITLE');

  const {
    isValid: isPasswordValid,
    hasNoSymbol,
    hasNoDigit,
    hasNoUpperCase,
    isTooShort,
  } = validatePasswordWithErrors(password);

  const genderOptions = [
    { value: 'MALE', label: t('gender:MALE') },
    { value: 'FEMALE', label: t('gender:FEMALE') },
    { value: 'OTHER', label: t('gender:OTHER') },
    { value: 'PREFER_NOT_TO_SAY', label: t('gender:PREFER_NOT_TO_SAY') },
  ];

  const languageOptions = [
    { value: 'en', label: t('PROFILE.ACCOUNT.ENGLISH') },
    { value: 'es', label: t('PROFILE.ACCOUNT.SPANISH') },
    { value: 'pt', label: t('PROFILE.ACCOUNT.PORTUGUESE') },
    { value: 'fr', label: t('PROFILE.ACCOUNT.FRENCH') },
  ];

  const getLanguageOption = (language) => {
    return languageOptions.findIndex((object) => object.value === language);
  };

  const browser_langauge = navigator.language.includes('-')
    ? navigator.language.split('-')[0]
    : navigator.language;

  const [language, setLanguage] = useState(browser_langauge);
  const [languageOption, setLanguageOption] = useState(getLanguageOption(language));

  useEffect(() => {
    setLanguageOption(getLanguageOption(language));
    i18n.changeLanguage(language);
    localStorage.setItem('litefarm_lang', language);
  }, [language]);

  const disabled = !isDirty || !isValid || !isPasswordValid;

  const onSubmit = (data) => {
    data[GENDER] = data?.[GENDER]?.value || 'PREFER_NOT_TO_SAY';
    data[LANGUAGE] = data?.[LANGUAGE]?.value || t('INVITE_USER.DEFAULT_LANGUAGE_VALUE');
    onSignUp({ ...data, email });
  };
  const onError = (data) => {};

  return (
    <Form
      onSubmit={handleSubmit(onSubmit, onError)}
      buttonGroup={
        <>
          <Button onClick={onGoBack} color={'secondary'} type={'button'} fullLength>
            {t('common:BACK')}
          </Button>
          <Button data-cy="createUser-create" disabled={disabled} type={'submit'} fullLength>
            {t('CREATE_USER.CREATE_BUTTON')}
          </Button>
        </>
      }
    >
      <Title style={{ marginBottom: '32px' }}>{title}</Title>
      <Input
        data-cy="createUser-email"
        style={{ marginBottom: '28px' }}
        label={t('CREATE_USER.EMAIL')}
        disabled
        defaultValue={email}
      />
      <Input
        data-cy="createUser-fullName"
        style={{ marginBottom: '28px' }}
        label={t('CREATE_USER.FULL_NAME')}
        placeholder={'e.g. Juan Perez'}
        hookFormRegister={register(NAME, { required: true })}
      />
      <Controller
        data-cy="createUser-gender"
        control={control}
        name={GENDER}
        render={({ field: { onChange, onBlur, value } }) => (
          <ReactSelect
            label={t('CREATE_USER.GENDER')}
            options={genderOptions}
            onChange={onChange}
            value={value}
            toolTipContent={t('CREATE_USER.GENDER_TOOLTIP')}
            style={{ marginBottom: '28px' }}
            defaultValue={genderOptions[3]}
          />
        )}
      />
      <Controller
        data-cy="createUser-language"
        control={control}
        name={LANGUAGE}
        render={({ field: { onChange, onBlur, value } }) => (
          value && setLanguage(value.value),
          (
            <ReactSelect
              label={t('CREATE_USER.LANGUAGE_PREFERENCE')}
              options={languageOptions}
              onChange={onChange}
              value={languageOptions[languageOption]}
              style={{ marginBottom: '28px' }}
              defaultValue={{
                value: t('CREATE_USER.DEFAULT_LANGUAGE_VALUE'),
                label: t('CREATE_USER.DEFAULT_LANGUAGE'),
              }}
            />
          )
        )}
      />
      <Input
        data-cy="createUser-birthYear"
        label={t('CREATE_USER.BIRTH_YEAR')}
        type="number"
        hookFormRegister={register(BIRTHYEAR, {
          min: 1900,
          max: new Date().getFullYear(),
          valueAsNumber: true,
        })}
        toolTipContent={t('CREATE_USER.BIRTH_YEAR_TOOLTIP')}
        style={{ marginBottom: '28px' }}
        errors={
          errors[BIRTHYEAR] &&
          (errors[BIRTHYEAR].message ||
            `${t('CREATE_USER.BIRTH_YEAR_ERROR')} ${new Date().getFullYear()}`)
        }
        optional
      />
      <Input
        data-cy="createUser-password"
        style={{ marginBottom: '28px' }}
        label={t('CREATE_USER.PASSWORD')}
        type={PASSWORD}
        hookFormRegister={register(PASSWORD)}
      />
      <PasswordError
        hasNoDigit={hasNoDigit}
        hasNoSymbol={hasNoSymbol}
        hasNoUpperCase={hasNoUpperCase}
        isTooShort={isTooShort}
      />
    </Form>
  );
}

PureCreateUserAccount.prototype = {
  onLogin: PropTypes.func,
};
