import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import PureInviteSignUp from '../../components/InviteSignUp';
// import { resetPassword } from './saga';
import jwt from 'jsonwebtoken';
// import ResetSuccessModal from '../../components/Modals/ResetPasswordSuccess';
import { useTranslation } from 'react-i18next';

function InviteSignUp({ history }) {
  const dispatch = useDispatch();
  const { token } = history.location;
  const [email, setEmail] = useState('');
  // const [showModal, setShowModal] = useState(false);
  const { i18n } = useTranslation();
  // const onSubmit = (data) => {
  //   const { password } = data;
  //   dispatch(resetPassword({ token, password, onPasswordResetSuccess }));
  // };
  const onProceed = () => {
    console.log('onProceed clicked');
  };

  useEffect(() => {
    if (!token) {
      // history.push('/');
    } else {
      setEmail(getEmailFromToken(token));
    }
  }, []);

  function getEmailFromToken(token) {
    const decoded = jwt.decode(token);
    if (localStorage.getItem('litefarm_lang') !== decoded.language_preference) {
      localStorage.setItem('litefarm_lang', decoded.language_preference);
      i18n.changeLanguage(localStorage.getItem('litefarm_lang'));
    }
    return decoded.email;
  }

  //   const [hasTimeoutStarted, setHasTimeoutStarted] = useState(false);
  //   const onPasswordResetSuccess = () => {
  //     setShowModal(true);
  //     setHasTimeoutStarted(true);
  //   };
  // useEffect(() => {
  //   let timeout;
  //   if (hasTimeoutStarted) {
  //     timeout = setTimeout(() => {
  //       history.push('/farm_selection');
  //     }, 10000);
  //   }
  //   return () => clearTimeout(timeout);
  // }, [hasTimeoutStarted]);

  //   const modalOnClick = () => {
  //     history.push('/farm_selection');
  //     setShowModal(false);
  //   };

  return (
    <>
      {/* {token && <PureInviteSignUp email={email} update={onSubmit} />} */}
      {/* <PureInviteSignUp email={email} update={onSubmit} /> */}
      <PureInviteSignUp onProceed={onProceed} disabled={true} />
    </>
  );
}

export default InviteSignUp;
