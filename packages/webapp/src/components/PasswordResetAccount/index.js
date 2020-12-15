import Form from '../Form';
import Button from '../Form/Button';
import Input from '../Form/Input';
import React from 'react';
import { Title } from '../Typography';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { validatePasswordWithErrors } from '../Signup/utils';
import { PasswordError } from '../Form/Errors';
import { useTranslation } from 'react-i18next';

export default function PureResetPasswordAccount({ email, update}) {
  const { register, handleSubmit, watch } = useForm();
  const PASSWORD = 'password';
  const password = watch(PASSWORD, undefined);
  const { t } = useTranslation();
  const title = t('PASSWORD_RESET.NEW_ACCOUNT_TITLE');
  const {
    isValid,
    hasNoSymbol,
    hasNoDigit,
    hasNoUpperCase,
    isTooShort,
  } = validatePasswordWithErrors(password);
  const inputRegister = register({ validate: () => isValid });

  const disabled = !isValid;

  const onSubmit = (data) => {
    if (isValid) {
      update(data);
    }
  };
  const onError = (data) => {};

  return (
    <Form
      onSubmit={handleSubmit(onSubmit, onError)}
      buttonGroup={
        <>
          <Button disabled={disabled} type={'submit'} fullLength>
            {t('PASSWORD_RESET.NEW_ACCOUNT_BUTTON')}
          </Button>
        </>
      }
    >
      <Title style={{ marginBottom: '32px' }}>{title}</Title>
      <Input style={{ marginBottom: '28px' }} label={'Email'} disabled defaultValue={email} />
      <Input
        style={{ marginBottom: '28px' }}
        label={'New password'}
        type={PASSWORD}
        name={PASSWORD}
        inputRef={inputRegister}
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

PureResetPasswordAccount.prototype = {
  onLogin: PropTypes.func,
};
