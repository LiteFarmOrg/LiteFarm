import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import PureCustomSignUp from '../../components/CustomSignUp';
import { customLoginWithPassword, customSignUp, customCreateUser } from './saga';
import history from '../../history';
import PureEnterPasswordPage from '../../components/Signup/EnterPasswordPage';

function CustomSignUp() {
  const { register, handleSubmit, errors, watch } = useForm({ mode: 'onBlur' });
  const validEmailRegex = RegExp(/^$|^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i);
  const EMAIL = 'email';
  const refInput = register({ pattern: /^$|^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i });
  const user = history.location.state;

  const dispatch = useDispatch();
  const defaultEmail = user && user.emailPage && user.email;
  const email = watch(EMAIL, defaultEmail);
  const disabled = !email || !validEmailRegex.test(email);
  const onSubmit = (data) => {
    const { email } = data;
    dispatch(customSignUp(email));
  };

  const onSignUp = (user) => {
    dispatch(customCreateUser(user));
  };

  const onLogin = (password) => {
    const email = user.email;
    dispatch(customLoginWithPassword({ email, password }));
  };

  const enterPasswordOnGoBack = () => {
    history.push({ pathname: '/', state: { email: user.email, emailPage: true } });
  };

  const hasUser = user && user.user_id;
  if (hasUser) {
    return (
      <PureEnterPasswordPage
        onLogin={onLogin}
        title={`Welcome back ${user.first_name}!`}
        onGoBack={enterPasswordOnGoBack}
      />
    );
  } else {
    return (
      <PureCustomSignUp
        onSubmit={handleSubmit(onSubmit)}
        disabled={disabled}
        inputs={[
          {
            label: 'Enter your email address',
            inputRef: refInput,
            name: EMAIL,
            errors: errors[EMAIL] && 'Email is invalid',
            defaultValue: defaultEmail ? defaultEmail : undefined,
          },
        ]}
      />
    );
  }
}

export default CustomSignUp;
