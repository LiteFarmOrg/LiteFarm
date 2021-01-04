import React, { useState } from 'react';
import PureHelpRequestPage from '../../components/Help';
import { useDispatch } from 'react-redux';
import {supportFileUpload} from "./saga";

export default function HelpRequest() {
  const dispatch = useDispatch();

  const handleSubmit = (file, data) => {
    dispatch(supportFileUpload({file, form: data}))
  }

  return (
    <PureHelpRequestPage onSubmit={handleSubmit} />
  );
}
