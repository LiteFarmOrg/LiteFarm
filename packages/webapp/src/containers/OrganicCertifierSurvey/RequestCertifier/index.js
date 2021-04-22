import React, { useEffect } from 'react';
import PureRequestCertifier from '../../../components/RequestCertifier';
import { useDispatch, useSelector } from 'react-redux';
import { getAllSupportedCertifications } from '../saga';
import history from '../../../history';
import { requestedCertifier, requestedCertifierSelector } from '../organicCertifierSurveySlice';

export default function RequestCertifier() {
  const dispatch = useDispatch();
  const requestedCertifierData = useSelector(requestedCertifierSelector);

  useEffect(() => {
    dispatch(getAllSupportedCertifications());
  }, [dispatch]);

  const onSubmit = (data) => {
    history.push('certification_summary');
  };

  const onGoBack = () => {
    console.log('go back');
    history.push('/certifier_selection_menu');
  };

  return (
    <>
      <PureRequestCertifier
        onSubmit={onSubmit}
        onGoBack={onGoBack}
        requestedCertifier={requestedCertifier}
        requestedCertifierData={requestedCertifierData}
        dispatch={dispatch}
      />
    </>
  );
}
