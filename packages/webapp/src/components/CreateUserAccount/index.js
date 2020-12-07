import Form from '../Form';
import Button from '../Form/Button';
import Input from '../Form/Input';
import React, { useState } from 'react';
import { Text, Title, Underlined } from '../Typography';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { validatePasswordWithErrors } from '../Signup/utils';
import { PasswordError } from '../Form/Errors';
import history from '../../history';
import { customCreateUser } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import {manualSignUpSelector} from '../../containers/CustomSignUp/signUpSlice';
import styles from './styles.scss'

export default function PureCreateUserAccount({ title = 'Create new user account' }) {
  const { register, handleSubmit, watch } = useForm();
  const PASSWORD = 'password';
  const NAME = 'name';
  const password = watch(PASSWORD, undefined);
  const required = watch(NAME, false);
  const name = watch(NAME, undefined);
  const dispatch = useDispatch();
  const email = useSelector(manualSignUpSelector);
  const {
    isValid,
    hasNoSymbol,
    hasNoDigit,
    hasNoUpperCase,
    isTooShort,
  } = validatePasswordWithErrors(password);
  const inputRegister = register({ validate: () => isValid });
  const [showErrors, setShowErrors] = useState(false);
  const refInput = register({ required: required });

  const disabled = !name || !password

  const goBack = () => {
      history.push({pathname: '/'})

  }

  const onSubmit = (data) => {
      if (isValid) {
          dispatch(customCreateUser(data))
      }
    // onLogin();
  };
  const onError = (data) => {
    setShowErrors(true);
  };



  return (
    <Form
      onSubmit={handleSubmit(onSubmit, onError)}
      buttonGroup={
        <>
          <Button onClick={goBack}  color={'secondary'} fullLength>
            Go Back
          </Button>
          <Button disabled={disabled} type={'submit'} fullLength>
            Sign In
          </Button>
        </>
      }
    >
      <Title style={{ marginBottom: '32px' }}>{title}</Title>
      <Input
        style={{ marginBottom: '28px'}}
        classes={styles.root}
        label={'Email'}
        disabled
        defaultValue={email.userEmail.email}
      />
        <Input
        style={{ marginBottom: '28px'}}
        label={'Full name'}
        name={NAME}
        inputRef={refInput}
      />
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

PureCreateUserAccount.prototype = {
  title: PropTypes.string,
  onLogin: PropTypes.func,
};
