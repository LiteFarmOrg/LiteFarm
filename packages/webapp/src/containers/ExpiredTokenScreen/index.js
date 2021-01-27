import React, { useEffect, useLayoutEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import PureExpiredTokenScreen from '../../components/ExpiredTokenScreen';
import ResetPassword from '../ResetPassword';
import { sendResetPasswordEmail } from '../CustomSignUp/saga';
import { useDispatch } from 'react-redux';

export default function ExpiredTokenScreen({ history }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { translation_key, email } = history.location.state;
  const isInvalidPasswordResetToken = translation_key === 'RESET_PASSWORD';
  useLayoutEffect(() => {
    if (!isInvalidPasswordResetToken) {
      history.push('/');
    }
  }, []);
  const [showResetModal, setShowResetModal] = useState(false);
  const dismissModal = () => {
    setShowResetModal(false);
  };
  const forgotPassword = () => {
    dispatch(sendResetPasswordEmail(email));
    setShowResetModal(true);
  };
  return (
    <>
      <PureExpiredTokenScreen
        text={t(`EXPIRED_TOKEN.${translation_key || 'DEFAULT'}`)}
        linkText={t(`EXPIRED_TOKEN.RESET_PASSWORD_LINK`)}
        forgotPassword={forgotPassword}
        email={email}
      />
      {showResetModal && <ResetPassword email={email} dismissModal={dismissModal} />}
    </>
  );
}

ExpiredTokenScreen.prototype = {
  history: PropTypes.object,
};
