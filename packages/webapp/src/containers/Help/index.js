import React, { useState } from 'react';
import PureHelpRequestPage from '../../components/Help';
import { useDispatch, useSelector } from 'react-redux';
import { supportFileUpload } from './saga';
import history from '../../history';
import { userFarmSelector } from '../userFarmSlice';
export default function HelpRequest() {
  const dispatch = useDispatch();

  const handleSubmit = (file, data) => {
    dispatch(supportFileUpload({ file, form: data }));
  };
  const handleBack = () => {
    history.push('/');
  };
  const { email, phone_number } = useSelector(userFarmSelector);
  return (
    <PureHelpRequestPage
      onSubmit={handleSubmit}
      goBack={handleBack}
      email={email}
      phone_number={phone_number}
    />
  );
}
