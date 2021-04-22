import React, { useEffect } from 'react';
import PureCertifierSelectionScreen from '../../../components/CertifierSelection';
import { useDispatch, useSelector } from 'react-redux';
import history from '../../../history';
import {
  certificationIDSelector,
  setCertifiersSelector,
  isRequestingCertifier,
  selectedCertifier,
  selectedCertifierSelector,
  loadSummary,
  isRequestingCertifierSelector,
} from '../organicCertifierSurveySlice';
import { userFarmSelector } from '../../userFarmSlice';

export default function CertifierSelectionMenu() {
  const dispatch = useDispatch();
  const certificationID = useSelector(certificationIDSelector);
  let emptyCertifiers = [];
  let certifiers = useSelector(setCertifiersSelector);
  const certifierSelected = useSelector(selectedCertifierSelector);
  const role = useSelector(userFarmSelector);

  const onSubmit = (data) => {
    dispatch(loadSummary(true));
    history.push('/certification_summary');
  };

  const onBack = () => {
    history.push('/certification_selection');
  };

  const isRequesting = useSelector(isRequestingCertifierSelector);

  return (
    <>
      <PureCertifierSelectionScreen
        onSubmit={onSubmit}
        certificationIDSelector={certificationIDSelector}
        certifiers={certificationID !== null ? certifiers : emptyCertifiers}
        onBack={onBack}
        isRequestingCertifier={isRequestingCertifier}
        dispatch={dispatch}
        history={history}
        selectedCertifier={selectedCertifier}
        certifierSelected={certifierSelected}
        isRequesting={isRequesting}
        role_id={role.role_id}
      />
    </>
  );
}
