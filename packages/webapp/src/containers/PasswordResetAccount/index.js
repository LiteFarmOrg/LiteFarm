import React, { Suspense, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import PureResetPasswordAccount from '../../components/PasswordResetAccount';
import { manualSignUpSelector } from '../CustomSignUp/signUpSlice';

function PasswordResetAccount() {
  const email = useSelector(manualSignUpSelector);
  const { register, handleSubmit, errors, watch, setValue, setError } = useForm({ mode: 'onBlur' });
  const onSubmit = (data) => {
    // const { email } = data;
    console.log(email)
    // dispatch(customSignUp({ email, showSSOError }));
  };
  return (
    <>
     
    <PureResetPasswordAccount
        email={email.userEmail}
        update={handleSubmit(onSubmit)}
        // disabled={disabled}
        // inputs={[
        // {
        //     label: 'Enter your email address',
        //     inputRef: refInput,
        //     name: EMAIL,
        //     errors: errors[EMAIL] && (errors[EMAIL].message || 'Email is invalid'),
        // },
        // ]}
    />
    </>
  );
}

export default PasswordResetAccount;
