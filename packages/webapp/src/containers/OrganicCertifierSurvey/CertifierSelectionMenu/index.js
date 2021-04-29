import React from 'react';
import PureCertifierSelectionScreen from '../../../components/CertifierSelection';
import { useDispatch, useSelector } from 'react-redux';
import history from '../../../history';
import {
  allCertifierTypesSelector,
  selectedCertificationSelector,
  selectedCertifierSelector,
  selectedCertifier,
  loadSummary,
  requestedCertifier,
  allCertificationTypesSelector,
} from '../organicCertifierSurveySlice';
import { userFarmSelector } from '../../userFarmSlice';
import { patchRequestedCertifiers } from '../saga';

export default function CertifierSelectionMenu() {
  const dispatch = useDispatch();
  const allSupportedCertifiers = useSelector(allCertifierTypesSelector);
  const allSupportedCertifiersCopy = JSON.parse(
    JSON.stringify(allSupportedCertifiers),
  ).sort((a, b) => (a.certifier_name > b.certifier_name ? 1 : -1));
  const certificationType = useSelector(selectedCertificationSelector);
  const certifierType = useSelector(selectedCertifierSelector);
  const allSupportedCertificationTypes = useSelector(allCertificationTypesSelector);
  const role = useSelector(userFarmSelector);

  const onSubmit = () => {
    console.log(certifierType);
    dispatch(requestedCertifier(null));
    dispatch(loadSummary(true));
    const callback = () => history.push('certification_summary');
    let data = {
      requested_certifier: null,
      certifier_id: certifierType.certifierID,
    };

    dispatch(patchRequestedCertifiers({ data, callback }));
  };

  const onBack = () => {
    history.push('/certification_selection');
  };

  return (
    <>
      <PureCertifierSelectionScreen
        onSubmit={onSubmit}
        allSupportedCertifiers={allSupportedCertifiersCopy}
        certificationType={certificationType}
        allSupportedCertificationTypes={allSupportedCertificationTypes}
        selectedCertifier={selectedCertifier}
        certifierType={certifierType}
        onBack={onBack}
        dispatch={dispatch}
        history={history}
        role_id={role.role_id}
        requestedCertifier={requestedCertifier}
      />
    </>
  );
}
