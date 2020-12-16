import Floater from 'react-floater';
import React, { useState } from 'react';
import PureResetPassword from '../../components/ResetPassword';
import { sendResetPasswordEmail } from '../CustomSignUp/saga';
import { useDispatch } from 'react-redux';

export default function ResetPassword({ children, email }) {
  const [changeText, setChangeText] = useState(false);

  const dispatch = useDispatch();

  const resendLink = () => {
    setChangeText(true);
    dispatch(sendResetPasswordEmail(email));
    setTimeout(() => {
      setChangeText(false);
    }, 3000);
  };

  const Wrapper = <PureResetPassword resendLink={resendLink} changeText={changeText} />;
  return (
    <Floater
      autoOpen
      component={Wrapper}
      placement={'center'}
      styles={{ floaterCentered: { transform: 'translate(-50%, -70%)' } }}
    >
      {children}
    </Floater>
  );
}
