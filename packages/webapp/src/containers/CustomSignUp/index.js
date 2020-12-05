import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import history from '../../history';
import  PureCustomSignUp from '../../components/CustomSignUp';
// import {manualSignUpSuccess} from "./slice";

function CustomSignUp() {
  const { register, handleSubmit, errors, watch, setValue } = useForm();
  const validEmailRegex = RegExp(/^$|^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i);
  const EMAIL = 'email';
  const email = watch(EMAIL, undefined);
  const required = watch(EMAIL, false);
  const refInput = register({ pattern: /^$|^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i });

  const disabled = !email || !required || !validEmailRegex.test(email);
  

  const onSubmit = (data) => {
    console.log("on submit")
    console.log(data[EMAIL])
    console.log("required is")
    console.log(required)
    console.log("email is")
    console.log(validEmailRegex.test(email))
  }
  
  const dispatch = useDispatch();

  const ssoSignUp = () => {

  }

  return (
    <PureCustomSignUp onSubmit={handleSubmit(onSubmit)} 
                      ssoSignUp={ssoSignUp} 
                      disabled={disabled}
                      inputs={[{
                        label: 'Enter your email address',
                        inputRef: refInput,
                        name: EMAIL,
                        errors: errors[EMAIL] && 'Email is invalid',
                        autoFocus: required,
                        
                      }]}
                      />
                      
  )

}


export default CustomSignUp;