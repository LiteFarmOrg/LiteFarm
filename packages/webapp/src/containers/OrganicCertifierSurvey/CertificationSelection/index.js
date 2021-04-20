import React, { useEffect } from 'react';
import PureCertificationSelection from '../../../components/CertificationSelection';
import { useDispatch, useSelector } from 'react-redux';
import { getAllSupportedCertifications } from '../saga';
import history from '../../../history';
import {
  setCertificationSelection,
  setCertificationSelectionSelector,
  setcertificationTypesSelector,
  setRequestedCertification,
  setRequestedCertificationSelector,
} from '../organicCertifierSurveySlice';

export default function CertificationSelection() {
  const dispatch = useDispatch();
  const selectedCertificationType = useSelector(setCertificationSelectionSelector);
  const certificationTypes = useSelector(setcertificationTypesSelector);
  const requestedCertification = useSelector(setRequestedCertificationSelector);

  useEffect(() => {
    dispatch(getAllSupportedCertifications());
  }, [dispatch]);

  const onSubmit = (data) => {
    console.log(data);
    //   const interested = data.interested === 'true';
    //   const callback = () =>
    //     interested ? history.push('/organic_partners') : history.push('/outro');
    //   if (survey.survey_id) {
    //     dispatch(patchInterested({ interested, callback }));
    //   } else {
    //     dispatch(postCertifiers({ survey: { interested }, callback }));
    //   }
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
        selectedCertificationType={selectedCertificationType}
        certificationTypes={certificationTypes}
        setRequestedCertification={setRequestedCertification}
        requestedCertification={requestedCertification}
      />
    </>
  );
}
