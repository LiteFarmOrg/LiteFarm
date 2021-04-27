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
  // All supported certification types
  allCertificationTypesSelector,
  // Selected certification
  selectedCertificationSelector,
  selectedCertification,
  finishedSelectingCertificationType,
  setCertificationSelection,
  setCertificationSelectionSelector,
  setRequestedCertification,
  setRequestedCertificationSelector,
  setCertificationID,
} from '../organicCertifierSurveySlice';
import { userFarmSelector } from '../../userFarmSlice';

export default function CertificationSelection() {
  const dispatch = useDispatch();
  const allSupportedCertificationTypes = useSelector(allCertificationTypesSelector);
  const certification = useSelector(selectedCertificationSelector);

  const certificationType = useSelector(setCertificationSelectionSelector);

  const requestedCertification = useSelector(setRequestedCertificationSelector);
  const role = useSelector(userFarmSelector);

  useEffect(() => {
    dispatch(getAllSupportedCertifications());
  }, [dispatch]);

  const onSubmit = (info) => {
    // let certification_id = null;
    // allSupportedCertificationTypes.map((type) => {
    //   if (type.certification_type === certificationType) {
    //     certification_id = type.certification_id;
    //   }
    // });
    // dispatch(setCertificationID(certification_id));
    dispatch(finishedSelectingCertificationType(true));
    const callback = () => {
      !certification.certificationID
        ? history.push('/requested_certifier')
        : history.push('/certifier_selection_menu');
    };
    let data = {
      requested_certification: null,
      certification_id: null,
    };
    if (!certification.certificationID) {
      data.requested_certification = certification.requestedCertification;
    } else {
      data.certification_id = certification.certificationID;
    }
    if (certification.certificationID)
      dispatch(getAllSupportedCertifiers(certification.certificationID));
    setTimeout(() => {
      dispatch(patchRequestedCertification({ data, callback }));
    }, 100);
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
        allSupportedCertificationTypes={allSupportedCertificationTypes}
        certification={certification}
        selectedCertification={selectedCertification}
        setCertificationSelection={setCertificationSelection}
        certificationType={certificationType}
        setRequestedCertification={setRequestedCertification}
        requestedCertification={requestedCertification}
        setCertificationID={setCertificationID}
        role_id={role.role_id}
      />
    </>
  );
}
