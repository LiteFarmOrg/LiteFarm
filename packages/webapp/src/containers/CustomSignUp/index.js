import React, { Suspense, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import PureCustomSignUp from '../../components/CustomSignUp';
import { customLoginWithPassword, customSignUp, customCreateUser } from './saga';
import history from '../../history';
import Spinner from '../../components/Spinner';
const PureEnterPasswordPage = React.lazy(() => import('../../components/Signup/EnterPasswordPage'));
const PureCreateUserAccount = React.lazy(() => import('../../components/CreateUserAccount'));

function CustomSignUp() {
  const { register, handleSubmit, errors, watch, setValue } = useForm({ mode: 'onBlur' });
  const validEmailRegex = RegExp(/^$|^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i);
  const EMAIL = 'email';
  const refInput = register({ pattern: /^$|^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i });
  const dispatch = useDispatch();
  const user = history.location?.state?.user;
  const email = watch(EMAIL, undefined);
  useEffect(() => {
    setValue(EMAIL, user?.email);
  }, [user, setValue]);
  const disabled = !email || !validEmailRegex.test(email);
  const componentToShow = history.location?.state?.component;
  const showPureEnterPasswordPage = componentToShow === 'PureEnterPasswordPage';
  const showPureCreateUserAccount = componentToShow === 'PureCreateUserAccount';
  const onSubmit = (data) => {
    const { email } = data;
    dispatch(customSignUp(email));
  };

  const onSignUp = (user) => {
    dispatch(customCreateUser(user));
  };

  const onLogin = (password) => {
    console.log('login');
    dispatch(customLoginWithPassword({ email, password }));
  };

  const enterPasswordOnGoBack = () => {
    history.push({ pathname: '/', state: { component: 'PureCustomSignUp', user: { email } } });
  };
  const createUserAccountOnGoBack = () => {
    history.push({ pathname: '/', state: { component: 'PureCustomSignUp', user: { email } } });
  };
  return (
    <>
      <Suspense fallback={Spinner}>
        <Hidden isVisible={showPureEnterPasswordPage}>
          <PureEnterPasswordPage
            onLogin={onLogin}
            title={`Welcome back ${user?.first_name}!`}
            onGoBack={enterPasswordOnGoBack}
          />
        </Hidden>
        <Hidden isVisible={showPureCreateUserAccount}>
          <PureCreateUserAccount
            onSignUp={onSignUp}
            onGoBack={createUserAccountOnGoBack}
            email={email}
          />
        </Hidden>
      </Suspense>
      <Hidden isVisible={!showPureCreateUserAccount && !showPureEnterPasswordPage}>
        <PureCustomSignUp
          onSubmit={handleSubmit(onSubmit)}
          disabled={disabled}
          inputs={[
            {
              label: 'Enter your email address',
              inputRef: refInput,
              name: EMAIL,
              errors: errors[EMAIL] && 'Email is invalid',
            },
          ]}
        />
      </Hidden>
    </>
  );
}

export default CustomSignUp;

function Hidden({ children, isVisible }) {
  return (
    <div
      style={{
        display: isVisible ? 'flex' : 'none',
        height: '100%',
        flexDirection: 'column',
        flex: 1,
      }}
    >
      {children}
    </div>
  );
}
