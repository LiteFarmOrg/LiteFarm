import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import PureResetPasswordAccount from '../../components/PasswordResetAccount';
import { resetPassword } from './saga';
import jwt from 'jsonwebtoken';
import ResetSuccessModal from '../../components/Modals/ResetPasswordSuccess';
import { useTranslation } from 'react-i18next';

function PasswordResetAccount({ history }) {
  const dispatch = useDispatch();
  const { reset_token } = history.location;
  const [email, setEmail] = useState('');
  const [showModal, setShowModal] = useState(false);
  const { i18n } = useTranslation();
  const onSubmit = (data) => {
    const { password } = data;
    dispatch(resetPassword({ reset_token, password, onPasswordResetSuccess }));
  };

  useEffect(() => {
    if (!reset_token) {
      history.push('/');
    } else {
      setEmail(getEmailFromToken(reset_token));
    }
  }, []);

  const getEmailFromToken = (reset_token) => {
    const decoded = jwt.decode(reset_token);
    if (localStorage.getItem('litefarm_lang') !== decoded.language_preference) {
      localStorage.setItem('litefarm_lang', decoded.language_preference);
      i18n.changeLanguage(localStorage.getItem('litefarm_lang'));
    }
    return decoded.email;
  };

  const [hasTimeoutStarted, setHasTimeoutStarted] = useState(false);
  const onPasswordResetSuccess = () => {
    setShowModal(true);
    setHasTimeoutStarted(true);
  };
  useEffect(() => {
    let timeout;
    if (hasTimeoutStarted) {
      timeout = setTimeout(() => {
        history.push('/farm_selection');
      }, 10000);
    }
    return () => clearTimeout(timeout);
  }, [hasTimeoutStarted]);

  const modalOnClick = () => {
    history.push('/farm_selection');
    setShowModal(false);
  };

  return (
    <>
      {reset_token && <PureResetPasswordAccount email={email} update={onSubmit} />}
      {showModal && <ResetSuccessModal onClick={modalOnClick} dismissModal={modalOnClick} />}
    </>
  );
}

export default PasswordResetAccount;
