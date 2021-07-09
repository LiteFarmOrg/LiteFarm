import React, { useEffect } from 'react';
import PureCertificationSelection from '../../../components/OrganicCertifierSurvey/CertificationSelection';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllSupportedCertifications,
  getAllSupportedCertifiers,
  patchRequestedCertification,
} from '../saga';
import history from '../../../history';
import {
  finishedSelectingCertificationType,
  selectedCertification,
  selectedCertificationSelector,
} from '../organicCertifierSurveySlice';
import { userFarmSelector } from '../../userFarmSlice';
import { certificationsSelector } from '../certificationSlice';
import { certifiersByCertificationSelector } from '../certifierSlice';

export default function CertificationSelection() {
  const dispatch = useDispatch();
  const allSupportedCertificationTypes = useSelector(certificationsSelector);
  const certification = useSelector(selectedCertificationSelector);
  const role = useSelector(userFarmSelector);
  const allSupportedCertifiers = useSelector(
    certifiersByCertificationSelector(certification.certification_id),
  );
  useEffect(() => {
    dispatch(getAllSupportedCertifications());
  }, [dispatch]);

  useEffect(() => {
    if (certification.certification_id) {
      dispatch(getAllSupportedCertifiers(certification.certification_id));
    }
  }, [certification.certification_id]);

  const onSubmit = () => {
    dispatch(finishedSelectingCertificationType(true));

    let data = {
      requested_certification: null,
      certification_id: null,
    };
    if (!certification.certification_id) {
      data.requested_certification = certification.requestedCertification;
    } else {
      data.certification_id = certification.certification_id;
    }

    const callback = () => {
      !certification.certification_id
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
