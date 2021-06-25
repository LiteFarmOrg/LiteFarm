import React from 'react';
import PureSetCertificationSummary from '../../../components/SetCertificationSummary';
import { useSelector } from 'react-redux';
import {
  allCertificationTypesSelector,
  allCertifierTypesSelector,
  requestedCertifierSelector,
  selectedCertificationSelector,
  selectedCertifierSelector,
} from '../organicCertifierSurveySlice';

export default function UpdateSetCertificationSummary({ history }) {
  const certifierType = useSelector(selectedCertifierSelector);
  const requestedCertifierData = useSelector(requestedCertifierSelector);
  const certificationType = useSelector(selectedCertificationSelector);
  const allSupportedCertificationTypes = useSelector(allCertificationTypesSelector);
  const selectedCertificationTranslation = allSupportedCertificationTypes.find(
    (cert) => cert.certification_id === certificationType.certificationID,
  )?.certification_translation_key;
  const allSupportedCertifierTypes = useSelector(allCertifierTypesSelector);

  const onSubmit = () => {
    history.push('/view_certification');
  };

  const onGoBack = () => {
    certificationType.certificationName === 'Other'
      ? history.push('/requested_certifier')
      : allSupportedCertifierTypes.length < 1
      ? history.push('/requested_certifier')
      : history.push('/certifier_selection_menu');
  };

  return (
    <>
      <PureSetCertificationSummary
        name={requestedCertifierData ? requestedCertifierData : certifierType.certifierName}
        requestedCertifierData={requestedCertifierData}
        onSubmit={onSubmit}
        onGoBack={onGoBack}
        allSupportedCertificationTypes={allSupportedCertificationTypes}
        certificationType={certificationType}
        certificationTranslation={selectedCertificationTranslation}
      />
    </>
  );
}
