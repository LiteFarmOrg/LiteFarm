import React, { useEffect } from 'react';
import PureSetCertificationSummary from '../../../components/SetCertificationSummary';
import { useDispatch, useSelector } from 'react-redux';
import { getAllSupportedCertifications } from '../saga';
import history from '../../../history';
import {
  selectedCertifierSelector,
  isRequestingCertifierSelector,
  requestedCertifierSelector,
} from '../organicCertifierSurveySlice';

export default function SetCertificationSummary() {
  const dispatch = useDispatch();
  const name = useSelector(selectedCertifierSelector);
  const isRequesting = useSelector(isRequestingCertifierSelector);
  const requestedCertifierData = useSelector(requestedCertifierSelector);

  useEffect(() => {
    dispatch(getAllSupportedCertifications());
  }, [dispatch]);

  const onSubmit = (data) => {
    console.log('submit');
    history.push('/outro');
  };

  const onGoBack = () => {
    history.push('/certifier_selection_menu');
  };

  return (
    <>
      <PureSetCertificationSummary
        name={name.certifier_name}
        onSubmit={onSubmit}
        onGoBack={onGoBack}
        isRequesting={isRequesting}
        requestedCertifierData={requestedCertifierData}
        // dispatch={dispatch}
      />
    </>
  );
}
