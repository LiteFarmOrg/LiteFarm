import React, { useEffect } from 'react';
import PureCertificationSelection from '../../../components/CertificationSelection';
import { useDispatch, useSelector } from 'react-redux';
import { getAllSupportedCertifications, getAllSupportedCertifiers } from '../saga';
import history from '../../../history';
import {
  setCertificationSelection,
  setCertificationSelectionSelector,
  setcertificationTypesSelector,
  setRequestedCertification,
  setRequestedCertificationSelector,
  selectedCertificationType,
  setCertificationID,
} from '../organicCertifierSurveySlice';

export default function CertificationSelection() {
  const dispatch = useDispatch();
  const certificationType = useSelector(setCertificationSelectionSelector);
  const certificationTypes = useSelector(setcertificationTypesSelector);
  const requestedCertification = useSelector(setRequestedCertificationSelector);

  useEffect(() => {
    dispatch(getAllSupportedCertifications());
  }, [dispatch]);

  const onSubmit = (data) => {
    let certification_id = null;
    certificationTypes.map((type) => {
      if (type.certification_type === certificationType) {
        certification_id = type.certification_id;
      }
    });
    dispatch(setCertificationID(certification_id));
    dispatch(selectedCertificationType(true));
    if (certification_id !== null) dispatch(getAllSupportedCertifiers(certification_id));
    history.push('/certifier_selection_menu');
  };

  const onGoBack = () => {
    history.push('/interested_in_organic');
  };

  return (
    <>
      <PureCertificationSelection
        onSubmit={onSubmit}
        onGoBack={onGoBack}
        dispatch={dispatch}
        setCertificationSelection={setCertificationSelection}
        certificationType={certificationType}
        certificationTypes={certificationTypes}
        setRequestedCertification={setRequestedCertification}
        requestedCertification={requestedCertification}
        setCertificationID={setCertificationID}
      />
    </>
  );
}
