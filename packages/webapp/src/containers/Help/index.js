import React, { useState } from 'react';
import PureHelpRequestPage from '../../components/Help';
import { useDispatch } from 'react-redux';
import { supportFileUpload } from './saga';
import history from '../../history';
export default function HelpRequest() {
  const dispatch = useDispatch();

  const handleSubmit = (file, data) => {
    dispatch(supportFileUpload({ file, form: data }));
  };
  const handleBack = () => {
    history.push('/');
  };

  return <PureHelpRequestPage onSubmit={handleSubmit} goBack={handleBack} />;
}
