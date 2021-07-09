import React, { useEffect } from 'react';
import PureRequestCertifier from '../../../components/OrganicCertifierSurvey/RequestCertifier';
import { useDispatch, useSelector } from 'react-redux';
import { getAllSupportedCertifications, patchRequestedCertifiers } from '../saga';
import history from '../../../history';
import {
  requestedCertifier,
  requestedCertifierSelector,
  selectedCertificationSelector,
} from '../organicCertifierSurveySlice';
import { certifiersByCertificationSelector } from '../certifierSlice';

export default function RequestCertifier() {
  const dispatch = useDispatch();
  const requestedCertifierData = useSelector(requestedCertifierSelector);
  const certification = useSelector(selectedCertificationSelector);
  const allSupportedCertifierTypes = useSelector(
    certifiersByCertificationSelector(certification.certification_id),
  );

  useEffect(() => {
    dispatch(getAllSupportedCertifications());
  }, [dispatch]);

  const onSubmit = (info) => {
    const callback = () => history.push('/certification/summary');
    let data = {
      requested_certifier: info.requestedCertifier,
      certifier_id: null,
    };
    dispatch(patchRequestedCertifiers({ data, callback }));
  };

  const onGoBack = () => {
    certification.certificationName === 'Other'
      ? history.push('/certification/selection')
      : allSupportedCertifierTypes.length < 1
      ? history.push('/certification/selection')
      : history.push('/certification/certifier/selection');
  };

  return (
    <>
      <PureRequestCertifier
        onSubmit={onSubmit}
        onGoBack={onGoBack}
        requestedCertifier={requestedCertifier}
        requestedCertifierData={requestedCertifierData}
        dispatch={dispatch}
        certificationType={certification}
        allSupportedCertifierTypes={allSupportedCertifierTypes}
      />
    </>
  );
}
