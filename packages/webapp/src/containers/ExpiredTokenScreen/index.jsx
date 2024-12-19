import { useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PureExpiredTokenScreen from '../../components/ExpiredTokenScreen';
import ResetPassword from '../ResetPassword';
import { sendResetPasswordEmail } from '../CustomSignUp/saga';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

export default function ExpiredTokenScreen() {
  let navigate = useNavigate();
  let location = useLocation();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { translation_key, email } = location.state;
  const isInvalidPasswordResetToken = translation_key === 'RESET_PASSWORD';
  useLayoutEffect(() => {
    if (!isInvalidPasswordResetToken) {
      navigate('/');
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
