import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import PureCustomSignUp from '../../components/CustomSignUp';
import { customSignUp } from './saga';

function CustomSignUp() {
  const { register, handleSubmit, errors, watch } = useForm({ mode: 'onBlur' });
  const validEmailRegex = RegExp(/^$|^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i);
  const EMAIL = 'email';
  const email = watch(EMAIL, undefined);
  const required = watch(EMAIL, false);
  const refInput = register({ pattern: /^$|^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i });

  const disabled = !email || !required || !validEmailRegex.test(email);

  const dispatch = useDispatch();

  const onSubmit = (data) => {
    const { email } = data;
    dispatch(customSignUp(email));
  };

  const ssoSignUp = () => {};

  return (
    <PureCustomSignUp
      onSubmit={handleSubmit(onSubmit)}
      ssoSignUp={ssoSignUp}
      disabled={disabled}
      inputs={[
        {
          label: 'Enter your email address',
          inputRef: refInput,
          name: EMAIL,
          errors: errors[EMAIL] && 'Email is invalid',
          autoFocus: required,
        },
      ]}
    />
  );
}

export default CustomSignUp;
