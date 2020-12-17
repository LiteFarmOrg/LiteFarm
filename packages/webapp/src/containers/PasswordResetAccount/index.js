import React, { Suspense, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import PureResetPasswordAccount from '../../components/PasswordResetAccount';
import { manualSignUpSelector } from '../CustomSignUp/signUpSlice';
import { resetPassword, validateToken } from './saga';

function PasswordResetAccount({ history }) {
  const email = useSelector(manualSignUpSelector);
  const dispatch = useDispatch();
  const params = new URLSearchParams(history.location.search.substring(1));
  const { register, handleSubmit, errors, watch, setValue, setError } = useForm({ mode: 'onBlur' });
  const onSubmit = (data) => {
    dispatch(resetPassword());
  };

  useEffect(() => {
    const token = params.get('reset_token');
    const email = getEmailFromToken();
    dispatch(validateToken({ token }));
  }, []);

  function getEmailFromToken(token) {
    // either find a library or do base64Decode(token.split('.')[1]) < JSON.parse that.
  }
  return (
    <>
      <PureResetPasswordAccount email={email.userEmail} update={handleSubmit(onSubmit)} />
    </>
  );
}

export default PasswordResetAccount;
