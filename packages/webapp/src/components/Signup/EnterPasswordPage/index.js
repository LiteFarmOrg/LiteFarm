import Form from '../../Form';
import Button from '../../Form/Button';
import Input from '../../Form/Input';
import React, { useState } from 'react';
import { Text, Title, Underlined } from '../../Typography';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { validatePasswordWithErrors } from '../utils';
import { PasswordError } from '../../Form/Errors';
import { useSelector } from 'react-redux';
import { manualSignUpSelector } from '../../../containers/CustomSignUp/signUpSlice';

export default function PureEnterPasswordPage({ title = 'Welcome back', onLogin }) {
  const { register, handleSubmit, watch } = useForm();
  const PASSWORD = 'password';
  const password = watch(PASSWORD, undefined);
  const {
    isValid,
    hasNoSymbol,
    hasNoDigit,
    hasNoUpperCase,
    isTooShort,
  } = validatePasswordWithErrors(password);
  const inputRegister = register({ validate: () => isValid });
  const [showErrors, setShowErrors] = useState(false);
  const userName = useSelector(manualSignUpSelector);

  const onSubmit = (data) => {
    console.log(data, isValid, hasNoSymbol, hasNoDigit, hasNoUpperCase, isTooShort);
    onLogin();
  };
  const onError = (data) => {
    console.log(data, isValid, hasNoSymbol, hasNoDigit, hasNoUpperCase, isTooShort);
    setShowErrors(true);
  };
  return (
    <Form
      onSubmit={handleSubmit(onSubmit, onError)}
      buttonGroup={
        <>
          <Button color={'secondary'} fullLength>
            Go Back
          </Button>
          <Button type={'submit'} fullLength>
            Sign In
          </Button>
        </>
      }
    >
      <Title style={{ marginBottom: '32px' }}>{title + ',' + ' ' + userName.userName}</Title>
      <Input
        style={{ marginBottom: '28px' }}
        label={'Password'}
        type={PASSWORD}
        name={PASSWORD}
        icon={<Underlined>Forgot password?</Underlined>}
        inputRef={inputRegister}
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
    </Form>
  );
}

PureEnterPasswordPage.prototype = {
  title: PropTypes.string,
  onLogin: PropTypes.func,
};
