import React, { useEffect } from 'react';
import PureCertificationSelection from '../../../components/CertificationSelection';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllSupportedCertifications,
  getAllSupportedCertifiers,
  patchRequestedCertification,
} from '../saga';
import history from '../../../history';
import {
  allCertificationTypesSelector,
  allCertifierTypesSelector,
  finishedSelectingCertificationType,
  selectedCertification,
  selectedCertificationSelector,
} from '../organicCertifierSurveySlice';
import { userFarmSelector } from '../../userFarmSlice';

export default function CertificationSelection() {
  const dispatch = useDispatch();
  const allSupportedCertificationTypes = useSelector(allCertificationTypesSelector);
  const certification = useSelector(selectedCertificationSelector);
  const role = useSelector(userFarmSelector);
  const allSupportedCertifiers = useSelector(allCertifierTypesSelector);

  useEffect(() => {
    dispatch(getAllSupportedCertifications());
  }, [dispatch]);

  useEffect(() => {
    if (certification.certificationID) {
      dispatch(getAllSupportedCertifiers(certification.certificationID));
    }
  }, [certification.certificationID]);

  const onSubmit = () => {
    dispatch(finishedSelectingCertificationType(true));

    let data = {
      requested_certification: null,
      certification_id: null,
    };
    if (!certification.certificationID) {
      data.requested_certification = certification.requestedCertification;
    } else {
      data.certification_id = certification.certificationID;
    }

    const callback = () => {
      !certification.certificationID
        ? history.push('/certification/certifier/request')
        : allSupportedCertifiers.length === 0
        ? history.push('/certification/certifier/request')
        : history.push('/certification/certifier/selection');
    };

    dispatch(patchRequestedCertification({ data, callback }));
  };

  const onGoBack = () => {
    history.push('/certification/interested_in_organic');
  };

  return (
    <>
      <PureCertificationSelection
        onSubmit={onSubmit}
        onGoBack={onGoBack}
        dispatch={dispatch}
        allSupportedCertificationTypes={allSupportedCertificationTypes}
        certification={certification}
        selectedCertification={selectedCertification}
        role_id={role.role_id}
      />
    </>
  );
}
