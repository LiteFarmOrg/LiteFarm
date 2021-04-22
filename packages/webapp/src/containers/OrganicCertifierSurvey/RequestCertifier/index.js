import React, { useEffect } from 'react';
import PureRequestCertifier from '../../../components/RequestCertifier';
import { useDispatch, useSelector } from 'react-redux';
import { patchRequestedCertifiers, getAllSupportedCertifications } from '../saga';
import history from '../../../history';
import { requestedCertifier, requestedCertifierSelector } from '../organicCertifierSurveySlice';

export default function RequestCertifier() {
  const dispatch = useDispatch();
  const requestedCertifierData = useSelector(requestedCertifierSelector);

  useEffect(() => {
    dispatch(getAllSupportedCertifications());
  }, [dispatch]);

  const onSubmit = (info) => {
    const data = info.requestedCertifier;
    const callback = () => history.push('certification_summary');
    dispatch(patchRequestedCertifiers({ data, callback }));
  };

  const onGoBack = () => {
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
