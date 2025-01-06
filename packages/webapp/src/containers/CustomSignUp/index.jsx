import React, { Suspense, useEffect, useState, useLayoutEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import PureCustomSignUp from '../../components/CustomSignUp';
import {
  customCreateUser,
  customLoginWithPassword,
  customSignUp,
  sendResetPasswordEmail,
} from './saga';
import Spinner from '../../components/Spinner';
import { useTranslation } from 'react-i18next';
import GoogleLoginButton from '../GoogleLoginButton';
import { CREATE_USER_ACCOUNT, CUSTOM_SIGN_UP, ENTER_PASSWORD_PAGE } from './constants';
import { isChrome } from '../../util';
import { getLanguageFromLocalStorage } from '../../util/getLanguageFromLocalStorage';
import { customSignUpErrorKeySelector, setCustomSignUpErrorKey } from '../customSignUpSlice';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

const ResetPassword = React.lazy(() => import('../ResetPassword'));
const PureEnterPasswordPage = React.lazy(() => import('../../components/Signup/EnterPasswordPage'));
const PureCreateUserAccount = React.lazy(() => import('../../components/CreateUserAccount'));

const PureCustomSignUpStyle = {
  form: {
    zIndex: 2,
  },
};

function CustomSignUp({ setAuth }) {
  let navigate = useNavigate();
  let location = useLocation();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm({
    mode: 'onTouched',
  });
  const { user, component: componentToShow } = location?.state || {};
  const validEmailRegex = RegExp(/^$|^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$/i);
  const EMAIL = 'email';
  const emailRegister = register(EMAIL, { pattern: validEmailRegex });
  const dispatch = useDispatch();
  const email = watch(EMAIL, undefined);
  const [showResetModal, setShowResetModal] = useState(false);
  const disabled = !email || !validEmailRegex.test(email);
  const showPureEnterPasswordPage = componentToShow === ENTER_PASSWORD_PAGE;
  const showPureCreateUserAccount = componentToShow === CREATE_USER_ACCOUNT;
  const showPureCustomSignUp = !showPureCreateUserAccount && !showPureEnterPasswordPage;
  const { t, i18n, ready } = useTranslation(['translation', 'common'], { useSuspense: false });

  const customSignUpErrorKey = useSelector(customSignUpErrorKeySelector);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const forgotPassword = () => {
    dispatch(sendResetPasswordEmail(email));
    setShowResetModal(true);
  };
  const dismissModal = () => {
    setShowResetModal(false);
  };
  useEffect(() => {
    const params = new URLSearchParams(location.search.substring(1));
    setValue(EMAIL, user?.email || params.get('email'));
  }, [user, setValue, ready]);

  useEffect(() => {
    if (
      componentToShow === ENTER_PASSWORD_PAGE &&
      i18n.language !== getLanguageFromLocalStorage()
    ) {
      i18n.changeLanguage(getLanguageFromLocalStorage());
    }
  }, [componentToShow]);

  useLayoutEffect(() => {
    dispatch(setCustomSignUpErrorKey({ key: null }));
  }, []);

  useEffect(() => {
    if (!customSignUpErrorKey) return;
    const message = t(customSignUpErrorKey);

    setError(EMAIL, {
      type: 'manual',
      message,
    });
  }, [customSignUpErrorKey, errors]);

  useEffect(() => {
    if (!componentToShow) {
      navigate('/', { replace: true, state: { user: { email }, component: CUSTOM_SIGN_UP } });
    }
  }, [componentToShow, email]);

  const onSubmit = (data) => {
    const { email } = data;
    setSubmittedEmail(email);
    dispatch(customSignUp({ email: email?.toLowerCase() }));
  };

  const onSignUp = (user) => {
    dispatch(customCreateUser({ setAuth, user }));
  };

  const onLogin = (password, showPasswordError) => {
    dispatch(customLoginWithPassword({ email, password, showPasswordError, setAuth }));
  };

  const enterPasswordOnGoBack = () => {
    navigate('/', { state: { user: { email }, component: CUSTOM_SIGN_UP } });
  };
  const createUserAccountOnGoBack = () => {
    navigate('/', { state: { component: CUSTOM_SIGN_UP, user: { email } } });
  };

  const errorMessage = location.state?.error;
  return (
    <>
      <Suspense fallback={<Spinner />}>
        <Hidden isVisible={showPureEnterPasswordPage}>
          <PureEnterPasswordPage
            onLogin={onLogin}
            title={`${t('SIGNUP.WELCOME_BACK')} ${user?.first_name}!`}
            onGoBack={enterPasswordOnGoBack}
            forgotPassword={forgotPassword}
            isChrome={isChrome()}
            isVisible={showPureEnterPasswordPage}
            key={showPureEnterPasswordPage} // unmount the component when visibility is changed
          />
          {showResetModal && <ResetPassword email={email} dismissModal={dismissModal} />}
        </Hidden>
        <Hidden isVisible={showPureCreateUserAccount}>
          <PureCreateUserAccount
            onSignUp={onSignUp}
            onGoBack={createUserAccountOnGoBack}
            email={submittedEmail}
          />
        </Hidden>
      </Suspense>
      <Hidden isVisible={showPureCustomSignUp}>
        <PureCustomSignUp
          classes={PureCustomSignUpStyle}
          onSubmit={handleSubmit(onSubmit)}
          disabled={disabled}
          GoogleLoginButton={
            <GoogleLoginButton className={'google-login-button'} setAuth={setAuth} />
          }
          isChrome={isChrome()}
          errorMessage={errorMessage}
          inputs={[
            {
              label: t('SIGNUP.ENTER_EMAIL'),
              hookFormRegister: emailRegister,
              errors: errors[EMAIL] && (errors[EMAIL].message || t('SIGNUP.EMAIL_INVALID')),
              onChange: () => dispatch(setCustomSignUpErrorKey({ key: null })),
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
