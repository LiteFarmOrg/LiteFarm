import { useDispatch, useSelector } from 'react-redux';
import { certifierSurveySelector } from '../slice';
import PureViewSupportedCertification from '../../../components/ViewCertification/PureViewSupportedCertification';
import PureViewUnsupportedCertification from '../../../components/ViewCertification/PureViewUnsupportedCertification';
import PureViewNotInterestedInCertification from '../../../components/ViewCertification/PureViewNotInterestedInCertification';

import { certifiersByCertificationSelector, certifierSelector } from '../certifierSlice';
import { useEffect } from 'react';
import { getCertificationSurveys } from '../saga';
import { certificationSelector } from '../certificationSlice';
import { useTranslation } from 'react-i18next';

export default function ViewCertification({ history }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getCertificationSurveys());
  }, []);
  const { interested } = useSelector(certifierSurveySelector);
  const organicSurvey = useSelector(certifierSurveySelector);
  const certification = useSelector(certificationSelector);
  const certificationName = t(`certifications:${certification?.certification_translation_key}`);
  const certifier = useSelector(certifierSelector);

  const allSupportedCertifierTypes = useSelector(
    certifiersByCertificationSelector(certification?.certification_id),
  );

  const isNotSupported =
    certification?.certificationName === 'Other' || allSupportedCertifierTypes.length < 1;
  const onExport = () => {
    history.push('/certification/report_period');
  };
  const onAddCertification = () => history.push('/certification/interested_in_organic');
  const onChangePreference = onAddCertification;
  const showSuccessSnackBar = history.location?.state?.success;

  return (
    <>
      {!interested ? (
        <PureViewNotInterestedInCertification
          showSuccessSnackBar={showSuccessSnackBar}
          onAddCertification={onAddCertification}
        />
      ) : isNotSupported ? (
        <PureViewUnsupportedCertification
          showSuccessSnackBar={showSuccessSnackBar}
          onExport={onExport}
          onChangeCertificationPreference={onChangePreference}
          unsupportedCertificationName={certificationName}
          unsupportedCertifierName={organicSurvey.requested_certifier}
        />
      ) : (
        <PureViewSupportedCertification
          showSuccessSnackBar={showSuccessSnackBar}
          onExport={onExport}
          onChangeCertificationPreference={onChangePreference}
          supportedCertificationName={certificationName}
          supportedCertifier={certifier}
        />
      )}
    </>
  );
}
