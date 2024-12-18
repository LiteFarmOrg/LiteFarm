import { useDispatch, useSelector } from 'react-redux';
import { certifierSurveySelector } from '../slice';
import PureViewSupportedCertification from '../../../components/OrganicCertifierSurvey/ViewCertification/PureViewSupportedCertification';
import PureViewUnsupportedCertification from '../../../components/OrganicCertifierSurvey/ViewCertification/PureViewUnsupportedCertification';
import PureViewNotInterestedInCertification from '../../../components/OrganicCertifierSurvey/ViewCertification/PureViewNotInterestedInCertification';

import { certifierSelector } from '../certifierSlice';
import { useEffect } from 'react';
import {
  getAllSupportedCertifications,
  getAllSupportedCertifiers,
  getCertificationSurveys,
} from '../saga';
import { useTranslation } from 'react-i18next';
import { resetAndUnLockFormData } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { useCertificationName } from '../useCertificationName';
import { useNavigate } from 'react-router-dom';

export default function ViewCertification() {
  let navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getCertificationSurveys());
    dispatch(getAllSupportedCertifications());
    dispatch(getAllSupportedCertifiers());
  }, []);
  const { interested } = useSelector(certifierSurveySelector);
  const survey = useSelector(certifierSurveySelector);
  const { certificationName } = useCertificationName();
  const certifier = useSelector(certifierSelector);
  const isNotSupported = survey?.requested_certification || survey?.requested_certifier;
  const onExport = () => {
    navigate('/certification/report_period');
  };
  const onAddCertification = () => {
    dispatch(resetAndUnLockFormData());
    navigate('/certification/interested_in_organic');
  };
  const onChangePreference = onAddCertification;
  const showSuccessSnackBar = location?.state?.success;

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
