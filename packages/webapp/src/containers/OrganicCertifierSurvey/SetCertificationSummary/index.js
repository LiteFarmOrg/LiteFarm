import React from 'react';
import PureSetCertificationSummary from '../../../components/SetCertificationSummary';
import { useDispatch, useSelector } from 'react-redux';
import { patchStepFour } from '../saga';
import history from '../../../history';
import {
  selectedCertifierSelector,
  isRequestingCertifierSelector,
  requestedCertifierSelector,
  setCertificationSelectionSelector,
} from '../organicCertifierSurveySlice';

export default function SetCertificationSummary() {
  const dispatch = useDispatch();
  const name = useSelector(selectedCertifierSelector);
  const isRequesting = useSelector(isRequestingCertifierSelector);
  const requestedCertifierData = useSelector(requestedCertifierSelector);
  const certificationType = useSelector(setCertificationSelectionSelector);

  const onSubmit = () => {
    dispatch(patchStepFour());
    setTimeout(() => {
      history.push('/outro');
    }, 100);
  };

  const onGoBack = () => {
    isRequesting ? history.push('/requested_certifier') : history.push('/certifier_selection_menu');
  };

  return (
    <>
      <PureSetCertificationSummary
        name={isRequesting ? requestedCertifierData : name.certifier_name}
        onSubmit={onSubmit}
        onGoBack={onGoBack}
        isRequesting={isRequesting}
        certificationType={certificationType}
      />
    </>
  );
}
