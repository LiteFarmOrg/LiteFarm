import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import PureResetPasswordAccount from '../../components/PasswordResetAccount';
import { resetPassword, validateToken } from './saga';
import jwt from 'jsonwebtoken';
import Callback from '../../components/Callback';
import ResetSuccessModal from '../../components/Modals/ResetPasswordSuccess';

function PasswordResetAccount({ history }) {
  const dispatch = useDispatch();
  const params = new URLSearchParams(history.location.search.substring(1));
  const token = params.get('reset_token');
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState(undefined);
  const [showModal, setShowModal] = useState(false);
  const onSubmit = (data) => {
    const { password } = data;
    dispatch(resetPassword({ token, password, onPasswordResetSuccess }));
  };

  useEffect(() => {
    dispatch(validateToken({ token, setIsValid }));
    setEmail(getEmailFromToken(token));
  }, []);

  function getEmailFromToken(token) {
    const decoded = jwt.decode(token);
    localStorage.setItem('litefarm_lang', decoded.language_preference);
    return decoded.email;
  }

  const onPasswordResetSuccess = () => {
    setShowModal(true);
    setTimeout(() => {
      history.push('/farm_selection');
    }, 2000);
  };

  const modalOnClick = () => {
    history.push('/farm_selection');
    setShowModal(false);
  };

  return (
    <>
      {!isValid && <Callback />}
      {isValid && <PureResetPasswordAccount email={email} update={onSubmit} />}
      {showModal && <ResetSuccessModal onClick={modalOnClick} dismissModal={modalOnClick} />}
    </>
  );
}

export default PasswordResetAccount;
