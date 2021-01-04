import React, { Suspense, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import PureCustomSignUp from '../../components/CustomSignUp';
import {
  customLoginWithPassword,
  customSignUp,
  customCreateUser,
  sendResetPasswordEmail,
} from './saga';
import history from '../../history';
import Spinner from '../../components/Spinner';
import { useTranslation } from 'react-i18next';
import GoogleLoginButton from '../GoogleLoginButton';
import {
  CUSTOM_SIGN_UP,
  ENTER_PASSWORD_PAGE,
  CREATE_USER_ACCOUNT,
  inlineErrors,
} from './constants';
const ResetPassword = React.lazy(() => import('../ResetPassword'));
const PureEnterPasswordPage = React.lazy(() => import('../../components/Signup/EnterPasswordPage'));
const PureCreateUserAccount = React.lazy(() => import('../../components/CreateUserAccount'));

const navbarCoverStyle = {
  backgroundColor: 'white',
  zIndex: 1,
  transform: 'translateY(-76px)',
  height: '76px',
  position: 'fixed',
  width: '100%',
};

const PureCustomSignUpStyle = {
  form: {
    zIndex: 2,
  },
};

function CustomSignUp() {
  const { register, handleSubmit, errors, watch, setValue, setError } = useForm({ mode: 'onBlur' });
  const { user, component: componentToShow } = history.location;
  const params = new URLSearchParams(history.location.search.substring(1));
  const validEmailRegex = RegExp(/^$|^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i);
  const EMAIL = 'email';
  const refInput = register({ pattern: validEmailRegex });
  const dispatch = useDispatch();
  const email = watch(EMAIL, undefined);
  const [showResetModal, setShowResetModal] = useState(false);
  const disabled = !email || !validEmailRegex.test(email);
  const showPureEnterPasswordPage = componentToShow === ENTER_PASSWORD_PAGE;
  const showPureCreateUserAccount = componentToShow === CREATE_USER_ACCOUNT;
  const showPureCustomSignUp = !showPureCreateUserAccount && !showPureEnterPasswordPage;
  const { t, i18n } = useTranslation();

  const forgotPassword = () => {
    dispatch(sendResetPasswordEmail(email));
    setShowResetModal(true);
  };
  const dismissModal = () => {
    setShowResetModal(false);
  };
  useEffect(() => {
    setValue(EMAIL, user?.email || params.get('email'));
  }, [user, setValue]);

  useEffect(() => {
    if (
      componentToShow === ENTER_PASSWORD_PAGE &&
      i18n.language !== localStorage.getItem('litefarm_lang')
    ) {
      i18n.changeLanguage(localStorage.getItem('litefarm_lang'));
    }
  }, [componentToShow]);

  const showSSOErrorAndRedirect = (error) => {
    //OC: Dynamically setting the error is not an option because of the need to reflect the key on the translation file
    const allMessages = {
      sso: t('SIGNUP.SSO_ERROR'),
      expired: t('SIGNUP.EXPIRED_ERROR'),
      invited: t('SIGNUP.INVITED_ERROR'),
    };
    const message = allMessages[error];
    setError(EMAIL, {
      type: 'manual',
      message,
    });
    if (error === inlineErrors.sso) {
      // TODO: Create custom google login button pass in React google login along with ref
      const googleLoginButton = document.getElementsByClassName('google-login-button')[0];
      googleLoginButton.click();
    }
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
            forgotPassword={forgotPassword}
          />
          {showResetModal && <ResetPassword email={email} dismissModal={dismissModal} />}
        </Hidden>
        <Hidden isVisible={showPureCreateUserAccount}>
          <PureCreateUserAccount
            onSignUp={onSignUp}
            onGoBack={createUserAccountOnGoBack}
            email={email}
          />
        </Hidden>
      </Suspense>
      <Hidden isVisible={showPureCustomSignUp}>
        <div style={navbarCoverStyle} />
        <PureCustomSignUp
          classes={PureCustomSignUpStyle}
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
