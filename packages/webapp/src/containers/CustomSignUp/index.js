import React, { Suspense, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { CUSTOM_SIGN_UP, ENTER_PASSWORD_PAGE, CREATE_USER_ACCOUNT } from './constants';
import PureCustomSignUp from '../../components/CustomSignUp';
import { customLoginWithPassword, customSignUp, customCreateUser } from './saga';
import history from '../../history';
import Spinner from '../../components/Spinner';
import { useTranslation } from 'react-i18next';
import GoogleLoginButton from '../GoogleLoginButton';
const PureEnterPasswordPage = React.lazy(() => import('../../components/Signup/EnterPasswordPage'));
const PureCreateUserAccount = React.lazy(() => import('../../components/CreateUserAccount'));

function CustomSignUp() {
  const { register, handleSubmit, errors, watch, setValue, setError } = useForm({ mode: 'onBlur' });
  const { user, component: componentToShow } = history.location;
  const validEmailRegex = RegExp(/^$|^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i);
  const EMAIL = 'email';
  const refInput = register({ pattern: validEmailRegex });
  const dispatch = useDispatch();
  const email = watch(EMAIL, undefined);
  useEffect(() => {
    setValue(EMAIL, user?.email);
  }, [user, setValue]);
  const disabled = !email || !validEmailRegex.test(email);
  const showPureEnterPasswordPage = componentToShow === ENTER_PASSWORD_PAGE;
  const showPureCreateUserAccount = componentToShow === CREATE_USER_ACCOUNT;
  const { t } = useTranslation();
  const showSSOErrorAndRedirect = () => {
    setError(EMAIL, {
      type: 'manual',
      message: t('SIGNUP.SSO_ERROR'),
    });
    // TODO: Create custom google login button pass in React google login along with ref
    const googleLoginButton = document.getElementsByClassName('google-login-button')[0];
    googleLoginButton.click();
  };
  const onSubmit = (data) => {
    const { email } = data;
    dispatch(customSignUp({ email, showSSOError: showSSOErrorAndRedirect }));
  };

  const onSignUp = (user) => {
    dispatch(customCreateUser(user));
  };

  const onLogin = (password, showPasswordError) => {
    dispatch(customLoginWithPassword({ email, password, showPasswordError }));
  };

  const enterPasswordOnGoBack = () => {
    history.push({
      pathname: '/',
      component: CUSTOM_SIGN_UP,
      user: { email },
    });
  };
  const createUserAccountOnGoBack = () => {
    history.push({
      pathname: '/',
      component: CUSTOM_SIGN_UP,
      user: { email },
    });
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
          GoogleLoginButton={<GoogleLoginButton className={'google-login-button'} />}
          inputs={[
            {
              label: 'Enter your email address',
              inputRef: refInput,
              name: EMAIL,
              errors: errors[EMAIL] && (errors[EMAIL].message || 'Email is invalid'),
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
