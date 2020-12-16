import React, { Suspense, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import PureResetPasswordAccount from '../../components/PasswordResetAccount';
import { manualSignUpSelector } from '../CustomSignUp/signUpSlice';
import { resetPassword } from './saga';

function PasswordResetAccount() {
  const email = useSelector(manualSignUpSelector);
  const dispatch = useDispatch();
  const { register, handleSubmit, errors, watch, setValue, setError } = useForm({ mode: 'onBlur' });
  const onSubmit = (data) => {
    dispatch(resetPassword());
  };
  return (
    <>
      <PureResetPasswordAccount email={email.userEmail} update={handleSubmit(onSubmit)} />
    </>
  );
}

export default PasswordResetAccount;
