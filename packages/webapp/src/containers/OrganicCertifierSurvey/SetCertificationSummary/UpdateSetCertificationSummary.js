import React from 'react';
import PureSetCertificationSummary from '../../../components/SetCertificationSummary';
import { useSelector } from 'react-redux';
import {
  requestedCertifierSelector,
  selectedCertificationSelector,
  selectedCertifierSelector,
} from '../organicCertifierSurveySlice';
import { certificationsSelector } from '../certificationSlice';
import { certifiersByCertificationSelector } from '../certifierSlice';

export default function UpdateSetCertificationSummary({ history }) {
  const certifierType = useSelector(selectedCertifierSelector);
  const requestedCertifierData = useSelector(requestedCertifierSelector);
  const certification = useSelector(selectedCertificationSelector);
  const allSupportedCertificationTypes = useSelector(certificationsSelector);
  const selectedCertificationTranslation = allSupportedCertificationTypes.find(
    (cert) => cert.certification_id === certification.certification_id,
  )?.certification_translation_key;
  const allSupportedCertifierTypes = useSelector(
    certifiersByCertificationSelector(certification.certification_id),
  );

  const onSubmit = () => {
    history.push('/certification', { success: true });
  };

  const onGoBack = () => {
    certification.certificationName === 'Other'
      ? history.push('/certification/certifier/request')
      : allSupportedCertifierTypes.length < 1
      ? history.push('/certification/certifier/request')
      : history.push('/certification/certifier/selection');
  };

  return (
    <>
      <PureSetCertificationSummary
        name={requestedCertifierData ? requestedCertifierData : certifierType.certifierName}
        requestedCertifierData={requestedCertifierData}
        onSubmit={onSubmit}
        onGoBack={onGoBack}
        allSupportedCertificationTypes={allSupportedCertificationTypes}
        certificationType={certification}
        certificationTranslation={selectedCertificationTranslation}
      />
    </>
  );
}
