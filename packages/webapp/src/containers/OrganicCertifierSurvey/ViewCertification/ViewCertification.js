import { useDispatch, useSelector } from 'react-redux';
import { certifierSurveySelector } from '../slice';
import PureViewSupportedCertification from '../../../components/ViewCertification/PureViewSupportedCertification';
import PureViewUnsupportedCertification from '../../../components/ViewCertification/PureViewUnsupportedCertification';
import PureViewNotInterestedInCertification from '../../../components/ViewCertification/PureViewNotInterestedInCertification';

import { certifiersByCertificationSelector, certifierSelector } from '../certifierSlice';
import { useEffect } from 'react';
import { getCertificationSurveys } from '../saga';
import { certificationSelector } from '../certificationSlice';

export default function ViewCertification({ history }) {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getCertificationSurveys());
  }, []);
  const { interested } = useSelector(certifierSurveySelector);
  const organicSurvey = useSelector(certifierSurveySelector);
  const certification = useSelector(certificationSelector);
  const certifier = useSelector(certifierSelector);

  const allSupportedCertifierTypes = useSelector(
    certifiersByCertificationSelector(certification.certification_id),
  );
  const isNotSupported =
    certification.certificationName === 'Other' || allSupportedCertifierTypes.length < 1;
  const onExport = () => {};
  const onAddCertification = () => history.push('/certification/interested_in_organic');
  const onChangePreference = onAddCertification;

  return (
    <>
      {!interested ? (
        <PureViewNotInterestedInCertification onAddCertification={onAddCertification} />
      ) : isNotSupported ? (
        <PureViewUnsupportedCertification
          onExport={onExport}
          onChangeCertificationPreference={onChangePreference}
          unsupportedCertification={certification.certification_type}
          unsupportedCertifier={certifier.certifier_name || organicSurvey.requested_certifier}
        />
      ) : (
        <PureViewSupportedCertification
          onExport={onExport}
          onChangeCertificationPreference={onChangePreference}
          supportedCertification={certification}
          supportedCertifier={certifier}
        />
      )}
    </>
  );
}
