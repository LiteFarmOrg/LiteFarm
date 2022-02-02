import Form from '../../Form';
import styles from './styles.module.scss';
import Button from '../../Form/Button';
import Input from '../../Form/Input';
import React, { useEffect, useState } from 'react';
import { Text, Title, Underlined } from '../../Typography';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { validatePasswordWithErrors } from '../utils';
import { PasswordError } from '../../Form/Errors';
import { useTranslation } from 'react-i18next';
import { NewReleaseCard } from '../../Card/NewReleaseCard/NewReleaseCard';

export default function PureEnterPasswordPage({
  title,
  onLogin,
  onGoBack,
  forgotPassword,
  isVisible,
  isChrome = true,
}) {
  const {
    register,
    handleSubmit,
    setError,
    watch,

    formState: { errors },
  } = useForm();
  const PASSWORD = 'password';
  const password = watch(PASSWORD);
  const {
    isValid,
    hasNoSymbol,
    hasNoDigit,
    hasNoUpperCase,
    isTooShort,
  } = validatePasswordWithErrors(password);
  const inputRegister = register(PASSWORD, { required: true });
  const [showErrors, setShowErrors] = useState(false);
  const { t } = useTranslation(['translation', 'common']);
  const showPasswordIncorrectError = () => {
    setError(PASSWORD, {
      type: 'manual',
      message: t('SIGNUP.PASSWORD_ERROR'),
    });
    setShowErrors(true);
  };
  const onSubmit = (data) => {
    onLogin(data.password, showPasswordIncorrectError);
  };
  const onError = (data) => {
    setShowErrors(true);
  };
  const wrongBrowserTop = t('SIGNUP.WRONG_BROWSER');
  const wrongBrowserBottom = t('SIGNUP.WRONG_BROWSER_BOTTOM');

  useEffect(() => {
    if (isVisible) {
      document.getElementById('password_input_to_focus')?.focus();
    }
  }, [isVisible]);

  return (
    <Form
      onSubmit={handleSubmit(onSubmit, onError)}
      buttonGroup={
        <>
          <Button color={'secondary'} type={'button'} fullLength onClick={onGoBack}>
            {t('common:BACK')}
          </Button>
          <Button type={'submit'} fullLength disabled={errors[PASSWORD] || !password}>
            {t('SIGNUP.SIGN_IN')}
          </Button>
        </>
      }
    >
      <Title style={{ marginBottom: '24px' }}>{title}</Title>
      <NewReleaseCard style={{ marginBottom: '28px' }} />
      {!isChrome && (
        <div className={styles.otherBrowserMessageTop}>
          {wrongBrowserTop}
          <div className={styles.otherBrowserMessageBottom}>{wrongBrowserBottom}</div>
        </div>
      )}
      <Input
        style={{ marginBottom: '28px' }}
        label={t('ENTER_PASSWORD.LABEL')}
        type={PASSWORD}
        icon={<Underlined onClick={forgotPassword}>{t('ENTER_PASSWORD.FORGOT')}</Underlined>}
        hookFormRegister={inputRegister}
        errors={errors[PASSWORD]?.message}
        id={'password_input_to_focus'}
      />
      {showErrors && (
        <div>
          <Text>{t('ENTER_PASSWORD.HINT')}</Text>
          <PasswordError
            hasNoDigit={hasNoDigit}
            hasNoSymbol={hasNoSymbol}
            hasNoUpperCase={hasNoUpperCase}
            isTooShort={isTooShort}
          />
        </div>
      )}
    </Form>
  );
}

PureEnterPasswordPage.prototype = {
  title: PropTypes.string,
  onLogin: PropTypes.func,
  onGoBack: PropTypes.func,
  forgotPassword: PropTypes.func,
  isChrome: PropTypes.bool,
};
