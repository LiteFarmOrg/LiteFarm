import React from 'react';
import PureSetCertificationSummary from '../../../components/SetCertificationSummary';
import { useDispatch, useSelector } from 'react-redux';
import { patchStepFour } from '../saga';
import history from '../../../history';
import {
  selectedCertifierSelector,
  selectedCertificationSelector,
  requestedCertifierSelector,
  allCertifierTypesSelector,
} from '../organicCertifierSurveySlice';

export default function SetCertificationSummary() {
  const dispatch = useDispatch();
  const certifierType = useSelector(selectedCertifierSelector);
  const requestedCertifierData = useSelector(requestedCertifierSelector);
  const certificationType = useSelector(selectedCertificationSelector);
  const allSupportedCertifierTypes = useSelector(allCertifierTypesSelector);

  console.log(requestedCertifierData);

  const onSubmit = () => {
    dispatch(patchStepFour());
    setTimeout(() => {
      history.push('/outro');
    }, 100);
  };

  const onGoBack = () => {
    certificationType.certificationName === 'Other'
      ? history.push('/certification_selection')
      : allSupportedCertifierTypes.length < 1
      ? history.push('/certification_selection')
      : history.push('/certifier_selection_menu');
  };

  return (
    <>
      <PureSetCertificationSummary
        name={requestedCertifierData ? requestedCertifierData : certifierType.certifierName}
        requestedCertifierData={requestedCertifierData}
        onSubmit={onSubmit}
        onGoBack={onGoBack}
        certificationType={certificationType}
      />
    </>
  );
}
