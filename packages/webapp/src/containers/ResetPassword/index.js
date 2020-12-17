import React, { useState } from 'react';
import ResetPasswordModal from '../../components/Modals/ResetPassword';
import { sendResetPasswordEmail } from '../CustomSignUp/saga';
import { useDispatch } from 'react-redux';

export default function ResetPassword({ email, dismissModal }) {
  const [changeText, setChangeText] = useState(false);

  const dispatch = useDispatch();

  const resendLink = () => {
    setChangeText(true);
    dispatch(sendResetPasswordEmail(email));
    setTimeout(() => {
      setChangeText(false);
    }, 3000);
  };

  return (
    <ResetPasswordModal onClick={resendLink} changeText={changeText} dismissModal={dismissModal} />
  );
}
