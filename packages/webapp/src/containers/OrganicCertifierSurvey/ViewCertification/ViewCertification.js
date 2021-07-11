import { useDispatch, useSelector } from 'react-redux';
import { certifierSurveySelector } from '../slice';
import PureViewSupportedCertification from '../../../components/OrganicCertifierSurvey/ViewCertification/PureViewSupportedCertification';
import PureViewUnsupportedCertification from '../../../components/OrganicCertifierSurvey/ViewCertification/PureViewUnsupportedCertification';
import PureViewNotInterestedInCertification from '../../../components/OrganicCertifierSurvey/ViewCertification/PureViewNotInterestedInCertification';

import { certifiersByCertificationSelector, certifierSelector } from '../certifierSlice';
import { useEffect } from 'react';
import {
  getAllSupportedCertifications,
  getAllSupportedCertifiers,
  getCertificationSurveys,
} from '../saga';
import { certificationSelector } from '../certificationSlice';
import { useTranslation } from 'react-i18next';

export default function ViewCertification({ history }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getCertificationSurveys());
    dispatch(getAllSupportedCertifications());
    dispatch(getAllSupportedCertifiers());
  }, []);
  const { interested } = useSelector(certifierSurveySelector);
  const survey = useSelector(certifierSurveySelector);
  const certification = useSelector(certificationSelector);
  const certificationName = t(`certifications:${certification?.certification_translation_key}`);
  const certifier = useSelector(certifierSelector);

  const allSupportedCertifierTypes = useSelector(
    certifiersByCertificationSelector(certification?.certification_id),
  );

  const isNotSupported = survey?.requested_certification || survey?.requested_certifier;
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
          unsupportedCertifierName={survey.requested_certifier}
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
