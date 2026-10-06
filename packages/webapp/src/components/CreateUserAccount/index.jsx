import Form from '../Form';
import Button from '../Form/Button';
import Input from '../Form/Input';
import { useEffect, useState } from 'react';
import { Title } from '../Typography';
import PropTypes from 'prop-types';
import { Controller, useForm } from 'react-hook-form';
import { validatePasswordWithErrors } from '../Signup/utils';
import { PasswordError } from '../Form/Errors';
import ReactSelect from '../Form/ReactSelect';
import { useTranslation } from 'react-i18next';
import i18n from '../../locales/i18n';
import useLanguageOptions from '../../hooks/useLanguageOptions';

export default function PureCreateUserAccount({ onSignUp, email, onGoBack, isNotSSO = true }) {
  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    getValues,
    formState: { isDirty, isValid },
  } = useForm({
    mode: 'onTouched',
  });

  const NAME = 'name';
  const LANGUAGE = 'language';
  const PASSWORD = 'password';
  const password = watch(PASSWORD, undefined);
  const { t } = useTranslation(['translation', 'common']);
  const title = t('CREATE_USER.TITLE');

  const {
    isValid: isPasswordValid,
    hasNoSymbol,
    hasNoDigit,
    hasNoUpperCase,
    isTooShort,
  } = validatePasswordWithErrors(password);

  const languageOptions = useLanguageOptions();

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

  const disabled = !isDirty || !isValid || (isNotSSO && !isPasswordValid);

  const onSubmit = (data) => {
    data[LANGUAGE] = data?.[LANGUAGE]?.value || t('INVITE_USER.DEFAULT_LANGUAGE_VALUE');
    onSignUp({ ...data, email });
  };
  const onError = (data) => {};

  return (
    <Form
      onSubmit={handleSubmit(onSubmit, onError)}
      buttonGroup={
        <>
          {isNotSSO && ( // TODO LF-3798: Back button doesn't work in SSO as it will direct to Welcome Screen
            <Button onClick={onGoBack} color={'secondary'} type={'button'} fullLength>
              {t('common:GO_BACK')}
            </Button>
          )}
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
        onBlur={(e) => {
          e.target.value = e.target.value.trim();
        }}
      />
      <Controller
        data-cy="createUser-language"
        control={control}
        name={LANGUAGE}
        render={({ field: { onChange } }) => (
          <ReactSelect
            label={t('CREATE_USER.LANGUAGE_PREFERENCE')}
            options={languageOptions}
            onChange={(selectedOption) => {
              setLanguage(selectedOption.value);
              onChange(selectedOption);
            }}
            value={languageOptions[languageOption]}
            style={{ marginBottom: '28px' }}
            defaultValue={{
              value: t('CREATE_USER.DEFAULT_LANGUAGE_VALUE'),
              label: t('CREATE_USER.DEFAULT_LANGUAGE'),
            }}
          />
        )}
      />
      {isNotSSO && (
        <>
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
        </>
      )}
    </Form>
  );
}

PureCreateUserAccount.propTypes = {
  onSignUp: PropTypes.func.isRequired,
  onGoBack: PropTypes.func.isRequired,
  email: PropTypes.string.isRequired,
  isNotSSO: PropTypes.bool,
};
