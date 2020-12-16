import Form from '../../Form';
import Button from '../../Form/Button';
import Input from '../../Form/Input';
import React, { useState } from 'react';
import { Text, Title, Underlined } from '../../Typography';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { validatePasswordWithErrors } from '../utils';
import { PasswordError } from '../../Form/Errors';
import { useTranslation } from 'react-i18next';

export default function PureEnterPasswordPage({ title, onLogin, onGoBack, forgotPassword }) {
  const { register, handleSubmit, errors, setError, watch } = useForm();
  const PASSWORD = 'password';
  const password = watch(PASSWORD);
  const {
    isValid,
    hasNoSymbol,
    hasNoDigit,
    hasNoUpperCase,
    isTooShort,
  } = validatePasswordWithErrors(password);
  const inputRegister = register({ required: true });
  const [showErrors, setShowErrors] = useState(false);
  const { t } = useTranslation();
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
  return (
    <Form
      onSubmit={handleSubmit(onSubmit, onError)}
      buttonGroup={
        <>
          <Button color={'secondary'} type={'button'} fullLength onClick={onGoBack}>
            {t('common:BACK')}
          </Button>
          <Button type={'submit'} fullLength disabled={errors[PASSWORD]}>
            {t('SIGNUP.SIGN_IN')}
          </Button>
        </>
      }
    >
      <Title style={{ marginBottom: '32px' }}>{title}</Title>
      <Input
        style={{ marginBottom: '28px' }}
        label={'Password'}
        type={PASSWORD}
        name={PASSWORD}
        icon={<Underlined onClick={forgotPassword}>Forgot password?</Underlined>}
        inputRef={inputRegister}
        errors={errors[PASSWORD]?.message}
      />
      {showErrors && (
        <div>
          <Text>Hint</Text>
          <PasswordError
            hasNoDigit={hasNoDigit}
            hasNoSymbol={hasNoSymbol}
            hasNoUpperCase={hasNoUpperCase}
            isTooShort={isTooShort}
          />
        </div>
      )}
      <div></div>
    </Form>
  );
}

PureEnterPasswordPage.prototype = {
  title: PropTypes.string,
  onLogin: PropTypes.func,
  onGoBack: PropTypes.func,
};
